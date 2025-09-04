export function addMessage(responseRef, sender, message, isListening = false, isLoader = false) {
	if (!responseRef?.current) return;

	const messageDiv = document.createElement("div");
	messageDiv.classList.add("flex", "mb-3");

	if (isLoader) {
		messageDiv.id = "transcribing-msg";
	}

	let contentWrapper = document.createElement("div");
	contentWrapper.className = "text-sm leading-relaxed flex flex-col gap-1";

	if (typeof message === "string") {
		contentWrapper.innerHTML = message;
	} else if (message instanceof HTMLElement) {
		contentWrapper.appendChild(message);
	} else if (Array.isArray(message)) {
		message.forEach((item) => {
			if (typeof item === "string") {
				const textNode = document.createElement("span");
				textNode.textContent = item;
				contentWrapper.appendChild(textNode);
			} else if (item instanceof HTMLElement) {
				// Make images responsive
				if (item.tagName.toLowerCase() === "img") {
					item.classList.add("max-w-full", "h-auto", "rounded-lg");
				}
				contentWrapper.appendChild(item);
			}
		});
	}

	let bubbleDiv = document.createElement("div");
	bubbleDiv.classList.add(
		"shadow-lg",
		"backdrop-blur-sm",
		"px-4",
		"py-2",
		"border",
		"rounded-2xl",
		"max-w-xs",
		"break-words" // ensure text wraps inside bubble
	);

	if (sender === "user") {
		messageDiv.classList.add("justify-end");
		bubbleDiv.classList.add("bg-gradient-to-r", "from-blue-500", "to-blue-600", "border-blue-400", "border-opacity-30", "text-white", "rounded-br-md");
	} else {
		messageDiv.classList.add("justify-start");
		if (isListening) {
			bubbleDiv.classList.add("bg-gradient-to-r", "from-gray-700", "to-gray-600", "border-gray-600", "border-opacity-50", "text-blue-300", "rounded-bl-md");
			const micSpan = document.createElement("span");
			micSpan.className = "mr-2 animate-pulse";
			micSpan.textContent = "🎤";
			contentWrapper.prepend(micSpan);
		} else {
			bubbleDiv.classList.add("bg-gradient-to-r", "from-gray-700", "to-gray-600", "border-gray-600", "border-opacity-50", "text-white", "rounded-bl-md");
		}
	}

	bubbleDiv.appendChild(contentWrapper);
	messageDiv.appendChild(bubbleDiv);
	responseRef.current.appendChild(messageDiv);
	responseRef.current.scrollTop = responseRef.current.scrollHeight;
}

export function showTypingIndicator(responseRef) {
	if (!responseRef?.current) return;

	const typingDiv = document.createElement('div');
	typingDiv.classList.add('flex', 'justify-start', 'mb-3');
	typingDiv.id = 'typing-indicator';
	typingDiv.innerHTML = `
    <div class="bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg backdrop-blur-sm px-4 py-2 border border-gray-600 border-opacity-50 rounded-2xl rounded-bl-md text-gray-300">
      <div class="flex items-center space-x-1">
        <div class="bg-gray-400 rounded-full w-2 h-2 animate-bounce"></div>
        <div class="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style="animation-delay: 0.1s"></div>
        <div class="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style="animation-delay: 0.2s"></div>
      </div>
    </div>`;
	responseRef.current.appendChild(typingDiv);
	responseRef.current.scrollTop = responseRef.current.scrollHeight;
}

export function removeTypingIndicator(responseRef) {
	if (!responseRef?.current) return;
	const typingDiv = responseRef.current.querySelector('#typing-indicator');
	if (typingDiv) typingDiv.remove();
}
