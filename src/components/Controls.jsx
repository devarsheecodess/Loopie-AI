import { useState, useRef, useEffect } from 'react'
import { useAtom } from 'jotai';
import { Calendar, Circle, Eye, Mic, Settings, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { settingsVisibleAtom, calendarVisibleAtom, credentialsAtom } from '../lib/atoms'
import { addMessage, removeTypingIndicator, showTypingIndicator } from "../functions/chatElements";
import calendarLogo from "../assets/calendar-connect.png";

const Controls = ({ responseRef }) => {
	const win = getCurrentWindow()

	const [settingsModal, setSettingsModal] = useAtom(settingsVisibleAtom);
	const [calendarModal, setCalendarModal] = useAtom(calendarVisibleAtom);
	const [isRecording, setIsRecording] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [credentials] = useAtom(credentialsAtom);
	const GROQ_API_KEY = credentials.groqKey || import.meta.env.VITE_GROQ_KEY;
	const GEMINI_API_KEY = credentials.geminiKey || import.meta.env.VITE_GEMINI_KEY;
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
	const CLOUDFARE_BACKEND_URL = import.meta.env.VITE_CLOUDFARE_BACKEND_URL;

	function normalizeAction(action) {
		if (!action) return null;
		return {
			action: action.action || action?.action?.action,
			x: action.x ?? action?.action?.x,
			y: action.y ?? action?.action?.y,
			value: action.value ?? action?.action?.value,
			description: action.description ?? action?.action?.description,
		};
	}

	const handleSendMessage = async () => {
		const userMessage = inputValue.trim();
		if (!userMessage) return;

		addMessage(responseRef, "user", userMessage);
		setInputValue("");
		showTypingIndicator(responseRef);
		try {
			const geminiResponse = await fetch(`${BACKEND_URL}/ask-gemini`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userMessage: userMessage, geminiApiKey: GEMINI_API_KEY }),
			});
			const geminiText = await geminiResponse.json();
			removeTypingIndicator(responseRef);
			addMessage(responseRef, 'system', geminiText);
		} catch (err) {
			console.error('Error:', err);
			removeTypingIndicator(responseRef);
			addMessage(responseRef, 'system', 'Sorry, I encountered an error processing your request.');
		}
	};

	async function executeAction(action) {
		try {
			const normalized = normalizeAction(action);
			if (!normalized) return { status: "failure", detail: "Invalid action" };

			const resp = await fetch(`${BACKEND_URL}/execute-action`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(normalized),
			});

			if (!resp.ok) {
				const text = await resp.text();
				console.error("execute-action failed:", resp.status, text);
				return { status: "failure", detail: text };
			}

			const result = await resp.json();
			return result;
		} catch (err) {
			console.error("executeAction error:", err);
			return { status: "failure", detail: String(err) };
		}
	}

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

			const base64Image = canvas.toDataURL("image/png").split(",")[1];

			track.stop();
			await win.show();

			return base64Image;
		} catch (err) {
			console.error("Screenshot failed:", err);
			throw err;
		}
	}

	async function runUiAutomationLoop(goal, geminiApiKey) {
		let lastState = null;
		let done = false;
		const maxSteps = 50;

		addMessage(responseRef, "system", `Starting UI automation: ${goal}`);

		for (let i = 0; i < maxSteps && !done; i++) {
			try {
				showTypingIndicator(responseRef);

				const base64Image = await captureScreenshotBase64();

				const resp = await fetch(`${BACKEND_URL}/next-action`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ base64Image, goal, geminiApiKey, lastState }),
				});

				if (!resp.ok) {
					const text = await resp.text();
					removeTypingIndicator(responseRef);
					addMessage(responseRef, "system", `Backend /next-action error: ${resp.status} ${text}`);
					console.error("next-action error:", resp.status, text);
					break;
				}

				const rawAction = await resp.json();
				const action = normalizeAction(rawAction);

				removeTypingIndicator(responseRef);
				addMessage(responseRef, "system", `Step ${i + 1}: ${action.action} ${action.description || ""}`);

				showTypingIndicator(responseRef);
				const execResult = await executeAction(action);
				removeTypingIndicator(responseRef);

				if (execResult?.status === "success") {
					addMessage(responseRef, "system", `Executed: ${action.action}`);
					lastState = { action, result: "success" };
				} else {
					addMessage(responseRef, "system", `Execution failed: ${execResult?.detail || "unknown"}`);
					lastState = { action, result: "failure", detail: execResult?.detail || "no_detail" };
				}

				if (action.action === "done") {
					addMessage(responseRef, "user", "Automation completed ✅");
					done = true;
					break;
				}

				await new Promise(r => setTimeout(r, 1000));
			} catch (err) {
				removeTypingIndicator(responseRef);
				addMessage(responseRef, "system", `Automation loop error: ${String(err)}`);
				console.error("Automation loop error:", err);
				break;
			}
		}

		if (!done) {
			addMessage(responseRef, "system", "Automation stopped (max steps or error).");
		}
	}

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
						const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
							method: "POST",
							headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
							body: formData,
						});

						const data = await response.json();
						const loaderMsg = document.getElementById("transcribing-msg");
						if (loaderMsg) loaderMsg.remove();

						addMessage(responseRef, "user", data.text);
						showTypingIndicator(responseRef);

						const geminiResponse = await fetch(`${BACKEND_URL}/ask-gemini`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ userMessage: data.text, geminiApiKey: GEMINI_API_KEY }),
						});
						const geminiText = await geminiResponse.json();

						const isUIAuto =
							(typeof geminiText === "string" && (geminiText === "UIAutomation" || geminiText === "ui_automation")) ||
							(geminiText && (geminiText.result === "UIAutomation" || geminiText.result === "ui_automation" || geminiText.type === "ui_automation"));

						if (isUIAuto) {
							runUiAutomationLoop(data.text, GEMINI_API_KEY);
						} else {
							removeTypingIndicator(responseRef);
							addMessage(responseRef, 'system', geminiText);
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

	const handleCapture = async () => {
		try {
			addMessage(responseRef, "user", "Capturing screen...");
			if (!win) throw new Error("Window not yet ready");

			const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
			await win.hide();
			const track = stream.getVideoTracks()[0];
			const imageCapture = new ImageCapture(track);
			const bitmap = await imageCapture.grabFrame();

			showTypingIndicator(responseRef);
			const canvas = document.createElement('canvas');
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(bitmap, 0, 0);
			const base64Image = canvas.toDataURL('image/png').split(',')[1];
			track.stop();
			await win.show();

			const response = await fetch(`${BACKEND_URL}/analyse-img`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image: base64Image, geminiApiKey: GEMINI_API_KEY }),
			});
			const data = await response.json();
			removeTypingIndicator(responseRef);
			addMessage(responseRef, "system", data.description);
		} catch (err) {
			console.error(err);
			addMessage(responseRef, 'system', err.message || String(err));
			alert('Failed to capture screen');
		} finally {
			removeTypingIndicator();
		}
	};

	const handleCalendar = () => {
		setSettingsModal(false);
		setCalendarModal(!calendarModal);
	};

	const handleSettings = () => {
		setCalendarModal(false);
		setSettingsModal(!settingsModal);
	};

	const handleConnectCalendar = () => { };

	const handleClose = async () => {
		if (win) await win.close();
	};

	return (
		<div className="flex justify-between items-center bg-black shadow-2xl backdrop-blur-xl mb-4 p-3 border border-white border-opacity-10 rounded-xl draggable">
			{/* Mic Button */}
			<button
				id="micButton"
				onClick={handleMicrophone}
				className={`flex justify-center items-center ${isRecording ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/100" : "bg-gradient-to-br from-blue-500 to-blue-600"} shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 px-4 rounded-full w-10 h-10 text-white hover:scale-110 transition-all duration-300 no-drag`}
			>
				{isRecording ? (
					<Circle className="flex-shrink-0 w-5 md:w-5 h-5 md:h-5" strokeWidth={2} />
				) : (
					<Mic className="flex-shrink-0 w-5 md:w-5 h-5 md:h-5" strokeWidth={2} />
				)}
			</button>

			{/* Text Input */}
			<input
				type="text"
				id="textInput"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
				placeholder="Ask me anything..."
				className="flex-1 bg-white bg-opacity-10 mx-1.5 px-4 py-2 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm transition-all duration-200 no-drag placeholder-gray-300"
			/>

			{/* Action Buttons */}
			<div className="flex items-center space-x-1 no-drag">
				<button
					id="captureBtn"
					onClick={handleCapture}
					className="flex justify-center items-center bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-lg w-8 h-8 text-white transition-all hover:-translate-y-0.5 duration-200"
				>
					<Eye className="flex-shrink-0 w-5 md:w-5 h-5 md:h-5 text-black" strokeWidth={2} />
				</button>

				<button
					id="calendarButton"
					onClick={handleCalendar}
					className="flex justify-center items-center bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-lg w-8 h-8 text-white transition-all hover:-translate-y-0.5 duration-200"
				>
					<Calendar className="flex-shrink-0 w-5 md:w-5 h-5 md:h-5 text-black" strokeWidth={2} />
				</button>

				<button
					id="settingsButton"
					onClick={handleSettings}
					className="flex justify-center items-center bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-lg w-8 h-8 text-white transition-all hover:-translate-y-0.5 duration-200"
				>
					<Settings className="flex-shrink-0 w-5 md:w-5 h-5 md:h-5 text-black" strokeWidth={2} />
				</button>

				<button
					id="calendarConnectBtn"
					onClick={handleConnectCalendar}
					className="flex justify-center items-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg w-8 h-8 transition-all hover:-translate-y-0.5 duration-200"
				>
					<img src={calendarLogo} className="w-5 h-5" />
				</button>

				<button
					id="closeButton"
					onClick={handleClose}
					className="flex justify-center items-center bg-red-600 bg-opacity-20 hover:bg-opacity-30 border border-red-400 border-opacity-30 rounded-lg w-8 h-8 text-red-400 transition-all hover:-translate-y-0.5 duration-200"
				>
					<X className="flex-shrink-0 w-5 md:w-5 h-5 md:h-5 text-red-300" strokeWidth={2} />
				</button>
			</div>
		</div>
	);
};

export default Controls;