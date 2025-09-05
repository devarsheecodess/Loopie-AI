import "./App.css";
import { useEffect, useRef } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Panel from "./components/authenticated/Panel";
import Auth from "./components/Auth";
import Connect from "./components/Connect";
import "./interface.css";

const App = () => {
	const isTogglingRef = useRef(false); // debounce flag to prevent double toggle

	useEffect(() => {
		let active = true;

		async function setupShortcuts() {
			try {
				const win = await getCurrentWindow();

				await unregister("CommandOrControl+M").catch(() => { });
				await unregister("Escape").catch(() => { });

				// ESC to close window
				await register("Escape", async () => {
					if (active) {
						await win.close();
					}
				});

				// Ctrl+M to toggle window visibility
				await register("CommandOrControl+M", async () => {
					if (!active || isTogglingRef.current) return;

					isTogglingRef.current = true;

					try {
						const isVisible = await win.isVisible();

						if (isVisible) {
							await win.hide();
						} else {
							await win.show();
							await win.setFocus();
						}
					} finally {
						// reset the toggle flag after short delay
						setTimeout(() => {
							isTogglingRef.current = false;
						}, 300);
					}
				});

				console.log("Shortcuts registered successfully");
			} catch (err) {
				console.error("Failed to register shortcuts:", err);
			}
		}

		setupShortcuts();

		return () => {
			active = false;
			unregister("CommandOrControl+M").catch(() => { });
			unregister("Escape").catch(() => { });
		};
	}, []);

	return (
		<Router>
			<Routes>
				<Route path="/" element={<Auth />} />
				<Route path="/chat" element={<Panel />} />
				<Route path="/connect" element={<Connect />} />
			</Routes>
		</Router>
	);
};

export default App;
