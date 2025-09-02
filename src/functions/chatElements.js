export function addMessage(responseRef, sender, message, isListening = false, isLoader = false) {
	if (!responseRef?.current) return;

	const messageDiv = document.createElement("div");
	messageDiv.classList.add("flex", "mb-3");

	if (isLoader) {
		messageDiv.id = "transcribing-msg";
	}

	if (sender === "user") {
		messageDiv.classList.add("justify-end");
		messageDiv.innerHTML = `
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg backdrop-blur-sm px-4 py-2 border border-blue-400 border-opacity-30 rounded-2xl rounded-br-md max-w-xs text-white">
        <p class="text-sm leading-relaxed">${message}</p>
      </div>`;
	} else {
		messageDiv.classList.add("justify-start");

		if (isListening) {
			messageDiv.innerHTML = `
        <div class="bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg backdrop-blur-sm px-4 py-2 border border-gray-600 border-opacity-50 rounded-2xl rounded-bl-md max-w-xs text-blue-300">
          <p class="flex items-center text-sm leading-relaxed">
            <span class="mr-2 animate-pulse">🎤</span>
            ${message}
          </p>
        </div>`;
		} else {
			messageDiv.innerHTML = `
        <div class="bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg backdrop-blur-sm px-4 py-2 border border-gray-600 border-opacity-50 rounded-2xl rounded-bl-md max-w-xs text-white">
          <p class="text-sm leading-relaxed">${message}</p>
        </div>`;
		}
	}

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
