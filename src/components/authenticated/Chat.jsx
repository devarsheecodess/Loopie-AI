import { Input } from "../ui/input"
import { addMessage } from "../../functions/chatElements";
import { useState } from "react";
import { showTypingIndicator, removeTypingIndicator } from "../../functions/chatElements";
import { useAtom } from "jotai";
import { credentialsAtom, screenshotAtom } from "../../lib/atoms";
import Header from "./Header";

const Chat = ({ responseRef }) => {
	const [inputValue, setInputValue] = useState("");
	const [pendingScreenshot, setPendingScreenshot] = useAtom(screenshotAtom);
	const [credentials] = useAtom(credentialsAtom);
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
	const GEMINI_API_KEY = credentials.geminiKey || import.meta.env.VITE_GEMINI_KEY;

	const handleSendMessage = async () => {
		const userMessage = inputValue.trim() || " ";
		setInputValue("");
		if (!userMessage && !pendingScreenshot) return;
		console.log(GEMINI_API_KEY);

		try {
			if (pendingScreenshot) {
				const img = document.createElement("img");
				img.src = `data:image/png;base64,${pendingScreenshot}`;
				img.alt = "Screenshot";
				img.className = "max-w-full h-auto rounded-lg";

				const textSpan = document.createElement("span");
				textSpan.textContent = userMessage || "";
				textSpan.className = "text-white text-sm";

				setPendingScreenshot(null);
				addMessage(responseRef, "user", [img, textSpan]);
				showTypingIndicator(responseRef);

				const response = await fetch(`${BACKEND_URL}/analyse-img`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						image: pendingScreenshot,
						prompt: userMessage || "Describe this image.",
						geminiApiKey: GEMINI_API_KEY
					}),
				});

				const data = await response.json();
				addMessage(responseRef, "system", data.description);
			} else {
				addMessage(responseRef, "user", userMessage);
				showTypingIndicator(responseRef);

				const geminiResponse = await fetch(`${BACKEND_URL}/ask-gemini`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userMessage, geminiApiKey: GEMINI_API_KEY }),
				});
				const geminiText = await geminiResponse.json();
				addMessage(responseRef, "system", geminiText);
			}
		} catch (err) {
			console.error("Error:", err);
			addMessage(responseRef, "system", "Sorry, I encountered an error.");
		} finally {
			removeTypingIndicator(responseRef);
			setInputValue("");
		}
	};

	return (
		<div className="flex flex-col bg-black/70 backdrop-blur-sm p-4 border-opacity-5 rounded-xl h-full text-white text-opacity-90 no-drag">
			<Header />
			{/* Messages container */}
			<div
				ref={responseRef}
				className="flex-1 overflow-y-auto hide-scrollbar"
			/>

			{/* Prompt input fixed at bottom */}
			<div className="mt-3">
				<div className="flex items-center gap-2 bg-white/10 shadow-md focus-within:shadow-lg backdrop-blur-md px-3 py-1.5 border border-white/20 focus-within:border-purple-400 rounded-2xl transition">
					<Input
						placeholder="Send a message..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSendMessage();
							}
						}}
						className="flex-1 bg-transparent [box-shadow:none!important] shadow-none focus:shadow-none px-4 py-2 border-0 focus:border-0 rounded-3xl outline-none focus:outline-none ring-0 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-white placeholder:text-white/50 text-sm appearance-none"
					/>


					{/* Send Button */}
					<button
						onClick={handleSendMessage}
						className="bg-purple-600 hover:bg-purple-500 shadow-md p-1.5 rounded-full transition"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
							className="w-4 h-4 text-white"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 12L3 21l18-9L3 3l3 9zm0 0h12"
							/>
						</svg>
					</button>
				</div>
			</div>

		</div>
	);
};

export default Chat;
