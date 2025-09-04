declare module "@/lib/utils" {
	export function cn(...inputs: any[]): string;
}

declare module "*.png" {
	const value: string;
	export default value;
}