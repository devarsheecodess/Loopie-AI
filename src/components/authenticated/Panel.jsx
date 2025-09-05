import { useRef, useEffect } from "react";
import Controls from "./Controls";
import { useAtom } from "jotai";
import { settingsVisibleAtom, calendarVisibleAtom, chatVisibleAtom, dashboardVisibleAtom } from "../../lib/atoms";
import Settings from "./Settings";
import CalendarModal from "./Calendar";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import "../../interface.css";

const Panel = () => {
	const [settingsModal] = useAtom(settingsVisibleAtom);
	const [calendarModal] = useAtom(calendarVisibleAtom);
	const [chatModal] = useAtom(chatVisibleAtom);
	const [dashboardModal] = useAtom(dashboardVisibleAtom);
	const responseRef = useRef(null);

	useEffect(() => {
		if (responseRef.current) {
			responseRef.current.scrollTop = responseRef.current.scrollHeight;
		}
	});

	return (
		<main className="bg-transparent w-full h-screen font-sans">
			<div className="flex flex-col gap-3 mx-auto p-4 max-w-4xl h-full">

				<div className="relative flex-1 min-h-0">
					{chatModal && (<Chat responseRef={responseRef} />)}

					{dashboardModal && (
						<Dashboard />
					)}

					{settingsModal && (
						<div className="absolute inset-0 flex justify-center items-center backdrop-blur-sm rounded-xl">
							<Settings />
						</div>
					)}

					{calendarModal && (
						<div className="absolute inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm rounded-xl">
							<CalendarModal />
						</div>
					)}
				</div>

				<Controls responseRef={responseRef} />
			</div>
		</main>
	);
};

export default Panel;