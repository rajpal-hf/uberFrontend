import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, DollarSign, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DriverHome = () => {
	const [rides, setRides] = useState([]);
	const [currentRide, setCurrentRide] = useState(null);
	const [driverStatus, setDriverStatus] = useState('offline');
	const [driverLocation, setDriverLocation] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [notification, setNotification] = useState(null);
	const wsRef = useRef(null);
	const locationIntervalRef = useRef(null);

	// Mock token - replace with actual auth token from your app
	const DRIVER_TOKEN = localStorage.getItem('token');
	const DRIVER_ID = localStorage.getItem('id');

	// Initialize WebSocket connection
	useEffect(() => {
		connectWebSocket();
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
			}
			if (locationIntervalRef.current) {
				clearInterval(locationIntervalRef.current);
			}
		};
	}, []);

	const connectWebSocket = () => {
		try {
			const ws = new WebSocket(`ws://localhost:3000/ws?token=${DRIVER_TOKEN}`);

			ws.onopen = () => {
				console.log('WebSocket Connected');
				setIsConnected(true);
				ws.send(JSON.stringify({ event: 'register' }));
				showNotification('Connected to server', 'success');
			};

			ws.onmessage = (event) => {
				const message = JSON.parse(event.data);
				handleWebSocketMessage(message);
			};

			ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				showNotification('Connection error', 'error');
			};

			ws.onclose = () => {
				console.log('WebSocket Disconnected');
				setIsConnected(false);
				showNotification('Disconnected from server', 'error');
				// Attempt to reconnect after 3 seconds
				setTimeout(connectWebSocket, 3000);
			};

			wsRef.current = ws;
		} catch (error) {
			console.error('Failed to connect:', error);
			showNotification('Failed to connect', 'error');
		}
	};

	const handleWebSocketMessage = (message) => {
		console.log('Received message:', message);

		switch (message.event) {
			case 'registered':
				console.log('Successfully registered');
				break;

			case 'new_ride':
				// Add new ride to the list if not already accepted
				if (!currentRide) {
					console.log('New ride request:', message.data);
					setRides(prev => {
						const exists = prev.some(r => r.rideId === message.data.rideId);
						if (!exists) {
							showNotification('New ride request!', 'info');
							return [...prev, message.data];
						}
						return prev;
					});
				}
				break;

			case 'ride_taken':
				console.log('Ride taken:', message.data);
				// Remove ride from list if another driver accepted it
				setRides(prev => prev.filter(r => r.rideId !== message.data.rideId));
				if (currentRide?.rideId === message.data.rideId && currentRide.status === 'pending') {
					showNotification('Ride was accepted by another driver', 'warning');
					setCurrentRide(null);
				}
				break;

			case '	':
				console.log('Ride accepted:', message.data);
				showNotification('Ride accepted successfully!', 'success');
				break;

			default:
				console.log('Unknown event:', message.event);
		}
	};

	// Start sharing location when driver goes online

	useEffect(() => {
		if (driverStatus === 'online' && !locationIntervalRef.current) {
			startLocationSharing();
		} else if (driverStatus === 'offline' && locationIntervalRef.current) {
			stopLocationSharing();
		}
	}, [driverStatus]);

	const startLocationSharing = () => {
		// Get initial location
		updateLocation();

		// Update location every 10 seconds
		locationIntervalRef.current = setInterval(() => {
			updateLocation();
		}, 10000);
	};

	const stopLocationSharing = () => {
		if (locationIntervalRef.current) {
			clearInterval(locationIntervalRef.current);
			locationIntervalRef.current = null;
		}
	};

	
	const updateLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					setDriverLocation(location);

					// Send location to server
					if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
						wsRef.current.send(JSON.stringify({
							event: 'driver_location',
							data: location
						}));
					}
				},
				(error) => {
					console.error('Geolocation error:', error);
					showNotification('Unable to get location', 'error');
				}
			);
		} else {
			// Mock location for demo
			const mockLocation = {
				lat: 30.7046 + (Math.random() - 0.5) * 0.01,
				lng: 76.7179 + (Math.random() - 0.5) * 0.01
			};
			setDriverLocation(mockLocation);
		}
	};

	const toggleDriverStatus = () => {
		setDriverStatus(prev => prev === 'offline' ? 'online' : 'offline');
		showNotification(
			driverStatus === 'offline' ? 'You are now online' : 'You are now offline',
			'success'
		);
	};

	const acceptRide = async (ride) => {

		console.log("ridddddddddddddddeeeeeeeeeeeeeeeeeeee",ride)
		if (currentRide) {
			showNotification('You already have an active ride', 'warning');
			return;
		}

		try {
			// Send accept message via WebSocket
			if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
				wsRef.current.send(JSON.stringify({
					event: 'accept_ride',
					data: { rideId: ride.rideId }
				}));
			}

			// Call REST API to accept ride
			const response = await fetch(`http://localhost:3000/ride/${ride.rideId}/accept`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${DRIVER_TOKEN}`
				},
				body: JSON.stringify({ driverId: DRIVER_ID })
			});

			if (!response.ok) {
				throw new Error('Failed to accept ride');
			}

			const data = await response.json();

			setCurrentRide({
				...ride,
				status: 'accepted',
				acceptedAt: new Date()
			});

			// Remove from available rides
			setRides(prev => prev.filter(r => r.rideId !== ride.rideId));
			showNotification('Ride accepted! Navigate to pickup location', 'success');

		} catch (error) {
			console.error('Error accepting ride:', error);
			showNotification('Failed to accept ride. It may have been taken.', 'error');
		}
	};

	const startRide = async () => {
		if (!currentRide || currentRide.status !== 'accepted') {
			showNotification('No ride to start', 'warning');
			return;
		}

		// Check if driver is near pickup location
		if (driverLocation) {
			const distance = calculateDistance(
				driverLocation.lat,
				driverLocation.lng,
				currentRide.pickupLocation.lat,
				currentRide.pickupLocation.lng
			);

			if (distance > 0.1) { // More than 100 meters
				showNotification(`You are ${Math.round(distance * 1000)}m away from pickup. Get closer to start.`, 'warning');
				return;
			}
		}

		try {
			const response = await fetch(`http://localhost:3000/api/ride/start/${currentRide.rideId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${DRIVER_TOKEN}`
				},
				body: JSON.stringify({
					driverId: DRIVER_ID,
					driverLocation: driverLocation
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to start ride');
			}

			const data = await response.json();

			setCurrentRide(prev => ({
				...prev,
				status: 'in_progress',
				startedAt: new Date()
			}));

			showNotification('Ride started! Navigate to dropoff location', 'success');

		} catch (error) {
			console.error('Error starting ride:', error);
			showNotification(error.message || 'Failed to start ride', 'error');
		}
	};

	const completeRide = async () => {
		if (!currentRide || currentRide.status !== 'in_progress') {
			showNotification('No ride to complete', 'warning');
			return;
		}

		// Check if driver is near dropoff location
		if (driverLocation) {
			const distance = calculateDistance(
				driverLocation.lat,
				driverLocation.lng,
				currentRide.dropoffLocation.lat,
				currentRide.dropoffLocation.lng
			);

			if (distance > 0.1) { // More than 100 meters
				showNotification(`You are ${Math.round(distance * 1000)}m away from dropoff location.`, 'warning');
				return;
			}
		}

		try {
			const response = await fetch(`http://localhost:3000/api/ride/complete/${currentRide.rideId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${DRIVER_TOKEN}`
				},
				body: JSON.stringify({ driverId: DRIVER_ID })
			});

			if (!response.ok) {
				throw new Error('Failed to complete ride');
			}

			const data = await response.json();

			showNotification('Ride completed successfully!', 'success');
			setCurrentRide(null);

		} catch (error) {
			console.error('Error completing ride:', error);
			showNotification('Failed to complete ride', 'error');
		}
	};

	const cancelRide = async () => {
		if (!currentRide) {
			showNotification('No ride to cancel', 'warning');
			return;
		}

		if (!window.confirm('Are you sure you want to cancel this ride?')) {
			return;
		}

		try {
			const response = await fetch(`http://localhost:3000/api/ride/cancel/${currentRide.rideId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${DRIVER_TOKEN}`
				},
				body: JSON.stringify({ userId: DRIVER_ID })
			});

			if (!response.ok) {
				throw new Error('Failed to cancel ride');
			}

			showNotification('Ride cancelled', 'success');
			setCurrentRide(null);

		} catch (error) {
			console.error('Error cancelling ride:', error);
			showNotification('Failed to cancel ride', 'error');
		}
	};

	const calculateDistance = (lat1, lon1, lat2, lon2) => {
		const R = 6371; // Earth's radius in km
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const showNotification = (message, type = 'info') => {
		setNotification({ message, type });
		setTimeout(() => setNotification(null), 5000);
	};

	const formatTime = (date) => {
		if (!date) return '';
		return new Date(date).toLocaleTimeString();
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
						<div className="flex items-center gap-4">
							<div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
								}`}>
								<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
								<span className="text-sm font-medium">
									{isConnected ? 'Connected' : 'Disconnected'}
								</span>
							</div>
							<button
								onClick={toggleDriverStatus}
								className={`px-6 py-2 rounded-lg font-semibold transition-colors ${driverStatus === 'online'
										? 'bg-green-500 hover:bg-green-600 text-white'
										: 'bg-gray-300 hover:bg-gray-400 text-gray-700'
									}`}
							>
								{driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Notification */}
			{notification && (
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
							notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
								notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
									'bg-blue-50 text-blue-800 border border-blue-200'
						}`}>
						{notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
						{notification.type === 'error' && <XCircle className="w-5 h-5" />}
						{notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
						{notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
						<p className="font-medium">{notification.message}</p>
					</div>
				</div>
			)}

			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Current Ride Card */}
				{currentRide && (
					<div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold">Current Ride</h2>
							<span className={`px-4 py-1 rounded-full text-sm font-semibold ${currentRide.status === 'accepted' ? 'bg-yellow-400 text-yellow-900' :
									currentRide.status === 'in_progress' ? 'bg-green-400 text-green-900' :
										'bg-gray-400 text-gray-900'
								}`}>
								{currentRide.status === 'accepted' ? 'Heading to Pickup' :
									currentRide.status === 'in_progress' ? 'In Progress' : currentRide.status}
							</span>
						</div>

						<div className="space-y-3 mb-4">
							<div className="flex items-start gap-3">
								<MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
								<div>
									<p className="text-sm opacity-80">Pickup</p>
									<p className="font-medium">{currentRide.pickupLocation.address || `${currentRide.pickupLocation.lat.toFixed(4)}, ${currentRide.pickupLocation.lng.toFixed(4)}`}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Navigation className="w-5 h-5 mt-1 flex-shrink-0" />
								<div>
									<p className="text-sm opacity-80">Dropoff</p>
									<p className="font-medium">{currentRide.dropoffLocation.address || `${currentRide.dropoffLocation.lat.toFixed(4)}, ${currentRide.dropoffLocation.lng.toFixed(4)}`}</p>
								</div>
							</div>

							{currentRide.fare && (
								<div className="flex items-center gap-3">
									<DollarSign className="w-5 h-5" />
									<div>
										<p className="text-sm opacity-80">Fare</p>
										<p className="font-medium">${currentRide.fare.toFixed(2)}</p>
									</div>
								</div>
							)}

							{currentRide.distance && (
								<div className="flex items-center gap-3">
									<Navigation className="w-5 h-5" />
									<div>
										<p className="text-sm opacity-80">Distance</p>
										<p className="font-medium">{currentRide.distance.toFixed(2)} km</p>
									</div>
								</div>
							)}
						</div>

						<div className="flex gap-3">
							{currentRide.status === 'accepted' && (
								<button
									onClick={startRide}
									className="flex-1 bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
								>
									Start Ride
								</button>
							)}

							{currentRide.status === 'in_progress' && (
								<button
									onClick={completeRide}
									className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
								>
									Complete Ride
								</button>
							)}

							{currentRide.status !== 'completed' && (
								<button
									onClick={cancelRide}
									className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
								>
									Cancel Ride
								</button>
							)}
						</div>
					</div>
				)}

				{/* Available Rides */}
				<div className="bg-white rounded-xl shadow-sm p-6">
					<h2 className="text-xl font-bold text-gray-800 mb-4">Available Rides</h2>

					{driverStatus === 'offline' && (
						<div className="text-center py-12 text-gray-500">
							<User className="w-12 h-12 mx-auto mb-3 opacity-50" />
							<p className="font-medium">You are offline</p>
							<p className="text-sm">Go online to see available rides</p>
						</div>
					)}

					{driverStatus === 'online' && currentRide && (
						<div className="text-center py-12 text-gray-500">
							<Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
							<p className="font-medium">Complete your current ride first</p>
						</div>
					)}

					{driverStatus === 'online' && !currentRide && rides.length === 0 && (
						<div className="text-center py-12 text-gray-500">
							<Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
							<p className="font-medium">No rides available</p>
							<p className="text-sm">Waiting for ride requests...</p>
						</div>
					)}

					{driverStatus === 'online' && !currentRide && rides.length > 0 && (
						<div className="space-y-4">
							{rides.map((ride) => (
								<div key={ride.rideId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
									<div className="flex justify-between items-start mb-3">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<MapPin className="w-4 h-4 text-green-600" />
												<p className="text-sm text-gray-600">Pickup</p>
											</div>
											<p className="font-medium text-gray-800">
												{ride.pickupLocation.address || `${ride.pickupLocation.lat.toFixed(4)}, ${ride.pickupLocation.lng.toFixed(4)}`}
											</p>
										</div>
										{ride.fare && (
											<div className="text-right">
												<p className="text-2xl font-bold text-green-600">${ride.fare.toFixed(2)}</p>
												{ride.distance && <p className="text-sm text-gray-500">{ride.distance.toFixed(1)} km</p>}
											</div>
										)}
									</div>

									<div className="flex items-center gap-2 mb-4">
										<Navigation className="w-4 h-4 text-red-600" />
										<p className="text-sm text-gray-600">Dropoff</p>
									</div>
									<p className="font-medium text-gray-800 mb-4">
										{ride.dropoffLocation.address || `${ride.dropoffLocation.lat.toFixed(4)}, ${ride.dropoffLocation.lng.toFixed(4)}`}
									</p>

									<button
										onClick={() => acceptRide(ride)}
										className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
									>
										Accept Ride
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Driver Location Info */}
				{driverLocation && driverStatus === 'online' && (
					<div className="mt-4 bg-white rounded-lg shadow-sm p-4">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Navigation className="w-4 h-4" />
							<span>Your Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</span>
							<span className="ml-auto text-green-600">● Live</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DriverHome;



















// import React, { useState, useEffect } from 'react';
// import { Menu, X, MapPin, Navigation, DollarSign, Clock, Star, ChevronRight, User, Settings, HelpCircle, LogOut } from 'lucide-react';

// export default function UberDriver() {
// 	const [isOnline, setIsOnline] = useState(false);
// 	const [showMenu, setShowMenu] = useState(false);
// 	const [currentRide, setCurrentRide] = useState(null);
// 	const [earnings, setEarnings] = useState(245.50);
// 	const [trips, setTrips] = useState(12);
// 	const [rating, setRating] = useState(4.8);
// 	const [hours, setHours] = useState(5.5);

// 	const rideRequests = [
// 		{ id: 1, name: 'John Doe', pickup: '123 Main St', dropoff: '456 Park Ave', distance: '2.5 km', fare: 15.50, rating: 4.9 },
// 		{ id: 2, name: 'Sarah Smith', pickup: '789 Oak Rd', dropoff: '321 Elm St', distance: '4.2 km', fare: 22.00, rating: 5.0 },
// 		{ id: 3, name: 'Mike Johnson', pickup: '555 Pine Blvd', dropoff: '888 Maple Dr', distance: '1.8 km', fare: 12.75, rating: 4.7 },
// 	];

// 	const acceptRide = (ride) => {
// 		setCurrentRide({ ...ride, status: 'accepted' });
// 	};

// 	const startRide = () => {
// 		setCurrentRide({ ...currentRide, status: 'started' });
// 	};

// 	const completeRide = () => {
// 		setEarnings(prev => prev + currentRide.fare);
// 		setTrips(prev => prev + 1);
// 		setCurrentRide(null);
// 	};

// 	return (
// 		<div className="min-h-screen bg-gray-50 flex flex-col">
// 			{/* Header */}
// 			<div className="bg-black text-white p-4 flex items-center justify-between">
// 				<button onClick={() => setShowMenu(true)}>
// 					<Menu className="w-6 h-6" />
// 				</button>
// 				<h1 className="text-xl font-bold">Uber Driver</h1>
// 				<div className="w-6" />
// 			</div>

// 			{/* Side Menu */}
// 			{showMenu && (
// 				<div className="fixed inset-0 z-50">
// 					<div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMenu(false)} />
// 					<div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
// 						<div className="p-6">
// 							<button onClick={() => setShowMenu(false)} className="mb-6">
// 								<X className="w-6 h-6" />
// 							</button>

// 							{/* Profile Section */}
// 							<div className="flex items-center gap-4 mb-8 pb-6 border-b">
// 								<div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
// 									<User className="w-8 h-8 text-gray-600" />
// 								</div>
// 								<div>
// 									<h3 className="font-bold text-lg">Alex Driver</h3>
// 									<div className="flex items-center gap-1 text-sm text-gray-600">
// 										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
// 										<span>{rating}</span>
// 									</div>
// 								</div>
// 							</div>

// 							{/* Menu Items */}
// 							<nav className="space-y-1">
// 								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
// 									<User className="w-5 h-5" />
// 									<span className="flex-1 text-left font-medium">Profile</span>
// 									<ChevronRight className="w-5 h-5 text-gray-400" />
// 								</button>
// 								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
// 									<DollarSign className="w-5 h-5" />
// 									<span className="flex-1 text-left font-medium">Earnings</span>
// 									<ChevronRight className="w-5 h-5 text-gray-400" />
// 								</button>
// 								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
// 									<Settings className="w-5 h-5" />
// 									<span className="flex-1 text-left font-medium">Settings</span>
// 									<ChevronRight className="w-5 h-5 text-gray-400" />
// 								</button>
// 								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition">
// 									<HelpCircle className="w-5 h-5" />
// 									<span className="flex-1 text-left font-medium">Help</span>
// 									<ChevronRight className="w-5 h-5 text-gray-400" />
// 								</button>
// 								<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg transition text-red-600">
// 									<LogOut className="w-5 h-5" />
// 									<span className="flex-1 text-left font-medium">Logout</span>
// 								</button>
// 							</nav>
// 						</div>
// 					</div>
// 				</div>
// 			)}

// 			{/* Main Content */}
// 			<div className="flex-1 overflow-y-auto p-4">
// 				{/* Online/Offline Toggle */}
// 				<div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
// 					<div className="flex items-center justify-between mb-4">
// 						<div>
// 							<h2 className="text-xl font-bold mb-1">
// 								{isOnline ? "You're Online" : "You're Offline"}
// 							</h2>
// 							<p className="text-sm text-gray-600">
// 								{isOnline ? "Ready to accept rides" : "Go online to start accepting rides"}
// 							</p>
// 						</div>
// 						<button
// 							onClick={() => setIsOnline(!isOnline)}
// 							className={`relative w-16 h-8 rounded-full transition ${isOnline ? 'bg-green-500' : 'bg-gray-300'
// 								}`}
// 						>
// 							<div
// 								className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-8' : ''
// 									}`}
// 							/>
// 						</button>
// 					</div>

// 					{/* Stats */}
// 					{isOnline && (
// 						<div className="grid grid-cols-4 gap-4 pt-4 border-t">
// 							<div className="text-center">
// 								<div className="text-2xl font-bold">${earnings.toFixed(2)}</div>
// 								<div className="text-xs text-gray-600">Earnings</div>
// 							</div>
// 							<div className="text-center">
// 								<div className="text-2xl font-bold">{trips}</div>
// 								<div className="text-xs text-gray-600">Trips</div>
// 							</div>
// 							<div className="text-center">
// 								<div className="text-2xl font-bold">{hours}h</div>
// 								<div className="text-xs text-gray-600">Online</div>
// 							</div>
// 							<div className="text-center">
// 								<div className="text-2xl font-bold flex items-center justify-center gap-1">
// 									<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
// 									{rating}
// 								</div>
// 								<div className="text-xs text-gray-600">Rating</div>
// 							</div>
// 						</div>
// 					)}
// 				</div>

// 				{/* Current Ride */}
// 				{currentRide && (
// 					<div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border-2 border-green-500">
// 						<div className="flex items-center justify-between mb-4">
// 							<h3 className="text-lg font-bold">Current Ride</h3>
// 							<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
// 								{currentRide.status === 'accepted' ? 'Heading to pickup' : 'In progress'}
// 							</span>
// 						</div>

// 						<div className="space-y-4">
// 							{/* Passenger Info */}
// 							<div className="flex items-center gap-3 pb-4 border-b">
// 								<div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
// 									<User className="w-6 h-6 text-gray-600" />
// 								</div>
// 								<div className="flex-1">
// 									<div className="font-semibold">{currentRide.name}</div>
// 									<div className="flex items-center gap-1 text-sm text-gray-600">
// 										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
// 										<span>{currentRide.rating}</span>
// 									</div>
// 								</div>
// 								<div className="text-xl font-bold text-green-600">${currentRide.fare.toFixed(2)}</div>
// 							</div>

// 							{/* Locations */}
// 							<div className="space-y-3">
// 								<div className="flex gap-3">
// 									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
// 										<MapPin className="w-4 h-4 text-green-600" />
// 									</div>
// 									<div>
// 										<div className="text-xs text-gray-600 mb-1">Pickup</div>
// 										<div className="font-medium">{currentRide.pickup}</div>
// 									</div>
// 								</div>
// 								<div className="flex gap-3">
// 									<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
// 										<Navigation className="w-4 h-4 text-red-600" />
// 									</div>
// 									<div>
// 										<div className="text-xs text-gray-600 mb-1">Dropoff</div>
// 										<div className="font-medium">{currentRide.dropoff}</div>
// 									</div>
// 								</div>
// 							</div>

// 							{/* Actions */}
// 							<div className="flex gap-3 pt-4">
// 								{currentRide.status === 'accepted' ? (
// 									<button
// 										onClick={startRide}
// 										className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
// 									>
// 										Start Ride
// 									</button>
// 								) : (
// 									<button
// 										onClick={completeRide}
// 										className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
// 									>
// 										Complete Ride
// 									</button>
// 								)}
// 								<button className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition">
// 									Cancel
// 								</button>
// 							</div>
// 						</div>
// 					</div>
// 				)}

// 				{/* Available Rides */}
// 				{isOnline && !currentRide && (
// 					<div>
// 						<h3 className="text-lg font-bold mb-3">Available Rides</h3>
// 						<div className="space-y-3">
// 							{rideRequests.map((ride) => (
// 								<div key={ride.id} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition">
// 									<div className="flex items-center justify-between mb-3">
// 										<div className="flex items-center gap-3">
// 											<div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
// 												<User className="w-6 h-6 text-gray-600" />
// 											</div>
// 											<div>
// 												<div className="font-semibold">{ride.name}</div>
// 												<div className="flex items-center gap-1 text-sm text-gray-600">
// 													<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
// 													<span>{ride.rating}</span>
// 												</div>
// 											</div>
// 										</div>
// 										<div className="text-right">
// 											<div className="text-xl font-bold text-green-600">${ride.fare.toFixed(2)}</div>
// 											<div className="text-xs text-gray-600">{ride.distance}</div>
// 										</div>
// 									</div>

// 									<div className="space-y-2 mb-3">
// 										<div className="flex items-start gap-2 text-sm">
// 											<MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
// 											<span className="text-gray-700">{ride.pickup}</span>
// 										</div>
// 										<div className="flex items-start gap-2 text-sm">
// 											<Navigation className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
// 											<span className="text-gray-700">{ride.dropoff}</span>
// 										</div>
// 									</div>

// 									<button
// 										onClick={() => acceptRide(ride)}
// 										className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
// 									>
// 										Accept Ride
// 									</button>
// 								</div>
// 							))}
// 						</div>
// 					</div>
// 				)}

// 				{/* Offline State */}
// 				{!isOnline && (
// 					<div className="bg-white rounded-2xl shadow-sm p-12 text-center">
// 						<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
// 							<Navigation className="w-10 h-10 text-gray-400" />
// 						</div>
// 						<h3 className="text-xl font-bold mb-2">You're Offline</h3>
// 						<p className="text-gray-600 mb-6">
// 							Turn on to start accepting ride requests and earning money
// 						</p>
// 						<button
// 							onClick={() => setIsOnline(true)}
// 							className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
// 						>
// 							Go Online
// 						</button>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// }