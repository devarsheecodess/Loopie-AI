import { useRef, useEffect } from "react";
import "../../interface.css";
import Controls from "./Controls";
import { useAtom } from "jotai";
import { settingsVisibleAtom, calendarVisibleAtom } from "../../lib/atoms";
import Settings from "./Settings";

const Chat = () => {
	const [settingsModal] = useAtom(settingsVisibleAtom);
	const [calendarModal] = useAtom(calendarVisibleAtom);
	const responseRef = useRef(null);

	useEffect(() => {
		if (responseRef.current) {
			responseRef.current.scrollTop = responseRef.current.scrollHeight;
		}
	});

	return (
		<main className="bg-transparent w-full h-screen font-sans">
			{/* Parent flex column that fills full height */}
			<div className="flex flex-col gap-3 mx-auto p-4 max-w-4xl h-full">

				{/* Chat messages area */}
				<div className="flex-1 min-h-0">
					<div
						ref={responseRef}
						className="bg-black/30 backdrop-blur-sm p-6 border border-white border-opacity-5 rounded-xl h-full overflow-y-auto text-white text-opacity-90 no-drag hide-scrollbar"
					></div>
				</div>

				{/* Controls pinned at bottom */}
				<Controls responseRef={responseRef} />

				{/* Settings modal */}
				{settingsModal && <Settings />}

				{/* Calendar modal */}
				{calendarModal && (
					<div
						id="calendarPopover"
						className="top-14 right-2 absolute bg-gray-900 shadow-xl p-3 border border-gray-700 rounded-xl"
					>
						<input type="text" id="calendarInput" className="hidden" />
					</div>
				)}
			</div>
		</main>
	);
};

export default Chat;
