import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useAtom } from "jotai";
import { settingsVisibleAtom, calendarVisibleAtom, chatVisibleAtom, dashboardVisibleAtom } from "../../lib/atoms";

const Header = () => {
	const win = getCurrentWindow();
	const [_, setSettingsModal] = useAtom(settingsVisibleAtom);
	const [_2, setCalendarModal] = useAtom(calendarVisibleAtom);
	const [_3, setChatModal] = useAtom(chatVisibleAtom);
	const [_4, setDashboardModal] = useAtom(dashboardVisibleAtom);

	const handleClose = async () => {
		await win.close()
	}

	const cleanModals = () => {
		setCalendarModal(false);
		setSettingsModal(false);
		setChatModal(false);
		setDashboardModal(false);
	}

	const handleHome = () => {
		cleanModals();
		setDashboardModal(true);
	}

	return (
		<div className="flex justify-between items-center mb-4 text-white draggable">
			<h1 className="font-semibold text-sm">Loopie</h1>
			<div className="flex items-center gap-3 sm:gap-4">
				<Button onClick={handleHome} variant={'ghost'} className="hover:bg-transparent text-gray-400 hover:text-white text-sm cursor-pointer">Home</Button>
				<Button variant={'ghost'} onClick={handleClose} className="hover:bg-white/10 p-1 rounded-full hover:text-white cursor-pointer">
					<X className="w-4 h-4" />
				</Button>
			</div>
		</div>
	)
}

export default Header
