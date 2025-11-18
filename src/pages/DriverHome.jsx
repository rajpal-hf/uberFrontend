import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, Navigation, DollarSign, Clock, Star, ChevronRight, User, Settings, HelpCircle, LogOut } from 'lucide-react';

export default function UberDriver() {
	const [isOnline, setIsOnline] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [currentRide, setCurrentRide] = useState(null);
	const [earnings, setEarnings] = useState(245.50);
	const [trips, setTrips] = useState(12);
	const [rating, setRating] = useState(4.8);
	const [hours, setHours] = useState(5.5);

	const rideRequests = [
		{ id: 1, name: 'John Doe', pickup: '123 Main St', dropoff: '456 Park Ave', distance: '2.5 km', fare: 15.50, rating: 4.9 },
		{ id: 2, name: 'Sarah Smith', pickup: '789 Oak Rd', dropoff: '321 Elm St', distance: '4.2 km', fare: 22.00, rating: 5.0 },
		{ id: 3, name: 'Mike Johnson', pickup: '555 Pine Blvd', dropoff: '888 Maple Dr', distance: '1.8 km', fare: 12.75, rating: 4.7 },
	];

	const acceptRide = (ride) => {
		setCurrentRide({ ...ride, status: 'accepted' });
	};

	const startRide = () => {
		setCurrentRide({ ...currentRide, status: 'started' });
	};

	const completeRide = () => {
		setEarnings(prev => prev + currentRide.fare);
		setTrips(prev => prev + 1);
		setCurrentRide(null);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Header */}
			<div className="bg-black text-white p-4 flex items-center justify-between">
				<button onClick={() => setShowMenu(true)}>
					<Menu className="w-6 h-6" />
				</button>
				<h1 className="text-xl font-bold">Uber Driver</h1>
				<div className="w-6" />
			</div>

			{/* Side Menu */}
			{showMenu && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMenu(false)} />
					<div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
						<div className="p-6">
							<button onClick={() => setShowMenu(false)} className="mb-6">
								<X className="w-6 h-6" />
							</button>

							{/* Profile Section */}
							<div className="flex items-center gap-4 mb-8 pb-6 border-b">
								<div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
									<User className="w-8 h-8 text-gray-600" />
								</div>
								<div>
									<h3 className="font-bold text-lg">Alex Driver</h3>
									<div className="flex items-center gap-1 text-sm text-gray-600">
										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										<span>{rating}</span>
									</div>
								</div>
							</div>

							{/* Menu Items */}
							<nav className="space-y-1">
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
									<User className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Profile</span>
									<ChevronRight className="w-5 h-5 text-gray-400" />
								</button>
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
									<DollarSign className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Earnings</span>
									<ChevronRight className="w-5 h-5 text-gray-400" />
								</button>
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
									<Settings className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Settings</span>
									<ChevronRight className="w-5 h-5 text-gray-400" />
								</button>
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
									<HelpCircle className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Help</span>
									<ChevronRight className="w-5 h-5 text-gray-400" />
								</button>
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition text-red-600">
									<LogOut className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Logout</span>
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto p-4">
				{/* Online/Offline Toggle */}
				<div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h2 className="text-xl font-bold mb-1">
								{isOnline ? "You're Online" : "You're Offline"}
							</h2>
							<p className="text-sm text-gray-600">
								{isOnline ? "Ready to accept rides" : "Go online to start accepting rides"}
							</p>
						</div>
						<button
							onClick={() => setIsOnline(!isOnline)}
							className={`relative w-16 h-8 rounded-full transition ${isOnline ? 'bg-green-500' : 'bg-gray-300'
								}`}
						>
							<div
								className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-8' : ''
									}`}
							/>
						</button>
					</div>

					{/* Stats */}
					{isOnline && (
						<div className="grid grid-cols-4 gap-4 pt-4 border-t">
							<div className="text-center">
								<div className="text-2xl font-bold">${earnings.toFixed(2)}</div>
								<div className="text-xs text-gray-600">Earnings</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold">{trips}</div>
								<div className="text-xs text-gray-600">Trips</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold">{hours}h</div>
								<div className="text-xs text-gray-600">Online</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold flex items-center justify-center gap-1">
									<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
									{rating}
								</div>
								<div className="text-xs text-gray-600">Rating</div>
							</div>
						</div>
					)}
				</div>

				{/* Current Ride */}
				{currentRide && (
					<div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border-2 border-green-500">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold">Current Ride</h3>
							<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
								{currentRide.status === 'accepted' ? 'Heading to pickup' : 'In progress'}
							</span>
						</div>

						<div className="space-y-4">
							{/* Passenger Info */}
							<div className="flex items-center gap-3 pb-4 border-b">
								<div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
									<User className="w-6 h-6 text-gray-600" />
								</div>
								<div className="flex-1">
									<div className="font-semibold">{currentRide.name}</div>
									<div className="flex items-center gap-1 text-sm text-gray-600">
										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										<span>{currentRide.rating}</span>
									</div>
								</div>
								<div className="text-xl font-bold text-green-600">${currentRide.fare.toFixed(2)}</div>
							</div>

							{/* Locations */}
							<div className="space-y-3">
								<div className="flex gap-3">
									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
										<MapPin className="w-4 h-4 text-green-600" />
									</div>
									<div>
										<div className="text-xs text-gray-600 mb-1">Pickup</div>
										<div className="font-medium">{currentRide.pickup}</div>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
										<Navigation className="w-4 h-4 text-red-600" />
									</div>
									<div>
										<div className="text-xs text-gray-600 mb-1">Dropoff</div>
										<div className="font-medium">{currentRide.dropoff}</div>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-3 pt-4">
								{currentRide.status === 'accepted' ? (
									<button
										onClick={startRide}
										className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
									>
										Start Ride
									</button>
								) : (
									<button
										onClick={completeRide}
										className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
									>
										Complete Ride
									</button>
								)}
								<button className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Available Rides */}
				{isOnline && !currentRide && (
					<div>
						<h3 className="text-lg font-bold mb-3">Available Rides</h3>
						<div className="space-y-3">
							{rideRequests.map((ride) => (
								<div key={ride.id} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition">
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
												<User className="w-6 h-6 text-gray-600" />
											</div>
											<div>
												<div className="font-semibold">{ride.name}</div>
												<div className="flex items-center gap-1 text-sm text-gray-600">
													<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
													<span>{ride.rating}</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="text-xl font-bold text-green-600">${ride.fare.toFixed(2)}</div>
											<div className="text-xs text-gray-600">{ride.distance}</div>
										</div>
									</div>

									<div className="space-y-2 mb-3">
										<div className="flex items-start gap-2 text-sm">
											<MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
											<span className="text-gray-700">{ride.pickup}</span>
										</div>
										<div className="flex items-start gap-2 text-sm">
											<Navigation className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
											<span className="text-gray-700">{ride.dropoff}</span>
										</div>
									</div>

									<button
										onClick={() => acceptRide(ride)}
										className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
									>
										Accept Ride
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Offline State */}
				{!isOnline && (
					<div className="bg-white rounded-2xl shadow-sm p-12 text-center">
						<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Navigation className="w-10 h-10 text-gray-400" />
						</div>
						<h3 className="text-xl font-bold mb-2">You're Offline</h3>
						<p className="text-gray-600 mb-6">
							Turn on to start accepting ride requests and earning money
						</p>
						<button
							onClick={() => setIsOnline(true)}
							className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
						>
							Go Online
						</button>
					</div>
				)}
			</div>
		</div>
	);
}