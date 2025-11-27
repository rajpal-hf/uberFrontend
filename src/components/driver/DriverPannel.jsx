import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, DollarSign, User, Navigation, Phone, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectWS, getSocket } from '../../utils/webSocket/ws';

export default function DriverPanel() {
	const [isOnline, setIsOnline] = useState(false);
	const [rideRequests, setRideRequests] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const reconnectTimeoutRef = useRef(null);

	const [driverLocation, setDriverLocation] = useState(null);
	const [gettingLocation, setGettingLocation] = useState(null);

	const navigate = useNavigate();

	// Request notification permission
	useEffect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}, []);

	useEffect(() => {
		if (!isOnline) {
			// Offline → clear rides & don't connect WS
			setRideRequests([]);
			return;
		}

		const token = localStorage.getItem("token");

		const socket = connectWS(token, (event, data) => {
			

			if (event === "new:ride") {
				console.log("new:ride FE - Driver", data);
				setRideRequests(prev => [data,...prev ]);
			}
			if (event === "ride:cancelled") {
				navigate('/driver-home');
				setRideRequests(prev => prev.filter(r => r._id !== data._id));
			}
			if (event === "ride:accepted") {
				navigate(`/pickup-navigation/${data._id}`);
			}
			if (event === "ride:completed") {
				console.log("ride completeeeeeedd", data);
				navigate('/payment-verify', { state: { data } });
			}
		});

		return () => {
			console.log("Driver Panel cleanup — socket NOT closed");
		};

	}, [isOnline]);



	// Fetch initial ride requests from API
	const fetchRideRequests = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch('http://localhost:3000/ride/new-rides', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
			});

			const data = await response.json();

			if (data.success) {
				setRideRequests(data.rides.filter(ride => ride.rideStatus === 'pending'));
			} else {
				setError('Failed to fetch ride requests');
			}
		} catch (err) {
			setError('Error connecting to server');
			console.error('Error fetching rides:', err);
		} finally {
			setLoading(false);
		}
	};


	useEffect(() => {

		if (isOnline) {
			getCurrentLocation();
			fetchRideRequests();
		} else {
			setRideRequests([]);
		}
	}, [isOnline]);

	const handleToggleStatus = () => {
		setIsOnline(prev => !prev);
	};


	const getCurrentLocation = () => {
		setGettingLocation(true);
		setError("");

		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser");
			setGettingLocation(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				setDriverLocation({ lat, lng });


				setGettingLocation(false);
			},
			(error) => {
				console.error("Geolocation Error:", error);
				setError("Unable to fetch location");
				setGettingLocation(false);
			},
			{ enableHighAccuracy: true }
		);
	};



	const handleAcceptRide = async (rideId) => {
		
		if (!driverLocation) {
			await new Promise((resolve) => {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const lat = position.coords.latitude;
						const lng = position.coords.longitude;
						setDriverLocation({ lat, lng });
						resolve();
					},
					(error) => {
						console.error("Geolocation Error:", error);
						resolve();
					},
					{ enableHighAccuracy: true }
				);
			});
		}

		const ws = getSocket();
		if (!ws || ws.readyState !== WebSocket.OPEN) return;

		ws.send(JSON.stringify({
			event: "ride:accept",
			data: {
				rideId,
				lat: driverLocation?.lat,
				lng: driverLocation?.lng
			}
		}));


		setRideRequests(prev => prev.filter(ride => ride._id !== rideId));
	};


	const handleRejectRide = (rideId) => {
		try {
			setRideRequests(prev => prev.filter(ride => ride._id !== rideId));
		} catch (err) {
			console.error('Error rejecting ride:', err);
			setRideRequests(prev => prev.filter(ride => ride._id !== rideId));
		}
	};

	const formatTimeAgo = (timestamp) => {
		const now = new Date();
		const created = new Date(timestamp);
		const diffInMinutes = Math.floor((now - created) / 60000);

		if (diffInMinutes < 1) return 'Just now';
		if (diffInMinutes === 1) return '1 min ago';
		if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours === 1) return '1 hour ago';
		return `${diffInHours} hours ago`;
	};

	const totalPotentialEarnings = rideRequests.reduce((sum, ride) => sum + ride.fare, 0);

	useEffect(() => {
		return	 () => {
			clearTimeout(reconnectTimeoutRef.current);
		};
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Driver Panel</h1>
							<div className="flex items-center gap-3 mt-1">
								<p className="text-sm text-gray-600">Manage your ride requests</p>
							</div>
						</div>

						{/* Online/Offline Toggle */}
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-gray-700">
								Status: <span className={isOnline ? "text-green-600" : "text-red-600"}>
									{isOnline ? "Online" : "Offline"}
								</span>
							</span>
							<button
								onClick={handleToggleStatus}
								className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isOnline ? 'bg-green-500 focus:ring-green-500' : 'bg-gray-300 focus:ring-gray-400'
									}`}
							>
								<span
									className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isOnline ? 'translate-x-11' : 'translate-x-1'
										}`}
								/>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 py-6">
				{!isOnline ? (
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
							<Navigation className="w-8 h-8 text-yellow-600" />
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">You're Currently Offline</h2>
						<p className="text-gray-600 mb-4">Toggle your status to online to start receiving ride requests</p>
					</div>
				) : (
					<>
						{/* Stats Bar */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
							<div className="flex items-center justify-between">
								<div className="text-center flex-1">
									<p className="text-2xl font-bold text-gray-900">{rideRequests.length}</p>
									<p className="text-sm text-gray-600">New Requests</p>
								</div>
								<div className="h-12 w-px bg-gray-200"></div>
								<div className="text-center flex-1">
									<p className="text-2xl font-bold text-green-600">₹{totalPotentialEarnings.toFixed(2)}</p>
									<p className="text-sm text-gray-600">Potential Earnings</p>
								</div>
								<div className="h-12 w-px bg-gray-200"></div>
								<div className="text-center flex-1">
									<button
										onClick={fetchRideRequests}
										disabled={loading}
										className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
									>
										<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
										<span className="text-sm font-medium">Refresh</span>
									</button>
								</div>
							</div>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
								<p className="text-red-800 text-sm">{error}</p>
							</div>
						)}

						{/* Ride Requests */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold text-gray-900">New Ride Requests</h2>
							</div>

							{loading && rideRequests.length === 0 ? (
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
									<RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
									<p className="text-gray-600">Loading ride requests...</p>
								</div>
							) : rideRequests.length === 0 ? (
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
										<MapPin className="w-8 h-8 text-gray-400" />
									</div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">No New Requests</h3>
									<p className="text-gray-600">New ride requests will appear here when available</p>
								</div>
							) : (
								rideRequests.map(ride => (
									<div key={ride._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow animate-fadeIn">
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
													<User className="w-6 h-6 text-blue-600" />
												</div>
												<div>
													<h3 className="font-semibold text-gray-900">{ride.riderId.name}</h3>
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<Phone className="w-4 h-4" />
														<span>{ride.riderId.phone}</span>
													</div>
													<div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
														<Clock className="w-4 h-4" />
														<span>{formatTimeAgo(ride.createdAt)}</span>
													</div>
												</div>
											</div>
											<div className="text-right">
												<p className="text-2xl font-bold text-green-600">₹{ride.fare}</p>
												<p className="text-xs text-white bg-blue-600 px-2 py-1 rounded mt-1 uppercase">{ride.vehicleType}</p>
											</div>
										</div>

										<div className="space-y-3 mb-4">
											<div className="flex items-start gap-3">
												<div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
													<div className="w-2 h-2 bg-green-600 rounded-full"></div>
												</div>
												<div className="flex-1">
													<p className="text-xs font-medium text-gray-600 uppercase mb-1">Pickup</p>
													<p className="text-sm text-gray-900">{ride.pickupLocation.address}</p>
													<p className="text-xs text-gray-500 mt-1">
														{ride.pickupLocation.lat.toFixed(4)}, {ride.pickupLocation.lng.toFixed(4)}
													</p>
												</div>
											</div>

											<div className="flex items-start gap-3">
												<div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
													<MapPin className="w-3 h-3 text-red-600" />
												</div>
												<div className="flex-1">
													<p className="text-xs font-medium text-gray-600 uppercase mb-1">Dropoff</p>
													<p className="text-sm text-gray-900">{ride.dropoffLocation.address}</p>
													<p className="text-xs text-gray-500 mt-1">
														{ride.dropoffLocation.lat.toFixed(4)}, {ride.dropoffLocation.lng.toFixed(4)}
													</p>
												</div>
											</div>
										</div>

										<div className="flex gap-3">
											<button
												onClick={() => handleAcceptRide(ride._id)}
												className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
											>
												Accept Ride
											</button>
											<button
												onClick={() => handleRejectRide(ride._id)}
												className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
											>
												Decline
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</>
				)}
			</div>

			<style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
		</div>
	);
}
