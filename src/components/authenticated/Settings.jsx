import { useAtom } from "jotai";
import { X, Settings as SettingsIcon } from "lucide-react";
import { settingsVisibleAtom, credentialsAtom } from "../../lib/atoms";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

const Settings = () => {
	const [, setSettingsVisible] = useAtom(settingsVisibleAtom);
	const [credentials, setCredentials] = useAtom(credentialsAtom);

	return (
		<div className="bg-black/80 backdrop-blur-xl p-6 pt-4 rounded-2xl w-full h-full">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h6 className="flex gap-2 font-bold text-white text-lg tracking-wide"><SettingsIcon /> Settings</h6>
				<Button
					id="modalCloseBtn"
					onClick={() => setSettingsVisible(false)}
					className="hover:bg-purple-600/30 p-2 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
				>
					<X size={18} />
				</Button>
			</div>

			{/* Form */}
			<form
				id="settingsForm"
				onSubmit={(e) => {
					e.preventDefault();
					setSettingsVisible(false);
				}}
			>
				{/* Gemini Key */}
				<div className="mb-6">
					<Label
						htmlFor="geminiKeyInput"
						className="block mb-2 font-medium text-gray-300 text-sm"
					>
						Gemini API Key
					</Label>
					<Input
						type="text"
						id="geminiKeyInput"
						value={credentials.geminiKey}
						onChange={(e) =>
							setCredentials({ ...credentials, geminiKey: e.target.value })
						}
						className="bg-gray-900/60 backdrop-blur-md px-4 py-2 focus:border-purple-500 rounded-xl focus:ring-2 focus:ring-purple-500/60 w-full text-white text-sm transition-all duration-200 placeholder-gray-500"
						placeholder="Enter your Gemini API key"
					/>
				</div>

				{/* Groq Key */}
				<div className="mb-6">
					<Label
						htmlFor="groqKeyInput"
						className="block mb-2 font-medium text-gray-300 text-sm"
					>
						Groq API Key
					</Label>
					<Input
						type="text"
						id="groqKeyInput"
						value={credentials.groqKey}
						onChange={(e) =>
							setCredentials({ ...credentials, groqKey: e.target.value })
						}
						className="bg-gray-900/60 backdrop-blur-md px-4 py-2 focus:border-purple-500 rounded-xl focus:ring-2 focus:ring-purple-500/60 w-full text-white text-sm transition-all duration-200 placeholder-gray-500"
						placeholder="Enter your Groq API key"
					/>
				</div>

				{/* Buttons */}
				<div className="right-5 bottom-5 absolute flex justify-end space-x-3 pt-2">
					<Button
						id="modalCancelBtn"
						type="button"
						onClick={() => setSettingsVisible(false)}
						className="bg-gray-800/60 hover:bg-gray-700/80 px-4 py-2 rounded-3xl font-medium text-gray-300 text-sm transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="bg-gradient-to-r from-purple-600 hover:from-purple-500 to-blue-600 hover:to-blue-500 shadow-lg shadow-purple-800/50 hover:shadow-purple-700/60 px-4 py-2 rounded-3xl font-medium text-white text-sm transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
};

export default Settings;
