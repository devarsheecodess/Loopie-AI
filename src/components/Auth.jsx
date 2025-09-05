import { LoginForm } from "./ui/login-form"
import LoopieLogo from "../assets/loopie-logo.png"
import AuthBG from "../assets/auth-bg.png"

export default function Auth() {
	return (
		<div className="grid lg:grid-cols-2 bg-white min-h-svh draggable">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center md:justify-start gap-2">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="flex justify-center items-center bg-primary rounded-md size-6 text-primary-foreground">
							{/* <GalleryVerticalEnd className="size-4" /> */}
							<img src={LoopieLogo} className="size-4" />
						</div>
						Loopie
					</a>
				</div>
				<div className="flex flex-1 justify-center items-center">
					<div className="w-full max-w-xs">
						<LoginForm />
						<p className="mt-3 text-[10px] text-center">By signing up you agree to the <u>terms and conditions</u> and <u>privacy policy</u></p>
					</div>
				</div>
			</div>
			<div className="hidden lg:block relative bg-muted">
				<img
					src={AuthBG}
					alt="Image"
					className="absolute inset-0 dark:brightness-[0.2] dark:grayscale w-full h-full object-cover"
				/>
			</div>
		</div>
	)
}