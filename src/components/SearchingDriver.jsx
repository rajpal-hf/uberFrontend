import { Search } from "lucide-react";

export default function SearchingDriver() {
	return (
		<div className="p-4 flex items-center justify-center min-h-[60vh]">
			<div className="text-center">
				<div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
					<Search className="w-12 h-12 text-white" />
				</div>
				<h2 className="text-2xl font-bold mb-2">Finding your ride...</h2>
				<p className="text-gray-600">Connecting you with nearby drivers</p>
			</div>
		</div>
	);
}
	