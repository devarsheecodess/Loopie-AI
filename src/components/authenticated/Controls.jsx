import { useState, useRef } from 'react'
import { useAtom } from 'jotai';
import { Calendar, Circle, Eye, LayoutDashboard, MessagesSquare, Mic, Settings, Trash } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { settingsVisibleAtom, calendarVisibleAtom, credentialsAtom, chatVisibleAtom, dashboardVisibleAtom, screenshotAtom } from '../../lib/atoms'
import { addMessage, removeTypingIndicator, showTypingIndicator } from "../../functions/chatElements";
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LoopieLogo from "@/assets/loopie-logo.png";

const Controls = ({ responseRef }) => {
	const win = getCurrentWindow()

	const [settingsModal, setSettingsModal] = useAtom(settingsVisibleAtom);
	const [calendarModal, setCalendarModal] = useAtom(calendarVisibleAtom);
	const [isRecording, setIsRecording] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [credentials] = useAtom(credentialsAtom);
	const [pendingScreenshot, setPendingScreenshot] = useAtom(screenshotAtom);
	const GROQ_API_KEY = credentials.groqKey || import.meta.env.VITE_GROQ_KEY;
	const GEMINI_API_KEY = credentials.geminiKey || import.meta.env.VITE_GEMINI_KEY;
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
	const CLOUDFARE_BACKEND_URL = import.meta.env.VITE_CLOUDFARE_BACKEND_URL;
	const [chatModal, setChatModal] = useAtom(chatVisibleAtom);
	const [dashboardModal, setDashboardModal] = useAtom(dashboardVisibleAtom);

	const handleMicrophone = async () => {
		if (!GROQ_API_KEY) {
			addMessage(responseRef, "system", "Please set your GROQ API key in the settings.");
			return;
		}

		if (!isRecording) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				const mediaRecorder = new MediaRecorder(stream);
				mediaRecorderRef.current = mediaRecorder;
				audioChunksRef.current = [];

				mediaRecorder.ondataavailable = (event) => {
					audioChunksRef.current.push(event.data);
				};

				mediaRecorder.onstop = async () => {
					const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
					audioChunksRef.current = [];

					addMessage(responseRef, "user", "Transcribing audio...", false, true);

					const formData = new FormData();
					formData.append("file", audioBlob, "audio.wav");
					formData.append("model", "whisper-large-v3-turbo");
					formData.append("response_format", "verbose_json");

					try {
						setChatModal(true)
						const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
							method: "POST",
							headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
							body: formData,
						});

						const data = await response.json();
						const loaderMsg = document.getElementById("transcribing-msg");
						if (loaderMsg) loaderMsg.remove();

						const transcribedText = data.text || " ";

						if (pendingScreenshot) {
							const img = document.createElement("img");
							img.src = `data:image/png;base64,${pendingScreenshot}`;
							img.alt = "Screenshot";
							img.className = "max-w-full h-auto rounded-lg";

							const textSpan = document.createElement("span");
							textSpan.textContent = transcribedText;
							textSpan.className = "text-white text-sm";

							setPendingScreenshot(null);
							addMessage(responseRef, "user", [img, textSpan]);
							showTypingIndicator(responseRef);

							const response = await fetch(`${BACKEND_URL}/analyse-img`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									image: pendingScreenshot,
									prompt: transcribedText,
									geminiApiKey: GEMINI_API_KEY
								}),
							});
							const data = await response.json();
							addMessage(responseRef, "system", data.description);
						} else {
							addMessage(responseRef, "user", transcribedText);
							showTypingIndicator(responseRef);

							const geminiResponse = await fetch(`${BACKEND_URL}/ask-gemini`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ userMessage: transcribedText, geminiApiKey: GEMINI_API_KEY }),
							});
							const geminiText = await geminiResponse.json();
							addMessage(responseRef, "system", geminiText);
						}
					} catch (err) {
						console.error(err);
						addMessage(responseRef, "system", "Transcription failed: " + err.message);
					} finally {
						removeTypingIndicator(responseRef);
					}
				};

				mediaRecorder.start();
				setIsRecording(true);
			} catch (err) {
				addMessage(responseRef, "system", "Could not access microphone.");
				console.error(err);
			}
		} else {
			mediaRecorderRef.current?.stop();
			setIsRecording(false);
		}
	};

	async function captureScreenshotBase64() {
		if (!win) throw new Error("Window not ready");
		try {
			const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } });
			const track = stream.getVideoTracks()[0];

			await win.hide();

			const imageCapture = new ImageCapture(track);
			const bitmap = await imageCapture.grabFrame();

			const canvas = document.createElement("canvas");
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(bitmap, 0, 0);

			const base64 = canvas.toDataURL("image/png").split(",")[1];

			track.stop();
			await win.show();
			console.log("Captured screenshot size:", canvas.width, canvas.height);

			return base64;
		} catch (err) {
			console.error("Screenshot failed:", err);
			throw err;
		}
	}

	const handleCapture = async () => {
		try {
			if (!win) throw new Error("Window not yet ready");

			const base64Image = await captureScreenshotBase64();

			setPendingScreenshot(base64Image);
			setChatModal(true);
		} catch (err) {
			console.error(err);
			addMessage(responseRef, "system", err.message || String(err));
			alert("Failed to capture screen");
		}
	};

	const cleanModals = () => {
		setCalendarModal(false);
		setSettingsModal(false);
		setChatModal(false);
		setDashboardModal(false);
	}

	return (
		<div className="flex flex-col w-full">
			{pendingScreenshot && (
				<div className="flex items-center gap-2 mb-2 px-3">
					<img
						src={`data:image/png;base64,${pendingScreenshot}`}
						alt="Attached Screenshot"
						className="border rounded w-24 h-16 object-cover"
					/>
					<button
						onClick={() => setPendingScreenshot(null)}
						className="flex items-center text-red-500 text-sm hover:underline cursor-pointer"
					>
						<Trash />
					</button>
				</div>
			)}

			<div className="flex justify-between items-center gap-4 bg-black/90 shadow-lg backdrop-blur-xl mx-auto mb-4 px-4 py-2 border border-white/10 rounded-full w-full draggable">
				<img src={LoopieLogo} className="mr-4 w-10 h-10" />
				<TooltipProvider>
					<div className="flex gap-3">

						{/* Mic / Listen */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={() => {
										setSettingsModal(false);
										setCalendarModal(false);
										setDashboardModal(false);
										if (!chatModal) setChatModal(true);
										handleMicrophone();
									}}
									className={`flex items-center justify-center ${isRecording
										? "bg-red-600 hover:bg-red-500"
										: "bg-purple-600 hover:bg-purple-500"
										} shadow-md w-9 h-9 rounded-full text-white transition`}
								>
									{isRecording ? <Circle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{isRecording ? "Listening..." : "Listen"}
							</TooltipContent>
						</Tooltip>

						{/* Ask Loopie */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={() => { cleanModals(); setChatModal(!chatModal); }}
									className={`flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full w-9 h-9 text-white transition`}
								>
									<MessagesSquare className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Ask Loopie</TooltipContent>
						</Tooltip>

						{/* Capture screen */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={handleCapture}
									className={`flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full w-9 h-9 text-white transition`}
								>
									<Eye className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Capture Screen</TooltipContent>
						</Tooltip>

						{/* Calendar */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button onClick={() => { cleanModals(); setCalendarModal(!calendarModal); }} className={`flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full w-9 h-9 text-white transition`}>
									<Calendar className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Calendar</TooltipContent>
						</Tooltip>

						{/* Settings */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button onClick={() => { cleanModals(); setSettingsModal(!settingsModal); }} className={`flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full w-9 h-9 text-white transition`}>
									<Settings className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Settings</TooltipContent>
						</Tooltip>

						{/* Dashboard */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={() => { cleanModals(); setDashboardModal(!dashboardModal); }}
									className={`flex justify-center items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-full w-9 h-9 text-white transition`}
								>
									<LayoutDashboard className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Dashboard</TooltipContent>
						</Tooltip>

					</div>
				</TooltipProvider>
			</div>
		</div>
	);
};

export default Controls;