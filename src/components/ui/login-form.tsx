import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleLogo from '../../assets/google-logo.png'
import { useNavigate } from 'react-router-dom'

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const navigate = useNavigate();

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			navigate('/connect');
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={handleLogin}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="font-bold text-xl">Welcome To Loopie</h1>
				<p className="text-muted-foreground text-xs text-balance">
					Loopie records, summarizes, and schedules so you never miss what matters
				</p>
			</div>

			<div className="gap-4 grid">
				<div className="gap-2 grid">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" placeholder="m@example.com" />
				</div>

				<div className="gap-2 grid">
					<div className="flex items-center">
						<Label htmlFor="password">Password</Label>
						<a
							href="#"
							className="ml-auto text-xs hover:underline underline-offset-4"
						>
							Forgot your password?
						</a>
					</div>
					<Input id="password" type="password" />
				</div>

				<Button type="submit" className="w-full">
					Login
				</Button>

				<div className="after:top-1/2 after:z-0 after:absolute relative after:inset-0 after:flex after:items-center after:border-t after:border-border text-sm text-center">
					<span className="z-10 relative bg-background px-2 text-muted-foreground">
						Or
					</span>
				</div>

				<Button type="button" variant="outline" className="w-full">
					<img src={GoogleLogo} alt="Google Logo" className="mr-2 w-5 h-5" />
					Login with Google
				</Button>
			</div>
		</form>
	);
}
