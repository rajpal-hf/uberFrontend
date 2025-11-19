import { Navigation, MapPin } from "lucide-react";

export default function InRide({ driver, pickup, dropoff, onComplete }) {
	return (
		<div className="p-4">
			<div className="bg-white rounded-2xl shadow-sm p-6">

				<div className="text-center mb-6">
					<div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold mb-4">
						<Navigation className="w-4 h-4" />
						In progress
					</div>
					<div className="text-3xl font-bold mb-1">12 min</div>
					<div className="text-gray-600">To destination</div>
				</div>

				{/* Driver */}
				<div className="flex items-center gap-4 mb-6 pb-6 border-b">
					<div className="w-16 h-16 text-3xl bg-gray-300 rounded-full flex items-center justify-center">
						{driver.photo}
					</div>
					<div>
						<div className="font-bold text-lg">{driver.name}</div>
						<div className="text-sm text-gray-600">
							{driver.car} • {driver.plate}
						</div>
					</div>
				</div>

				{/* Trip */}
				<div className="space-y-3 mb-6">
					<div className="flex items-start gap-3 opacity-50">
						<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
							<div className="w-2 h-2 bg-white rounded-full" />
						</div>
						<div>
							<div className="text-xs text-gray-600">Picked up from</div>
							<div className="text-sm">{pickup}</div>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<MapPin className="w-8 h-8 text-red-500 animate-pulse" />
						<div>
							<div className="text-xs text-gray-600">Heading to</div>
							<div className="text-sm">{dropoff}</div>
						</div>
					</div>
				</div>

				<button
					onClick={onComplete}
					className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold"
				>
					Simulate Arrival
				</button>
			</div>
		</div>
	);
}
