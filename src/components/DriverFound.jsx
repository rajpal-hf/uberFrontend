import { Star, MapPin } from "lucide-react";

export default function DriverFound({
	driver,
	pickup,
	dropoff,
	onStartRide,
	onCancel,
}) {
	return (
		<div className="p-4 space-y-4">
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<div className="text-center mb-6">
					<div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold mb-4">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						Driver on the way
					</div>
					<div className="text-3xl font-bold mb-1">2 min</div>
					<div className="text-gray-600">Estimated arrival</div>
				</div>

				{/* Driver Info */}
				<div className="flex items-center gap-4 mb-6 pb-6 border-b">
					<div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-3xl">
						{driver.photo}
					</div>
					<div className="flex-1">
						<div className="font-bold text-lg">{driver.name}</div>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
							<span>{driver.rating}</span>
							<span>•</span>
							<span>{driver.trips} trips</span>
						</div>
					</div>
				</div>

				{/* Car */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<div className="font-semibold">{driver.car}</div>
						<div className="text-gray-600">{driver.plate}</div>
					</div>
					<div className="text-4xl">🚗</div>
				</div>

				{/* Pickup & Dropoff */}
				<div className="space-y-3 mb-6">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mt-1">
							<div className="w-2 h-2 bg-white rounded-full" />
						</div>
						<div>
							<div className="text-xs text-gray-600">Pickup</div>
							<div className="text-sm">{pickup}</div>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<MapPin className="w-8 h-8 text-red-500" />
						<div>
							<div className="text-xs text-gray-600">Dropoff</div>
							<div className="text-sm">{dropoff}</div>
						</div>
					</div>
				</div>

				<button
					onClick={onStartRide}
					className="w-full bg-black text-white py-3 rounded-lg font-semibold"
				>
					Driver Arrived
				</button>
			</div>

			<button
				onClick={onCancel}
				className="w-full bg-white text-red-600 py-3 rounded-xl font-semibold border-2 border-red-200 hover:bg-red-50"
			>
				Cancel Ride
			</button>
		</div>
	);
}
