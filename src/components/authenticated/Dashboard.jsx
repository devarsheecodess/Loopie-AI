import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Menu } from "lucide-react";
import Header from "./Header";

const Dashboard = () => {
	return (
		<div className="flex flex-col bg-black/70 shadow-2xl backdrop-blur-xl mx-auto mb-6 p-4 rounded-2xl w-full max-w-[500px] text-white">
			<Header />
			<Tabs defaultValue="daily" className="flex flex-col flex-1">
				<div className="flex justify-center">
					<TabsList className="flex flex-wrap justify-center gap-6 bg-transparent mb-4 px-4 py-2 border border-white/10 text-white">
						<TabsTrigger value="daily" className="data-[state=active]:bg-transparent data-[state=active]:font-semibold text-gray-400 data-[state=active]:text-white text-sm">
							Daily Briefs
						</TabsTrigger>
						<TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:font-semibold text-gray-400 data-[state=active]:text-white text-sm">
							Tasks
						</TabsTrigger>
						<TabsTrigger value="calendar" className="data-[state=active]:bg-transparent data-[state=active]:font-semibold text-gray-400 data-[state=active]:text-white text-sm">
							Calendar
						</TabsTrigger>
						<TabsTrigger value="emails" className="data-[state=active]:bg-transparent data-[state=active]:font-semibold text-gray-400 data-[state=active]:text-white text-sm">
							Emails
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="h-58 overflow-y-auto hide-scrollbar">
					<TabsContent value="daily" className="space-y-3 text-sm">
						<p className="font-medium">Generated at today 9.00 am</p>
						<p>
							3 meetings today: Product Sync (10AM), Client Review (2PM), Hiring
							Panel (5PM).
						</p>
						<p>
							5 open tasks: finalize Q3 roadmap, approve campaign draft, review
							payroll update, reply to investor query, assign design tickets.
						</p>
						<p>Reminder: Submit weekly team performance summary by EOD.</p>
					</TabsContent>

					<TabsContent value="tasks" className="space-y-3 text-sm">
						{Array(4)
							.fill(0)
							.map((_, i) => (
								<div
									key={i}
									className="flex justify-between items-center pb-2 border-white/10 border-b"
								>
									<p>
										Create PRD and share with Pratham for review. Also add Tejas
										and Sarvesh to google docs.
									</p>
									<Menu className="w-4 h-4 text-gray-400" />
								</div>
							))}
					</TabsContent>

					<TabsContent value="calendar" className="text-sm">
						<Tabs defaultValue="upcoming">
							<TabsList className="flex gap-6 bg-transparent">
								<TabsTrigger
									value="upcoming"
									className="data-[state=active]:bg-transparent data-[state=active]:font-medium text-gray-400 data-[state=active]:text-white text-sm"
								>
									Upcoming meetings
								</TabsTrigger>
								<TabsTrigger
									value="past"
									className="data-[state=active]:bg-transparent data-[state=active]:font-medium text-gray-400 data-[state=active]:text-white text-sm"
								>
									Past meetings
								</TabsTrigger>
							</TabsList>

							<TabsContent value="upcoming" className="space-y-4">
								{Array(3)
									.fill(0)
									.map((_, i) => (
										<div
											key={i}
											className="flex justify-between items-center py-2 border-white/10 border-b"
										>
											<div className="flex flex-col">
												<p className="font-semibold text-white">
													Discussion on CAACO query
												</p>
												<p className="text-gray-400 text-xs">Google meet</p>
											</div>

											<div className="flex flex-col items-end gap-1 text-gray-400 text-xs">
												<span>today 2.30 pm – 3.30 pm</span>
												<div className="flex items-center gap-2">
													<Calendar className="w-4 h-4" />
													<button className="font-medium text-white">join now</button>
												</div>
											</div>
										</div>
									))}
							</TabsContent>

							<TabsContent value="past" className="space-y-3">
								<p className="text-gray-400">No past meetings available</p>
							</TabsContent>
						</Tabs>
					</TabsContent>

					<TabsContent value="emails" className="text-sm">
						<Tabs defaultValue="important">
							<TabsList className="flex gap-6 bg-transparent mb-4">
								<TabsTrigger value="important" className="data-[state=active]:bg-transparent data-[state=active]:font-medium text-gray-400 data-[state=active]:text-white text-sm">
									Important
								</TabsTrigger>
								<TabsTrigger value="threads" className="data-[state=active]:bg-transparent data-[state=active]:font-medium text-gray-400 data-[state=active]:text-white text-sm">
									Thread summaries
								</TabsTrigger>
							</TabsList>

							<TabsContent value="important" className="space-y-3">
								{[
									{ name: "Pratham Shankwalker", subject: "APPROVAL FOR PRD", message: "Please approve the PRD by EOD." },
									{
										name: "Apoorva Naik",
										subject: "Requesting for external resources to conduct survey",
										message: "Could you please provide the necessary resources?"
									},
								].map((mail, i) => (
									<div
										key={i}
										className="flex justify-between items-center pb-2 border-white/10 border-b"
									>
										<div>
											<p className="font-bold">{mail.name}</p>
											<p className="w-40 overflow-hidden font-bold text-gray-400 text-xs text-ellipsis whitespace-nowrap">
												{mail.subject}
											</p>
											<p className="w-40 overflow-hidden text-gray-400 text-xs text-ellipsis whitespace-nowrap">
												{mail.message}
											</p>
										</div>
										<div className="flex flex-col flex-wrap items-end gap-3 text-gray-400 text-xs">
											<span>today 2.30 pm</span>
											<div className="flex items-center gap-2">
												<button className="font-medium text-white">Reply</button>
												<Menu className="w-4 h-4 text-gray-400" />
											</div>
										</div>
									</div>
								))}
							</TabsContent>

							<TabsContent value="threads" className="space-y-3">
								<p className="text-gray-400">No thread summaries available</p>
							</TabsContent>
						</Tabs>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};

export default Dashboard;