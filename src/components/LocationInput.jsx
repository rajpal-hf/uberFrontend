import { MapPin, Crosshair } from "lucide-react";


export default function LocationInput({
	pickup,
	dropoff,
	onPickupChange,
	onDropoffChange,
	onUseCurrent,
	pickupSuggestions,
	dropoffSuggestions,
	onSelectPickup,
	onSelectDropoff,
}) {



	return (
		<div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">

			<div className="relative">
				<div className="flex gap-2">
					<input
						value={pickup}
						onChange={(e) => onPickupChange(e.target.value)}
						placeholder="Pickup location"
						className="flex-1 p-3 bg-gray-100 rounded-lg"
					/>
					<button onClick={onUseCurrent} className="p-3 bg-black text-white rounded-lg">
						<Crosshair className="w-5 h-5" />
					</button>
				</div>

				{pickupSuggestions.length > 0 && (
					<div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg">
						{pickupSuggestions.map((s, i) => (
							<button
								key={i}
								className="w-full p-3 text-left hover:bg-gray-100 flex gap-2"
								onClick={() => onSelectPickup(s)}
							>
								<MapPin className="w-4 h-4 text-gray-400 mt-1" />
								{s.name}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Dropoff */}
			<div className="relative">
				<input
					value={dropoff}
					onChange={(e) => onDropoffChange(e.target.value)}
					placeholder="Where to?"
					className="w-full p-3 bg-gray-100 rounded-lg"
				/>

				{dropoffSuggestions.length > 0 && (
					<div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg">
						{dropoffSuggestions.map((s, i) => (
							<button
								key={i}
								className="w-full p-3 text-left hover:bg-gray-100 flex gap-2"
								onClick={() => onSelectDropoff(s)}
							>
								<MapPin className="w-4 h-4 text-gray-400 mt-1" />
								{s.name}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
