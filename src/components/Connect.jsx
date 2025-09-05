import { Button } from "./ui/button";
import LoopieLogo from "@/assets/loopie-logo.png";
import GoogleCalendarLogo from "@/assets/google-calendar.png";
import GmailLogo from "@/assets/gmail.svg";
import JiraLogo from "@/assets/jira.svg";
import SlackLogo from "@/assets/slack.svg";
import AuthBG from "@/assets/auth-bg.png";
import { Link } from "react-router-dom";

const Connect = () => {
	const connectCalendar = () => {
		try {
			alert("Connect Calendar clicked");
		} catch (err) {
			console.log(err);
		}
	};

	const connectEmail = () => {
		try {
			alert("Connect Email clicked");
		} catch (err) {
			console.log(err);
		}
	};

	const connectJira = () => {
		try {
			alert("Connect Jira clicked");
		} catch (err) {
			console.log(err);
		}
	};

	const connectSlack = () => {
		try {
			alert("Connect Slack clicked");
		} catch (err) {
			console.log(err);
		}
	};

	const apps = [
		{
			name: "Google Calendar",
			description:
				"Connect your calendar, email, and meeting apps to get automated briefs and smart scheduling.",
			logo: GoogleCalendarLogo,
			trigger: connectCalendar,
		},
		{
			name: "Gmail",
			description:
				"Connect your calendar, email, and meeting apps to get automated briefs and smart scheduling.",
			logo: GmailLogo,
			trigger: connectEmail,
		},
		{
			name: "Jira",
			description:
				"Connect your calendar, email, and meeting apps to get automated briefs and smart scheduling.",
			logo: JiraLogo,
			trigger: connectJira,
		},
		{
			name: "Slack",
			description:
				"Connect your calendar, email, and meeting apps to get automated briefs and smart scheduling.",
			logo: SlackLogo,
			trigger: connectSlack,
		},
	];

	return (
		<div className="grid lg:grid-cols-2 bg-white h-screen draggable">
			<div className="flex flex-col p-6 md:p-10 h-full">
				<div className="flex flex-col items-center md:items-start gap-4">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="flex justify-center items-center bg-primary rounded-md size-8 text-primary-foreground">
							<img src={LoopieLogo} alt="Logo" className="size-4" />
						</div>
					</a>

					<h1 className="font-bold text-xl md:text-left text-center">
						Connect your Apps
					</h1>
				</div>

				<div className="flex-1 mt-4 overflow-y-auto">
					<div className="flex flex-col gap-6">
						{apps.map((app, index) => (
							<div
								key={index}
								className="flex justify-between items-center gap-4"
							>
								<div className="flex items-center gap-4">
									<img src={app.logo} alt={app.name} className="size-8" />
									<p className="max-w-xs text-gray-700 text-sm">
										{app.description}
									</p>
								</div>
								<Button
									onClick={app.trigger}
									variant="outline"
									className="px-3 py-1 text-xs"
								>
									Connect
								</Button>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col items-center gap-3 mt-3">
					<Link to="/chat" className="text-gray-500 text-sm hover:underline">
						Skip
					</Link>

					<div className="text-gray-500 text-xs text-center">
						By signing up you agree to the{" "}
						<a href="#" className="underline">
							terms and conditions
						</a>{" "}
						and{" "}
						<a href="#" className="underline">
							privacy policy
						</a>
					</div>
				</div>
			</div>

			<div className="hidden lg:block relative bg-muted">
				<img
					src={AuthBG}
					alt="Background"
					className="absolute inset-0 dark:brightness-[0.2] dark:grayscale w-full h-full object-cover"
				/>
			</div>
		</div>
	);
};

export default Connect;
