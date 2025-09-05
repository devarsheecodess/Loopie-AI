import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import Header from "./Header"

export default function CalendarModal() {
	const [date, setDate] = useState(new Date())

	return (
		<div className="p-3 w-full">
			<Header />
			<div className="flex flex-col justify-center items-center mt-4">
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
					className="shadow-sm border rounded-md"
					captionLayout="dropdown"
				/>
			</div>
		</div>
	)
}