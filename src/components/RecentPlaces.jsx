import { ChevronRight } from "lucide-react";

export default function RecentPlaces({ places, onSelect }) {
	return (
		<div>
			<h3 className="font-semibold mb-3 px-2">Recent</h3>
			<div className="space-y-2">
				{places.map((p, i) => (
					<button
						key={i}
						onClick={() => onSelect(p)}
						className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 transition"
					>
						<div className="text-2xl">{p.icon}</div>
						<div className="flex-1 text-left">
							<div className="font-semibold">{p.name}</div>
							<div className="text-sm text-gray-600">{p.address}</div>
						</div>
						<ChevronRight className="w-5 h-5 text-gray-400" />
					</button>
				))}
			</div>
		</div>
	);
}
