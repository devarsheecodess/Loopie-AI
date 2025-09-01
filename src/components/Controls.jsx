import React, { useState, useRef } from 'react'
import { Calendar, Circle, Eye, Mic, Settings, X } from "lucide-react";
import calendarLogo from "../assets/calendar-connect.png";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAtom } from 'jotai';
import { settingsVisibleAtom, calendarVisibleAtom, credentialsAtom } from '../lib/atoms'
import { addMessage, removeTypingIndicator, showTypingIndicator } from "../utils/chatElements"; // put function in utils if you want
import { getScreenshotableWindows, getWindowScreenshot } from "tauri-plugin-screenshots-api";

const Controls = ({ responseRef }) => {
	const win = getCurrentWindow();
	const [settingsModal, setSettingsModal] = useAtom(settingsVisibleAtom);
	const [calendarModal, setCalendarModal] = useAtom(calendarVisibleAtom);
	const [isRecording, setIsRecording] = useState(false);
	const [imgSrc, setImgSrc] = useState(null);

	const [inputValue, setInputValue] = useState(""); // <-- state for text input
	const [credentials] = useAtom(credentialsAtom);
	const GROQ_API_KEY = credentials.groqKey || import.meta.env.VITE_GROQ_KEY;
	const GEMINI_API_KEY = credentials.geminiKey || import.meta.env.VITE_GEMINI_KEY;
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

	// ✅ Handle sending typed messages
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

	const handleMicrophone = async () => {
		if (!GROQ_API_KEY) {
			addMessage(responseRef, "system", "Please set your GROQ API key in the settings.");
			return;
		}

		if (!isRecording) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				const mediaRecorder = new MediaRecorder(stream);
				mediaRecorderRef.current = mediaRecorder; // store in ref
				audioChunksRef.current = []; // reset chunks

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
						console.log(data)
						const loaderMsg = document.getElementById("transcribing-msg");
						if (loaderMsg) loaderMsg.remove();

						addMessage(responseRef, "user", data.text);
						showTypingIndicator(responseRef);
						console.log(JSON.stringify({ userMessage: data.text, geminiApiKey: GEMINI_API_KEY }));
						const geminiResponse = await fetch(`${BACKEND_URL}/ask-gemini`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ userMessage: data.text, geminiApiKey: GEMINI_API_KEY }),
						});
						const geminiText = await geminiResponse.json();
						removeTypingIndicator(responseRef);
						addMessage(responseRef, "system", geminiText);
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
			// Stop recording
			mediaRecorderRef.current?.stop();
			setIsRecording(false);
		}
	};

	function arrayBufferToBase64(buffer) {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	const handleCapture = async () => {
		try {
			const windows = await getScreenshotableWindows();
			if (windows.length === 0) {
				alert("No windows found to take screenshot");
				return;
			}
			// Take screenshot of the first available window
			const filePath = await getWindowScreenshot(windows[0].id);
			console.log(`Screenshot saved at: ${filePath}`);
		} catch (err) {
			console.error(err);
			addMessage('system', err);
			alert('Failed to capture screen');
		} finally {
			removeTypingIndicator();
		}
	}

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
