import { Menu } from "lucide-react";

export default function Header({ onMenu }) {
	return (
		<div className="bg-black text-white p-4 flex items-center justify-between">
			<button onClick={onMenu}>
				<Menu className="w-6 h-6" />
			</button>
			<h1 className="text-xl font-bold">Uber</h1>
			<div className="w-6" />
		</div>
	);
}
