import React from 'react'
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAtom } from "jotai";
import { credentialsAtom, settingsVisibleAtom } from '../../lib/atoms';

const Settings = () => {
	const [credentials, setCredentials] = useAtom(credentialsAtom)
	const [_, setSettingsModal] = useAtom(settingsVisibleAtom)

	return (
		<div id="settingsModal" className="z-40 absolute inset-0 justify-center items-center mt-20">
			<div
				className="bg-gray-800 bg-opacity-95 shadow-2xl backdrop-blur-lg p-5 pt-2 border border-gray-700 border-opacity-50 rounded-2xl w-96 max-w-full">
				<div className="flex justify-between items-center mb-4">
					<h6 className="font-bold text-md text-white tracking-wide">Settings</h6>
					<Button id="modalCloseBtn"
						className="hover:bg-gray-700 hover:bg-opacity-50 p-2 rounded-lg text-gray-400 hover:text-white transition-all duration-200">
						<i className="text-sm fa-solid fa-x"></i>
					</Button>
				</div>

				<form id="settingsForm"
					onSubmit={(e) => {
						e.preventDefault(); // prevent reload
						setSettingsModal(false);
					}}
				>
					<div className="mb-6">
						<Label htmlFor="geminiKeyInput" className="block mb-3 font-medium text-gray-200 text-sm tracking-wide">
							Add Gemini API Key
						</Label>
						<Input type="text" id="geminiKeyInput" value={credentials.geminiKey} onChange={(e) => setCredentials({ ...credentials, geminiKey: e.target.value })}
							className="bg-gray-900 bg-opacity-60 shadow-inner backdrop-blur-sm px-4 py-2 border-2 border-gray-600 focus:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-white text-sm transition-all duration-200 placeholder-gray-500"
							placeholder="Enter your Gemini API key" />
					</div>

					<div className="mb-6">
						<Label htmlFor="groqKeyInput" className="block mb-3 font-medium text-gray-200 text-sm tracking-wide">
							Add Groq API Key
						</Label>
						<Input type="text" id="groqKeyInput" value={credentials.groqKey} onChange={(e) => setCredentials({ ...credentials, groqKey: e.target.value })}
							className="bg-gray-900 bg-opacity-60 shadow-inner backdrop-blur-sm px-4 py-2 border-2 border-gray-600 focus:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-white text-sm transition-all duration-200 placeholder-gray-500"
							placeholder="Enter your Groq API key" />
					</div>

					<div className="flex justify-end space-x-4 pt-2">
						<Button id="modalCancelBtn"
							onClick={() => setSettingsModal(false)}
							className="bg-gray-700 hover:bg-gray-600 bg-opacity-80 shadow-lg hover:shadow-xl px-4 py-2 border border-gray-600 border-opacity-50 rounded-xl font-medium text-gray-200 text-sm transition-all hover:-translate-y-0.5 duration-200">
							Cancel
						</Button>
						<Button type="submit"
							className="bg-gradient-to-r from-blue-600 hover:from-blue-500 to-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl px-4 py-2 border border-blue-500 border-opacity-30 rounded-xl font-medium text-white text-sm transition-all hover:-translate-y-0.5 duration-200">
							Submit
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default Settings
