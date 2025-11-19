export default function RideOptions({
	rideTypes,
	selectedRide,
	onSelectRide,
	distance,
	eta,
	fare,
}) {
	return (
		<div>
			<h3 className="font-semibold mb-3 px-2">Choose a ride</h3>

			<div className="space-y-3">
				{rideTypes.map((ride) => {
					const rideFare = fare(ride.id);
					const rideArrivalTime = ride.time;

					return (
						<button
							key={ride.id}
							onClick={() => onSelectRide(ride)}
							className={`w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 transition 
								${selectedRide?.id === ride.id ? "ring-2 ring-black" : ""}
							`}
						>
							<div className="text-3xl">{ride.icon}</div>

							<div className="flex-1 text-left">
								<div className="font-semibold flex items-center gap-2">
									{ride.name}
									<span className="text-xs text-gray-600">{rideArrivalTime}</span>
								</div>
								<div className="text-sm text-gray-600">{ride.description}</div>

								<div className="text-xs text-gray-500 mt-1">
									Distance: {distance.toFixed(2)} km • ETA: {eta} h
								</div>
							</div>

							<div className="text-right">
								<div className="font-bold text-lg"> ₹ {rideFare}</div>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
