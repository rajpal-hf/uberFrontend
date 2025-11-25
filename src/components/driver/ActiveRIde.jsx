import React, { useState, useEffect, use } from 'react';
import { Navigation, MapPin, Flag, User, Phone, Clock, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function ActiveRidePage() {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [rideDuration, setRideDuration] = useState(0);
	const [currentFare, setCurrentFare] = useState(0);
	const [distanceCovered, setDistanceCovered] = useState(0);
	const [rideData, setRideData] = useState(null);
	const [loading, setLoading] = useState(true);
	const { id } = useParams();
	const navigate = useNavigate()

	// Fetch ride data from API
	useEffect(() => {
		const fetchRideData = async () => {
			try {
				// Replace with your actual API endpoint
				const {data} = await axios.get(`http://localhost:3000/ride/active-ride/${id}`, {
					withCredentials: true	
				});

				console.log("data while active ride", data);
				if (data.success) {
					setRideData(data);
					setRideDuration(data.elapsedMinutes * 60); // Convert to seconds
					setCurrentFare(data.estimatedFare);
					// Handle negative covered distance (means driver hasn't started yet)
					setDistanceCovered(Math.max(0, data.coveredDistanceKm));
				}
				setLoading(false);
			} catch (error) {
				console.error('Error fetching ride data:', error);
				setLoading(false);
			}
		};

		fetchRideData();

		// Poll for updates every 10 seconds
		const interval = setInterval(fetchRideData, 10000);
		return () => clearInterval(interval);
	}, []);

	// Update ride metrics
	useEffect(() => {
		if (!rideData) return;

		const timer = setInterval(() => {
			setCurrentTime(new Date());
			setRideDuration(prev => prev + 1);

			// Simulate distance covered based on remaining distance
			// If covered distance is negative, driver hasn't started moving yet
			if (rideData.coveredDistanceKm >= 0) {
				setDistanceCovered(prev => {
					const newDistance = prev + 0.008; // ~0.5 km per minute
					return Math.min(newDistance, rideData.totalDistanceKm);
				});

				// Update fare proportionally
				setCurrentFare(prev => {
					const fareRate = rideData.estimatedFare / rideData.totalDistanceKm;
					return Math.min(prev + (fareRate * 0.008), rideData.estimatedFare);
				});
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [rideData]);

	const formatDuration = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	// const handleEndRide = () => {

	// 	if (window.confirm('Are you sure you want to end this ride?')) {
	// 		// Call API to end ride

	// 		const { data } = axios.patch(`http://localhost:3000/ride/complete/${id}`, {}, {
	// 			withCredentials : true
	// 		})

	// 		console.log("data while end ride", data);

	// 		alert('Ride completed! Redirecting to summary...');
	// 		// Navigate to ride summary/payment page
	// 		navigate('/payment-verify', {
	// 			state: {
	// 				rideId: id
	// 			}
	// 		})
	// 	}
	// };


	const handleEndRide = async () => {
		if (!window.confirm('Are you sure you want to end this ride?')) return;

		try {
			// 1. Get driver's actual dropoff GPS
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true
				});
			});

			const dropLat = position.coords.latitude;
			const dropLng = position.coords.longitude;

			// 2. Send to backend with dropoff DTO
			const { data } = await axios.patch(
				`http://localhost:3000/ride/complete/${id}`,
				{
					dropoffLocation: {
						lat: dropLat,	
						lng: dropLng
					}
				},
				{
					withCredentials: true
				}
			);

			console.log("Ride completion response:", data);

			if (data.success) {
				// 3. Redirect with combined data
				navigate("/payment-verify", {
					state: {
						rideId: id,
						finalFare: data.ride.fare,
						finalDistance: data.ride.distance,
						paymentOrderId: data.payment.orderId,
						paymentAmount: data.payment.amount,
						paymentCurrency: data.payment.currency
					},
				});
			}
		} catch (err) {
			console.error(err);
			alert("Failed to complete ride. Try again.");
		}
	};


	const handleEmergency = () => {
		if (window.confirm('Do you need emergency assistance?')) {
			alert('Emergency services contacted');
			// Call emergency API
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 font-semibold">Loading ride details...</p>
				</div>
			</div>
		);
	}

	if (!rideData) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
				<div className="text-center">
					<p className="text-red-600 font-semibold text-lg">Failed to load ride data</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	const progressPercentage = rideData.totalDistanceKm > 0
		? Math.max(0, Math.min(100, (distanceCovered / rideData.totalDistanceKm) * 100))
		: 0;

	const actualCovered = Math.max(0, distanceCovered);
	const actualRemaining = Math.max(0, rideData.remainingDistanceKm - (distanceCovered - Math.max(0, rideData.coveredDistanceKm)));

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

				{/* Header - Active Ride */}
				<div className="bg-linear-to-r from-green-600 to-emerald-600 text-white p-6">
					<div className="flex items-center justify-between mb-3">
						<div>
							<h1 className="text-2xl font-bold">Ride in Progress</h1>
							<p className="text-sm text-green-100 mt-1">Trip #{rideData.rideId.slice(-6)}</p>
						</div>
						<div className="text-right">
							<div className="bg-white text-black bg-opacity-20 px-3 py-1 rounded-full text-sm mb-1">
								{currentTime.toLocaleTimeString()}
							</div>
							<div className="flex items-center justify-end space-x-1">
								<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
								<span className="text-xs">LIVE</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4 mt-4">
						<div className="bg-white bg-opacity-20 rounded-xl p-3">
							<div className="flex items-center space-x-2 mb-1">
								<Clock className="w-4 h-4 text-black" />
								<p className="text-xs  text-black font-medium">Duration</p>
							</div>
							<p className="text-xl text-black  font-bold">{formatDuration(rideDuration)}</p>
						</div>	
						<div className="bg-white bg-opacity-20 rounded-xl p-3">
							<div className="flex items-center space-x-2 mb-1">
								<DollarSign className="w-4 h-4 text-black" />
								<p className="text-xs text-black font-medium">Current Fare</p>
							</div>
							<p className="text-xl text-black font-bold">₹{Math.round(currentFare)}</p>
						</div>
					</div>
				</div>

				{/* Map Placeholder with Progress */}
				<div className="relative bg-linear-to-br from-blue-50 via-green-50 to-emerald-50 h-96">
					<div className="absolute inset-0 flex flex-col items-center justify-center p-6">
						{/* Route Visualization */}
						<div className="w-full max-w-xs">
							{/* Start Point */}
							<div className="flex items-start space-x-3 mb-4">
								<div className="w-4 h-4 bg-green-500 rounded-full mt-1 shrink-0 shadow-lg"></div>
								<div>
									<p className="text-xs text-gray-500 font-bold">PICKED UP FROM</p>
									<p className="text-sm font-semibold text-gray-800">{rideData.pickupLocation.address}</p>
								</div>
							</div>

							{/* Progress Line */}
							<div className="ml-2 relative">
								<div className="w-0.5 h-32 bg-gray-300 relative overflow-hidden">
									<div
										className="w-full bg-linear-to-b from-green-500 to-blue-500 transition-all duration-1000 ease-linear"
										style={{ height: `${progressPercentage}%` }}
									></div>
								</div>

								{/* Current Location Indicator */}
								<div
									className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-1000"
									style={{ top: `${progressPercentage}%` }}
								>
									<div className="relative">
										<Navigation className="w-6 h-6 text-blue-600 animate-pulse" />
										<div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-50"></div>
									</div>
								</div>
							</div>

							{/* End Point */}
							<div className="flex items-start space-x-3 mt-4">
								<Flag className="w-5 h-5 text-red-500 mt-1 shrink-0" />
								<div>
									<p className="text-xs text-gray-500 font-bold">DROP OFF AT</p>
									<p className="text-sm font-semibold text-gray-800">{rideData.dropoffLocation.address}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Overlay */}
					<div className="absolute top-4 left-4 right-4 flex gap-2">
						<div className="bg-white rounded-xl px-4 py-2 shadow-lg flex-1">
							<p className="text-xs text-gray-500">Covered</p>
							<p className="text-lg font-bold text-green-600">{actualCovered.toFixed(1)} km</p>
						</div>
						<div className="bg-white rounded-xl px-4 py-2 shadow-lg flex-1">
							<p className="text-xs text-gray-500">Remaining</p>
							<p className="text-lg font-bold text-blue-600">{actualRemaining.toFixed(1)} km</p>
						</div>
						<div className="bg-white rounded-xl px-4 py-2 shadow-lg flex-1">
							<p className="text-xs text-gray-500">ETA</p>
							<p className="text-lg font-bold text-gray-800">{Math.round(rideData.estimatedRemainingMinutes)} min</p>
						</div>
					</div>

					{/* Progress Bar at Bottom */}
					<div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4">
						<div className="flex justify-between text-xs text-gray-600 mb-2">
							<span>Trip Progress</span>
							<span className="font-bold">{Math.round(progressPercentage)}%</span>
						</div>
						<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-linear-to-r from-green-500 to-blue-500 transition-all duration-1000 ease-linear"
								style={{ width: `${progressPercentage}%` }}
							></div>
						</div>
					</div>
				</div>

				{/* Rider Info & Controls */}
				<div className="bg-white p-6 space-y-4">
					{/* Rider Details */}
					<div className="flex items-center justify-between pb-4 border-b border-gray-200">
						<div className="flex items-center space-x-4">
							<div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
								<User className="w-8 h-8 text-white" />
							</div>
							<div>
								<h2 className="text-lg font-bold text-gray-900">{rideData.user.name}</h2>
								<p className="text-sm text-gray-600">{rideData.user.phone}</p>
							</div>
						</div>
						<div className="flex space-x-2">
							<a
								href={`tel:${rideData.user.phone}`}
								className="bg-green-500 hover:bg-green-600 active:scale-95 text-white p-3 rounded-full shadow-lg transition-all"
							>
								<Phone className="w-5 h-5" />
							</a>
							<button className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white p-3 rounded-full shadow-lg transition-all">
								<MessageSquare className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="grid grid-cols-2 gap-3">
						<button
							onClick={() => {
								const url = `https://www.google.com/maps/dir/?api=1&origin=${rideData.driverLocation.lat},${rideData.driverLocation.lng}&destination=${rideData.dropoffLocation.lat},${rideData.dropoffLocation.lng}`;
								window.open(url, '_blank');
							}}
							className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
						>
							<Navigation className="w-5 h-5" />
							<span>Navigation</span>
						</button>
						<button
							onClick={handleEmergency}
							className="bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
						>
							<AlertCircle className="w-5 h-5" />
							<span>Emergency</span>
						</button>
					</div>

					{/* Complete Ride Button */}
					<button
						onClick={handleEndRide}
						className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2"
					>
						<Flag className="w-6 h-6" />
						<span>Complete Ride</span>
					</button>

					{/* Info Note */}
					<div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
						<div className="flex items-start space-x-2">
							<AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
							<div className="flex-1">
								<p className="text-xs text-blue-700">
									<span className="font-semibold">Trip Info:</span> Total distance {rideData.totalDistanceKm.toFixed(1)} km • Est. fare ₹{Math.round(rideData.estimatedFare)}
								</p>
								{rideData.coveredDistanceKm < 0 && (
									<p className="text-xs text-orange-600 mt-1 font-semibold">
										 Ride started - Navigate to the destination
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}