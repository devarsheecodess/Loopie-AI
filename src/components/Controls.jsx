import { useState, useRef } from 'react'
import { useAtom } from 'jotai';
import { Calendar, Circle, Eye, Mic, Settings, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { settingsVisibleAtom, calendarVisibleAtom, credentialsAtom } from '../lib/atoms'
import { addMessage, removeTypingIndicator, showTypingIndicator } from "../functions/chatElements";
import calendarLogo from "../assets/calendar-connect.png";

const Controls = ({ responseRef }) => {
	const win = getCurrentWindow();
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

	const handleSendMessage = async () => {
		const userMessage = inputValue.trim();
		if (!userMessage) return;

		addMessage(responseRef, "user", userMessage);
		setInputValue("");
		showTypingIndicator(responseRef);
		try {
			const geminiResponse = await fetch(`${CLOUDFARE_BACKEND_URL}/agents/devarshee/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: userMessage }),
			});
			const geminiText = await geminiResponse.json();
			removeTypingIndicator(responseRef);
			addMessage(responseRef, 'system', geminiText.reply[0].text);
		} catch (err) {
			console.error('Error:', err);
			removeTypingIndicator(responseRef);
			addMessage(responseRef, 'system', 'Sorry, I encountered an error processing your request.');
		}
	};

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

					try {
						const arrayBuffer = await audioBlob.arrayBuffer();
						const response = await fetch(`${CLOUDFARE_BACKEND_URL}/transcribe`, {
							method: "POST",
							headers: {
								"Content-Type": "audio/wav",
							},
							body: arrayBuffer,
						});

						const data = await response.json();
						console.log(data)
						const loaderMsg = document.getElementById("transcribing-msg");
						if (loaderMsg) loaderMsg.remove();

						addMessage(responseRef, "user", data.text);
						showTypingIndicator(responseRef);

						const geminiResponse = await fetch(`${CLOUDFARE_BACKEND_URL}/agents/devarshee/chat`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ message: data.text }),
						});
						const geminiText = await geminiResponse.json();
						removeTypingIndicator(responseRef);
						addMessage(responseRef, 'system', geminiText.reply[0].text);
					} catch (err) {
						console.error(err);
						addMessage(responseRef, "system", "Transcription failed: " + err.message);
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
			const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
			await win.hide()
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
			await win.show()

			const response = await fetch(`${BACKEND_URL}/analyse-img`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image: base64Image, geminiApiKey: GEMINI_API_KEY }),
			});
			const data = await response.json()
			console.log(data)
			removeTypingIndicator(responseRef);
			addMessage(responseRef, "system", data.description);
		} catch (err) {
			console.error(err);
			addMessage('system', err);
			alert('Failed to capture screen');
		} finally {
			removeTypingIndicator();
		}
	};

	const handleCalendar = () => {
		setSettingsModal(false);
		setCalendarModal(!calendarModal);
		console.log(calendarModal)
	}

	const handleSettings = () => {
		setCalendarModal(false);
		setSettingsModal(!settingsModal);
		console.log(settingsModal)
	}

	const handleConnectCalendar = () => {

	}

	const handleClose = () => {
		win.close();
	}

	return (
		<div className="flex justify-between items-center bg-black shadow-2xl backdrop-blur-xl mb-4 p-3 border border-white border-opacity-10 rounded-xl draggable">
			{/* Mic Button */}
			<button
				id="micButton"
				onClick={handleMicrophone}
				className={`flex justify-center items-center ${isRecording
					? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/100"
					: "bg-gradient-to-br from-blue-500 to-blue-600"
					} shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 px-4 rounded-full w-10 h-10 text-white hover:scale-110 transition-all duration-300 no-drag`}
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
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSendMessage();
				}}
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