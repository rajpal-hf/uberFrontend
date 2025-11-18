// add logics : 
// 1. calculate distance on frontend as i  have coordinates
// 2. calculate estimated time on frontend 
// 3. calculate estimated fare on frontend




import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, Navigation, Search, Clock, Star, ChevronRight, User, CreditCard, Gift, HelpCircle, LogOut, Crosshair } from 'lucide-react';

export default function UberRider() {
	const [showMenu, setShowMenu] = useState(false);
	const [step, setStep] = useState('home'); // 'home', 'searching', 'driver-found', 'in-ride', 'completed'
	const [pickup, setPickup] = useState('');
	const [dropoff, setDropoff] = useState('');
	const [pickupCoords, setPickupCoords] = useState(null);
	const [dropoffCoords, setDropoffCoords] = useState(null);
	const [selectedRide, setSelectedRide] = useState(null);
	const [driver, setDriver] = useState(null);
	const [pickupSuggestions, setPickupSuggestions] = useState([]);
	const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
	const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
	const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
	const [gettingLocation, setGettingLocation] = useState(false);

	const rideTypes = [
		{ id: 'uberx', name: 'UberX', description: 'Affordable, everyday rides', price: 12.50, time: '3 min', capacity: 4, icon: '🚗' },
		{ id: 'comfort', name: 'Comfort', description: 'Newer cars with extra legroom', price: 15.75, time: '5 min', capacity: 4, icon: '🚙' },
		{ id: 'xl', name: 'UberXL', description: 'Affordable rides for groups up to 6', price: 18.50, time: '4 min', capacity: 6, icon: '🚐' },
		{ id: 'black', name: 'Uber Black', description: 'Premium rides in luxury cars', price: 25.00, time: '8 min', capacity: 4, icon: '🚘' },
	];

	const recentPlaces = [
		{ name: 'Home', address: '123 Main Street, Apartment 4B', icon: '🏠', coords: { lat: 30.7046, lng: 76.7179 } },
		{ name: 'Work', address: '456 Business Park, Office 201', icon: '💼', coords: { lat: 30.7100, lng: 76.7200 } },
		{ name: 'Gym', address: '789 Fitness Avenue', icon: '💪', coords: { lat: 30.7000, lng: 76.7150 } },
	];

	// Get current location
	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by your browser');
			return;
		}

		setGettingLocation(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				// Reverse geocode to get address
				try {
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
					);
					const data = await response.json();
					const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

					setPickup(address);
					setPickupCoords({ lat, lng });
					console.log('Current Location:', { address, lat, lng });
				} catch (error) {
					console.error('Error getting address:', error);
					setPickup(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
					setPickupCoords({ lat, lng });
				}

				setGettingLocation(false);
			},
			(error) => {
				console.error('Error getting location:', error);
				alert('Unable to get your location. Please enter manually.');
				setGettingLocation(false);
			}
		);
	};

	// Search for locations using Nominatim (OpenStreetMap)
	const searchLocation = async (query, isPickup) => {
		if (query.length < 3) {
			if (isPickup) {
				setPickupSuggestions([]);
				setShowPickupSuggestions(false);
			} else {
				setDropoffSuggestions([]);
				setShowDropoffSuggestions(false);
			}
			return;
		}

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
			);
			const data = await response.json();

			const suggestions = data.map(item => ({
				name: item.display_name,
				lat: parseFloat(item.lat),
				lng: parseFloat(item.lon)
			}));

			if (isPickup) {
				setPickupSuggestions(suggestions);
				setShowPickupSuggestions(true);
			} else {
				setDropoffSuggestions(suggestions);
				setShowDropoffSuggestions(true);
			}
		} catch (error) {
			console.error('Error searching location:', error);
		}
	};

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (pickup) searchLocation(pickup, true);
		}, 500);
		return () => clearTimeout(timer);
	}, [pickup]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (dropoff) searchLocation(dropoff, false);
		}, 500);
		return () => clearTimeout(timer);
	}, [dropoff]);

	const selectPickupLocation = (suggestion) => {
		setPickup(suggestion.name);
		setPickupCoords({ lat: suggestion.lat, lng: suggestion.lng });
		setShowPickupSuggestions(false);
		console.log('Pickup Selected:', suggestion);
	};

	const selectDropoffLocation = (suggestion) => {
		setDropoff(suggestion.name);
		setDropoffCoords({ lat: suggestion.lat, lng: suggestion.lng });
		setShowDropoffSuggestions(false);
		console.log('Dropoff Selected:', suggestion);
	};

	const requestRide = () => {
		console.log('Requesting ride with:', {
			pickup: { address: pickup, coordinates: pickupCoords },
			dropoff: { address: dropoff, coordinates: dropoffCoords }
		});

		setStep('searching');
		setTimeout(() => {
			setDriver({
				name: 'John Smith',
				rating: 4.9,
				trips: 1250,
				car: 'Toyota Camry',
				plate: 'ABC 123',
				photo: '👨'
			});
			setStep('driver-found');
		}, 3000);
	};

	const startRide = () => {
		setStep('in-ride');
	};

	const completeRide = () => {
		setStep('completed');
	};

	const resetRide = () => {
		setStep('home');
		setPickup('');
		setDropoff('');
		setPickupCoords(null);
		setDropoffCoords(null);
		setSelectedRide(null);
		setDriver(null);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Header */}
			<div className="bg-black text-white p-4 flex items-center justify-between">
				<button onClick={() => setShowMenu(true)}>
					<Menu className="w-6 h-6" />
				</button>
				<h1 className="text-xl font-bold">Uber</h1>
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
									<h3 className="font-bold text-lg">Alex Rider</h3>
									<div className="flex items-center gap-1 text-sm text-gray-600">
										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										<span>4.8</span>
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
									<Clock className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Your Trips</span>
									<ChevronRight className="w-5 h-5 text-gray-400" />
								</button>
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
									<CreditCard className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Payment</span>
									<ChevronRight className="w-5 h-5 text-gray-400" />
								</button>
								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
									<Gift className="w-5 h-5" />
									<span className="flex-1 text-left font-medium">Promotions</span>
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
			<div className="flex-1 overflow-y-auto">
				{/* Home/Booking Screen */}
				{step === 'home' && (
					<div className="p-4 space-y-4">
						{/* Location Inputs */}
						<div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
							<div className="flex items-center gap-3">
								<div className="flex flex-col items-center gap-2">
									<div className="w-3 h-3 bg-black rounded-full" />
									<div className="w-0.5 h-8 bg-gray-300" />
									<MapPin className="w-4 h-4 text-red-500" />
								</div>
								<div className="flex-1 space-y-3 relative">
									{/* Pickup Input */}
									<div className="relative">
										<div className="flex gap-2">
											<input
												type="text"
												value={pickup}
												onChange={(e) => setPickup(e.target.value)}
												onFocus={() => pickup && setShowPickupSuggestions(true)}
												placeholder="Pickup location"
												className="flex-1 p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
											/>
											<button
												onClick={getCurrentLocation}
												disabled={gettingLocation}
												className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
												title="Use current location"
											>
												{gettingLocation ? (
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												) : (
													<Crosshair className="w-5 h-5" />
												)}
											</button>
										</div>

										{/* Pickup Suggestions */}
										{showPickupSuggestions && pickupSuggestions.length > 0 && (
											<div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
												{pickupSuggestions.map((suggestion, idx) => (
													<button
														key={idx}
														onClick={() => selectPickupLocation(suggestion)}
														className="w-full p-3 text-left hover:bg-gray-100 transition border-b last:border-b-0"
													>
														<div className="flex items-start gap-2">
															<MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
															<span className="text-sm">{suggestion.name}</span>
														</div>
													</button>
												))}
											</div>
										)}
									</div>

									{/* Dropoff Input */}
									<div className="relative">
										<input
											type="text"
											value={dropoff}
											onChange={(e) => setDropoff(e.target.value)}
											onFocus={() => dropoff && setShowDropoffSuggestions(true)}
											placeholder="Where to?"
											className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
										/>

										{/* Dropoff Suggestions */}
										{showDropoffSuggestions && dropoffSuggestions.length > 0 && (
											<div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
												{dropoffSuggestions.map((suggestion, idx) => (
													<button
														key={idx}
														onClick={() => selectDropoffLocation(suggestion)}
														className="w-full p-3 text-left hover:bg-gray-100 transition border-b last:border-b-0"
													>
														<div className="flex items-start gap-2">
															<MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
															<span className="text-sm">{suggestion.name}</span>
														</div>
													</button>
												))}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Show coordinates if available */}
							{(pickupCoords || dropoffCoords) && (
								<div className="text-xs text-gray-500 pt-2 border-t">
									{pickupCoords && (
										<div>Pickup: {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}</div>
									)}
									{dropoffCoords && (
										<div>Dropoff: {dropoffCoords.lat.toFixed(4)}, {dropoffCoords.lng.toFixed(4)}</div>
									)}
								</div>
							)}
						</div>

						{/* Recent Places */}
						<div>
							<h3 className="font-semibold mb-3 px-2">Recent</h3>
							<div className="space-y-2">
								{recentPlaces.map((place, idx) => (
									<button
										key={idx}
										onClick={() => {
											setDropoff(place.address);
											setDropoffCoords(place.coords);
											console.log('Recent place selected:', place);
										}}
										className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 transition"
									>
										<div className="text-2xl">{place.icon}</div>
										<div className="flex-1 text-left">
											<div className="font-semibold">{place.name}</div>
											<div className="text-sm text-gray-600">{place.address}</div>
										</div>
										<ChevronRight className="w-5 h-5 text-gray-400" />
									</button>
								))}
							</div>
						</div>

						{/* Ride Options */}
						{pickup && dropoff && pickupCoords && dropoffCoords && (
							<div>
								<h3 className="font-semibold mb-3 px-2">Choose a ride</h3>
								<div className="space-y-3">
									{rideTypes.map((ride) => (
										<button
											key={ride.id}
											onClick={() => setSelectedRide(ride)}
											className={`w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 transition ${selectedRide?.id === ride.id ? 'ring-2 ring-black' : ''
												}`}
										>
											<div className="text-3xl">{ride.icon}</div>
											<div className="flex-1 text-left">
												<div className="font-semibold flex items-center gap-2">
													{ride.name}
													<span className="text-xs text-gray-600">{ride.time}</span>
												</div>
												<div className="text-sm text-gray-600">{ride.description}</div>
											</div>
											<div className="text-right">
												<div className="font-bold text-lg">${ride.price.toFixed(2)}</div>
											</div>
										</button>
									))}
								</div>

								<button
									onClick={requestRide}
									disabled={!selectedRide}
									className="w-full mt-4 bg-black text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition"
								>
									Request {selectedRide?.name || 'Ride'}
								</button>
							</div>
						)}
					</div>
				)}

				{/* Searching for Driver */}
				{step === 'searching' && (
					<div className="p-4 flex items-center justify-center min-h-[60vh]">
						<div className="text-center">
							<div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
								<Search className="w-12 h-12 text-white" />
							</div>
							<h2 className="text-2xl font-bold mb-2">Finding your ride...</h2>
							<p className="text-gray-600">Connecting you with nearby drivers</p>
						</div>
					</div>
				)}

				{/* Driver Found */}
				{step === 'driver-found' && driver && (
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

							{/* Car Info */}
							<div className="flex items-center justify-between mb-6">
								<div>
									<div className="font-semibold">{driver.car}</div>
									<div className="text-gray-600">{driver.plate}</div>
								</div>
								<div className="text-4xl">🚗</div>
							</div>

							{/* Trip Details */}
							<div className="space-y-3 mb-6">
								<div className="flex items-start gap-3">
									<div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<div className="w-2 h-2 bg-white rounded-full" />
									</div>
									<div className="flex-1">
										<div className="text-xs text-gray-600 mb-1">Pickup</div>
										<div className="font-medium text-sm">{pickup}</div>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<MapPin className="w-8 h-8 text-red-500 flex-shrink-0" />
									<div className="flex-1">
										<div className="text-xs text-gray-600 mb-1">Dropoff</div>
										<div className="font-medium text-sm">{dropoff}</div>
									</div>
								</div>
							</div>

							<button
								onClick={startRide}
								className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
							>
								Driver Arrived
							</button>
						</div>

						<button
							onClick={resetRide}
							className="w-full bg-white text-red-600 py-3 rounded-xl font-semibold border-2 border-red-200 hover:bg-red-50 transition"
						>
							Cancel Ride
						</button>
					</div>
				)}

				{/* In Ride */}
				{step === 'in-ride' && driver && (
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

							{/* Driver Info */}
							<div className="flex items-center gap-4 mb-6 pb-6 border-b">
								<div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-3xl">
									{driver.photo}
								</div>
								<div className="flex-1">
									<div className="font-bold text-lg">{driver.name}</div>
									<div className="text-sm text-gray-600">{driver.car} • {driver.plate}</div>
								</div>
							</div>

							{/* Trip Progress */}
							<div className="space-y-3 mb-6">
								<div className="flex items-start gap-3 opacity-50">
									<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
										<div className="w-2 h-2 bg-white rounded-full" />
									</div>
									<div className="flex-1">
										<div className="text-xs text-gray-600 mb-1">Picked up from</div>
										<div className="font-medium text-sm">{pickup}</div>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<MapPin className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse" />
									<div className="flex-1">
										<div className="text-xs text-gray-600 mb-1">Heading to</div>
										<div className="font-medium text-sm">{dropoff}</div>
									</div>
								</div>
							</div>

							<button
								onClick={completeRide}
								className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg font-semibold"
							>
								Simulate Arrival
							</button>
						</div>
					</div>
				)}

				{/* Ride Completed */}
				{step === 'completed' && (
					<div className="p-4">
						<div className="bg-white rounded-2xl shadow-sm p-6 text-center">
							<div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
								<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
								</svg>
							</div>

							<h2 className="text-2xl font-bold mb-2">You arrived!</h2>
							<p className="text-gray-600 mb-8">Hope you enjoyed your ride</p>

							{/* Trip Summary */}
							<div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
								<div className="flex justify-between mb-4">
									<span className="text-gray-600">Trip fare</span>
									<span className="font-bold">${selectedRide?.price.toFixed(2)}</span>
								</div>
								<div className="flex justify-between mb-4">
									<span className="text-gray-600">Distance</span>
									<span className="font-semibold">5.2 km</span>
								</div>
								<div className="flex justify-between pt-4 border-t">
									<span className="font-bold">Total</span>
									<span className="font-bold text-xl">${selectedRide?.price.toFixed(2)}</span>
								</div>
							</div>

							{/* Rate Driver */}
							<div className="mb-6">
								<p className="font-semibold mb-3">Rate your driver</p>
								<div className="flex justify-center gap-2">
									{[1, 2, 3, 4, 5].map((star) => (
										<button key={star} className="text-3xl hover:scale-110 transition">
											<Star className="w-10 h-10 fill-yellow-400 text-yellow-400" />
										</button>
									))}
								</div>
							</div>

							<button
								onClick={resetRide}
								className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition"
							>
								Done
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}