import "./App.css";
import { useEffect } from "react";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./components/authenticated/Chat";
import Auth from "./components/Auth";
import Connect from "./components/Connect";
import "./interface.css";

const App = () => {
	const win = getCurrentWindow();

	useEffect(() => {
		let active = true;

		async function setupShortcuts() {
			try {
				await register("Escape", async () => {
					if (active) await win.close();
				});

				await register("CommandOrControl+M", async () => {
					if (active) await win.hide();
				});

				await register("CommandOrControl+N", async () => {
					if (active) await win.show();
				});
			} catch (err) {
				console.error("Failed to register shortcuts:", err);
			}
		}
		setupShortcuts();
		return () => {
			active = false;
			unregisterAll()
				.then(() => console.log("Shortcuts cleaned up"))
				.catch((err) => console.error("Cleanup failed:", err));
		};
	}, [win]);

	return (
		<Router>
			<Routes>
				<Route path="/" element={<Auth />} />
				<Route path="/chat" element={<Chat />} />
				<Route path="/connect" element={<Connect />} />
			</Routes>
		</Router>
	);
};

export default App;