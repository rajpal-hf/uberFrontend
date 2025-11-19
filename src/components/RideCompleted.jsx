import { Star } from "lucide-react";

export default function RideCompleted({ selectedRide, distance, onDone }) {
	return (
		<div className="p-4">
			<div className="bg-white rounded-2xl shadow-sm p-6 text-center">

				<div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
					</svg>
				</div>

				<h2 className="text-2xl font-bold mb-2">You arrived!</h2>
				<p className="text-gray-600 mb-8">Hope you enjoyed your ride</p>

				{/* Summary */}
				<div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
					<div className="flex justify-between mb-4">
						<span className="text-gray-600">Trip fare</span>
						<span className="font-bold">${selectedRide.price.toFixed(2)}</span>
					</div>

					<div className="flex justify-between mb-4">
						<span className="text-gray-600">Distance</span>
						<span className="font-semibold">{distance.toFixed(2)} km</span>
					</div>

					<div className="flex justify-between pt-4 border-t">
						<span className="font-bold">Total</span>
						<span className="font-bold text-xl">${selectedRide.price.toFixed(2)}</span>
					</div>
				</div>

				{/* Rating */}
				<div className="mb-6">
					<p className="font-semibold mb-3">Rate your driver</p>
					<div className="flex justify-center gap-2">
						{[1, 2, 3, 4, 5].map((s) => (
							<button key={s} className="text-3xl hover:scale-110 transition">
								<Star className="w-10 h-10 fill-yellow-400 text-yellow-400" />
							</button>
						))}
					</div>
				</div>

				<button
					onClick={onDone}
					className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg"
				>
					Done
				</button>
			</div>
		</div>
	);
}
