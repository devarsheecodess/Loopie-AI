import "./App.css";
import { useEffect, useRef, useState } from "react";
import { register } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";
import './interface.css'
import Controls from "./components/Controls";
import { useAtom } from "jotai";
import { settingsVisibleAtom, calendarVisibleAtom } from './lib/atoms';
import Settings from "./components/Settings";

const App = () => {
	const win = getCurrentWindow();
	const [settingsModal] = useAtom(settingsVisibleAtom);
	const [calendarModal] = useAtom(calendarVisibleAtom);
	const responseRef = useRef(null);

	useEffect(() => {
		async function setupShortcuts() {
			await register("Escape", async () => {
				await win.close();
			});

			await register("CommandOrControl+M", async () => {
				win.hide();
			});

			await register("CommandOrControl+N", async () => {
				win.show();
			});
		}

		setupShortcuts();
	}, []);

	return (
		<main className="bg-transparent w-full h-full font-sans">
			<div className="flex flex-col-reverse gap-3 mx-auto p-4 max-w-4xl h-full">
				{/* Controls */}
				<Controls responseRef={responseRef} />

				{/* Chat Area */}
				<div className="flex-1 w-full h-full draggable">
					<div className="flex-1 bg-black/30 backdrop-blur-sm p-6 border border-white border-opacity-5 rounded-xl h-98 overflow-y-auto text-white text-opacity-90 no-drag hide-scrollbar">
						<div ref={responseRef}></div>
					</div>
				</div>

				{/* <!-- Settings Modal --> */}
				{
					settingsModal && (
						<Settings />
					)
				}

				{/* <!-- Calendar Popover --> */}
				{
					calendarModal && (
						<div id="calendarPopover"
							className="top-14 right-2 absolute bg-gray-900 shadow-xl p-3 border border-gray-700 rounded-xl">
							<input type="text" id="calendarInput" className="hidden" />
						</div>
					)
				}
			</div>
		</main>
	);
}

export default App;