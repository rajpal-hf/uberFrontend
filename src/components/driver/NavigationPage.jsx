import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, User, Clock, Phone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../../utils/webSocket/ws';

export default function PickupNavigation() {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [eta, setEta] = useState(null);
	const [rideData, setRideData] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate()
	const {id} = useParams()

	// Fetch ride data from API
	useEffect(() => {
		const fetchRideData = async () => {
			try {
				// Replace with your actual API endpoint
				const { data } = 	await axios.get(`http://localhost:3000/ride/pickup-navigation/${id} `, {
					withCredentials: true
				});


				if (data.success) {	
					setRideData(data);
					// Calculate ETA based on distance (rough estimate: 30 km/h average speed)
					const estimatedMinutes = (parseFloat(data.pickupDistance) / 30) * 60;
					setEta(estimatedMinutes);
				}
				setLoading(false);
			} catch (error) {
				console.error('Error fetching ride data:', error);
				setLoading(false);
			}
		};

		fetchRideData();
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
			// Simulate ETA countdown
			if (eta !== null) {
				setEta(prev => Math.max(0, prev - 0.01));
			}
		}, 1000);
		return () => clearInterval(timer);
	}, [eta]);

	const startRideHandler = () => {
		try {
			const ws = getSocket()
			if (!ws || ws.readyState !== WebSocket.OPEN) return;
			ws.send(JSON.stringify({
				event: "ride:start",
				data: {
					rideId: id,
				}
			}))

			navigate(`/active-ride/${id}`);
			alert('Ride started!');
		} catch (error) {
			console.error("error in start ride", error);
		}
	}
	


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

	// Show error state if no data
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

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

				{/* Header */}
				<div className="bg-linear-to-r from-gray-900 to-black text-white p-6">
					<div className="flex items-center justify-between mb-3">
						<h1 className="text-2xl font-bold">Picking up rider</h1>
						<span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
							{currentTime.toLocaleTimeString()}
						</span>
					</div>
					<div className="flex items-center space-x-2 text-green-400">
						<Navigation className="w-5 h-5" />
						<span className="font-semibold">Navigation Active</span>
					</div>
				</div>

				{/* Map Placeholder */}
				<div className="relative bg-linear-to-br from-blue-50 via-green-50 to-blue-100 h-80">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center">
							<MapPin className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-bounce" />
							<p className="text-gray-700 font-semibold text-lg">Map View</p>
							<p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto px-4">
								<span className="font-medium">Your Location</span>
								<br />
								<span className="text-blue-600 text-xl">→</span>
								<br />
								<span className="font-medium">{rideData.pickupLocation.address}</span>
							</p>
						</div>
					</div>

					{/* ETA Badge */}
					<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-xl border-2 border-blue-100">
						<div className="flex items-center space-x-3">
							<Clock className="w-6 h-6 text-blue-600" />
							<div>
								<p className="text-xs text-gray-500 font-medium">ETA</p>
								<p className="text-2xl font-bold text-blue-600">
									{eta !== null ? Math.ceil(eta) : '--'} min
								</p>
							</div>
						</div>
					</div>

					{/* Distance Badge */}
					<div className="absolute top-4 right-4 bg-white rounded-xl px-5 py-3 shadow-lg border border-gray-200">
						<p className="text-xs text-gray-500 font-medium">Distance</p>
						<p className="text-lg font-bold text-gray-800">{rideData.pickupDistance} km</p>
					</div>

					{/* Driver Status Badge */}
					{rideData.isDriverClose && (
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
							<p className="text-sm font-semibold">You're nearby!</p>
						</div>
					)}
				</div>

				{/* Rider Info Card */}
				<div className="bg-white p-6 space-y-5">
					{/* Rider Details */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
								<User className="w-9 h-9 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-900">{rideData.user.name}</h2>
								<p className="text-sm text-gray-600 mt-1">{rideData.user.phone}</p>
							</div>
						</div>
						<a
							href={`tel:${rideData.user.phone}`}
							className="bg-green-500 hover:bg-green-600 active:scale-95 text-white p-4 rounded-full shadow-lg transition-all"
						>
							<Phone className="w-6 h-6" />
						</a>
					</div>

					{/* Pickup Location */}
					<div className="bg-linear-to-r from-green-50 to-blue-50 rounded-2xl p-5 border border-green-200">
						<div className="flex items-start space-x-3">
							<MapPin className="w-6 h-6 text-green-600 mt-1 shrink-0" />
							<div className="flex-1">
								<p className="text-xs text-gray-600 font-bold mb-2 tracking-wide">PICKUP LOCATION</p>
								<p className="font-semibold text-gray-900">{rideData.pickupLocation.address}</p>
								<p className="text-xs text-gray-500 mt-1">
									Lat: {rideData.pickupLocation.lat}, Lng: {rideData.pickupLocation.lng}
								</p>
							</div>
						</div>
					</div>
					<button
							onClick={() => {
								const url = `https://www.google.com/maps/dir/?api=1&origin=${rideData.driverLocation.lat},${rideData.driverLocation.lng}&destination=${rideData.pickupLocation.lat},${rideData.pickupLocation.lng}`;
								window.open(url, '_blank');
							}}
							className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-5 rounded-2xl transition-all shadow-md"
						>
							Start Navigation
						</button>

					{/* Arrived Button */}
					<button
						onClick={startRideHandler}
						className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-95 text-white font-bold py-5 rounded-2xl shadow-xl transition-all"
					>
						Start Ride
					</button>
				</div>
			</div>
		</div>
	);
}







