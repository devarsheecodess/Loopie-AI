import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const Screenshot = () => {
	const [screenshot, setScreenshot] = useState(null);
	const [isCapturing, setIsCapturing] = useState(false);
	const [error, setError] = useState(null);
	const [screenInfo, setScreenInfo] = useState(null);

	const getScreenInfo = async () => {
		try {
			console.log('Getting screen info...');
			const info = await invoke('get_screen_info');
			console.log('Screen info:', info);
			setScreenInfo(info);
		} catch (err) {
			console.error('Failed to get screen info:', err);
			setError(`Failed to get screen info: ${err}`);
		}
	};

	const captureScreenshot = async () => {
		try {
			setIsCapturing(true);
			setError(null);

			console.log('Capturing screenshot...');
			const screenshotData = await invoke('capture_screenshot');

			console.log('Screenshot captured successfully');
			console.log('Screenshot data length:', screenshotData.length);
			setScreenshot(screenshotData);
		} catch (err) {
			console.error('Failed to capture screenshot:', err);
			setError(`Failed to capture screenshot: ${err}`);
		} finally {
			setIsCapturing(false);
		}
	};

	const captureAllScreens = async () => {
		try {
			setIsCapturing(true);
			setError(null);

			console.log('Capturing all screens...');
			const screenshotData = await invoke('capture_all_screens');

			console.log('All screens captured successfully');
			console.log('Screenshot data length:', screenshotData.length);
			setScreenshot(screenshotData);
		} catch (err) {
			console.error('Failed to capture all screens:', err);
			setError(`Failed to capture all screens: ${err}`);
		} finally {
			setIsCapturing(false);
		}
	};

	return (
		<div className="bg-black/30 backdrop-blur-sm p-6 border border-white border-opacity-5 rounded-xl">
			<div className="flex flex-col gap-4">
				<h2 className="font-semibold text-white text-xl">Screenshot Capture</h2>

				<div className="flex flex-wrap gap-3">
					<button
						onClick={captureScreenshot}
						disabled={isCapturing}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${isCapturing
							? 'bg-gray-600 text-gray-300 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700 text-white'
							}`}
					>
						{isCapturing ? 'Capturing...' : 'Capture Primary Screen'}
					</button>

					<button
						onClick={captureAllScreens}
						disabled={isCapturing}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${isCapturing
							? 'bg-gray-600 text-gray-300 cursor-not-allowed'
							: 'bg-green-600 hover:bg-green-700 text-white'
							}`}
					>
						{isCapturing ? 'Capturing...' : 'Capture All Screens'}
					</button>

					<button
						onClick={getScreenInfo}
						disabled={isCapturing}
						className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-white transition-all"
					>
						Get Screen Info
					</button>
				</div>

				{screenInfo && (
					<div className="bg-blue-500/20 p-3 border border-blue-500/50 rounded-lg">
						<h3 className="mb-2 font-medium text-blue-200">Screen Information:</h3>
						<pre className="text-blue-100 text-sm whitespace-pre-wrap">{screenInfo}</pre>
					</div>
				)}

				{error && (
					<div className="bg-red-500/20 p-3 border border-red-500/50 rounded-lg">
						<p className="text-red-200 text-sm">{error}</p>
					</div>
				)}

				{screenshot && (
					<div className="flex flex-col gap-3">
						<h3 className="text-white text-lg">Captured Screenshot:</h3>
						<div className="border border-white/20 rounded-lg overflow-hidden">
							<img
								src={screenshot}
								alt="Captured screenshot"
								className="w-full h-auto max-h-96 object-contain"
							/>
						</div>
						<div className="bg-gray-800/50 p-3 rounded-lg">
							<p className="text-gray-300 text-xs break-all">
								Base64 Data: {screenshot.substring(0, 100)}...
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Screenshot;
