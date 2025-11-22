import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, DollarSign, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

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

			case 'ride_accepted':
				console.log('Ride accepted nnjnjnjnjnjnjn:', message.data);
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

			await axios.patch(
				`http://localhost:3000/ride/accept/${ride.rideId}`,
				{},
				{ withCredentials: true }
			);

			
			console.log("responseeeeeeeeeeeeeeeeee", response)

			if (!response.ok) {
				throw new Error('Failed to accept ride');
			}

			console.log("checking " )
			setCurrentRide({
				...ride,
				status: 'accepted',
				acceptedAt: new Date()
			});
			
			// Remove from available rides
			setRides(prev => prev.filter(r => r.rideId !== ride.rideId));
			showNotification('Ride accepted! Navigate to pickup location', 'success');
			const data = await response.json();

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
			console.log("currentRide", currentRide)
			

			showNotification('Ride started! Navigate to dropoff location', 'success');


			console.log("currentRideeeeeeeeeeeeeeeeeeee",currentRide)

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
				method: 'patch',
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
