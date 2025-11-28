import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Navigation, Clock, AlertCircle, Shield, Share2, DollarSign, Car } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function RideOngoingPage() {
	const [rideTime, setRideTime] = useState(0);
	const [distanceCovered, setDistanceCovered] = useState(0);
	const [eta, setEta] = useState(45);
	const [showShareModal, setShowShareModal] = useState(false);
	const [showSOSModal, setShowSOSModal] = useState(false);
	const [rideData, setRideData] = useState(null);
	const [driverData, setDriverData] = useState(null);
	const [loading, setLoading] = useState(true);
	const {id} = useParams()


	useEffect(() => {
		
		const fetchRideData = async () => {
			try {
			

				console.log("RideOngoingPage - rideId:", id);
				const { data } = await axios.get(`http://localhost:3000/ride/driver/${id}`, { withCredentials: true });
				console.log("RideOngoingPage - fetched data:", data);	
				console.log("RideOngoingPage - ride data:", data.ride);
				console.log("RideOngoingPage - driver data:", data.ride.driverId);	
				setRideData(data.ride);
				setDriverData(data.ride.driver);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching ride data:', error);
				setLoading(false);
			}
		};

		fetchRideData();
	}, []);

	// Calculate total distance
	useEffect(() => {
		if (rideData) {
			const calculatedDistance = calculateDistance(
				rideData.pickupLocation.lat,
				rideData.pickupLocation.lng,
				rideData.dropoffLocation.lat,
				rideData.dropoffLocation.lng
			);
			setDistanceCovered(calculatedDistance);
		}
	}, [rideData]);

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

	// Simulate ride time
	useEffect(() => {
		const interval = setInterval(() => {
			setRideTime(prev => prev + 1);
			setEta(prev => Math.max(prev - 0.016, 0)); 
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const getShortAddress = (fullAddress) => {
		const parts = fullAddress.split(',');
		return parts.slice(0, 2).join(',');
	};

	const handleCall = () => {
		if (driverData?.phone) {
			window.location.href = `tel:${driverData.phone}`;
		}
	};

	const handleMessage = () => {
		alert('Opening chat with driver...');
	};

	const handleShareTrip = () => {
		setShowShareModal(true);
	};

	const handleSOS = () => {
		setShowSOSModal(true);
	};

	const shareTrip = (method) => {
		const message = `I'm on a ride! Track me here: https://yourapp.com/track/${rideData?._id}`;
		if (method === 'whatsapp') {
			window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
		} else if (method === 'sms') {
			window.location.href = `sms:?body=${encodeURIComponent(message)}`;
		}
		setShowShareModal(false);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading ride details...</p>
				</div>
			</div>
		);
	}

	if (!rideData || !driverData) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="text-center">
					<AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
					<p className="text-gray-800 font-semibold">Unable to load ride details</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Live Map Section */}
			<div className="relative h-96 bg-linear-to-br from-green-400 via-blue-500 to-purple-600">
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-center text-white">
						<div className="relative inline-block">
							<Navigation className="w-20 h-20 mx-auto mb-3 animate-pulse" />
							<div className="absolute -top-2 -right-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
								<div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
							</div>
						</div>
						<p className="text-xl font-bold">Ride in Progress</p>
						<p className="text-sm opacity-90 mt-1">Following the fastest route</p>
					</div>
				</div>

				{/* ETA Card */}
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-6 py-3 shadow-2xl">
					<div className="flex items-center gap-3">
						<Clock className="w-6 h-6 text-blue-600" />
						<div>
							<p className="text-xs text-gray-500">Estimated Arrival</p>
							<p className="text-xl font-bold text-gray-800">{Math.floor(eta)} mins</p>
						</div>
					</div>
				</div>

				{/* SOS Button */}
				<button
					onClick={handleSOS}
					className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-4 shadow-2xl hover:bg-red-700 transition animate-pulse"
				>
					<Shield className="w-6 h-6" />
				</button>

				{/* Share Trip Button */}
				<button
					onClick={handleShareTrip}
					className="absolute top-4 left-4 bg-white text-blue-600 rounded-full p-4 shadow-2xl hover:bg-gray-50 transition"
				>
					<Share2 className="w-6 h-6" />
				</button>

				{/* Ride Stats Bar */}
				<div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
					<div className="grid grid-cols-3 gap-4 text-center">
						<div>
							<p className="text-xs text-gray-500 mb-1">Time</p>
							<p className="text-lg font-bold text-gray-800">{formatTime(rideTime)}</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 mb-1">Distance</p>
							<p className="text-lg font-bold text-gray-800">{distanceCovered.toFixed(1)} km</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 mb-1">Est. Fare</p>
							<p className="text-lg font-bold text-green-600">₹{rideData.fare.toFixed(2)}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Content Section */}
			<div className="flex-1 -mt-6 relative z-10">
				<div className="bg-white rounded-t-3xl shadow-2xl p-6">

					{/* Driver Info */}
					<div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6">
						<div className="flex items-center gap-4 mb-4">
							<div className="text-5xl bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
								🚗
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-bold text-gray-800">{driverData.name}</h2>
								<div className="flex items-center gap-2 mt-1">
									<span className="text-yellow-500">★</span>
									<span className="font-semibold text-gray-700">{driverData.rating}</span>
									<span className="text-gray-400">•</span>
									<span className="text-sm text-gray-600">{driverData.vehicleNumber}</span>
								</div>
							</div>
							<div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
								{rideData.vehicleType}
							</div>
						</div>

						{/* Vehicle Info */}
						<div className="bg-white rounded-xl p-3 mb-4">
							<div className="flex items-center gap-2">
								<Car className="w-5 h-5 text-gray-600" />
								<span className="text-sm text-gray-700">
									{driverData.vehicleModel} - {driverData.vehicleColor}
								</span>
							</div>
						</div>

						{/* Contact Buttons */}
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={handleCall}
								className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
							>
								<Phone className="w-5 h-5" />
								Call
							</button>
							<button
								onClick={handleMessage}
								className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
							>
								<MessageCircle className="w-5 h-5" />
								Chat
							</button>
						</div>
					</div>

					{/* Route Info */}
					<div className="space-y-4 mb-6">
						<div className="flex gap-4">
							<div className="flex flex-col items-center">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<div className="w-0.5 h-16 bg-gray-300"></div>
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
							</div>
							<div className="flex-1 space-y-10">
								<div>
									<p className="text-xs text-green-600 font-semibold mb-1">Picked up from</p>
									<p className="font-semibold text-gray-800 text-sm leading-relaxed">
										{getShortAddress(rideData.pickupLocation.address)}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{new Date(rideData.createdAt).toLocaleTimeString('en-IN', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
								</div>
								<div>
									<p className="text-xs text-red-600 font-semibold mb-1">Heading to</p>
									<p className="font-semibold text-gray-800 text-sm leading-relaxed">
										{getShortAddress(rideData.dropoffLocation.address)}
									</p>
									<p className="text-xs text-gray-500 mt-1">ETA: {Math.floor(eta)} mins</p>
								</div>
							</div>
						</div>
					</div>

					{/* Payment Status */}
					<div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<DollarSign className="w-5 h-5 text-amber-600" />
							<div>
								<p className="font-semibold text-amber-800 text-sm">Payment Status</p>
								<p className="text-xs text-amber-700 capitalize">{rideData.paymentStatus}</p>
							</div>
						</div>
						<p className="text-xl font-bold text-amber-700">₹{rideData.fare.toFixed(2)}</p>
					</div>

					{/* Safety Banner */}
					<div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6">
						<Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
						<div>
							<p className="font-semibold text-blue-800 text-sm">You're Protected</p>
							<p className="text-xs text-blue-700 mt-1">Your ride is being monitored. Share trip for extra safety.</p>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="grid grid-cols-2 gap-3">
						<button className="bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
							<DollarSign className="w-5 h-5" />
							View Fare
						</button>
						<button className="bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
							<AlertCircle className="w-5 h-5" />
							Report Issue
						</button>
					</div>
				</div>
			</div>

			{/* Share Trip Modal */}
			{showShareModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl p-6 max-w-md w-full">
						<h3 className="text-xl font-bold text-gray-800 mb-2">Share Your Trip</h3>
						<p className="text-gray-600 mb-6">Let your loved ones track your journey in real-time</p>

						<div className="space-y-3 mb-6">
							<button
								onClick={() => shareTrip('whatsapp')}
								className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
							>
								<MessageCircle className="w-5 h-5" />
								Share via WhatsApp
							</button>
							<button
								onClick={() => shareTrip('sms')}
								className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
							>
								<Phone className="w-5 h-5" />
								Share via SMS
							</button>
						</div>

						<button
							onClick={() => setShowShareModal(false)}
							className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* SOS Modal */}
			{showSOSModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl p-6 max-w-md w-full">
						<div className="text-center mb-4">
							<div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
								<Shield className="w-8 h-8 text-red-600" />
							</div>
							<h3 className="text-xl font-bold text-gray-800 mb-2">Emergency SOS</h3>
							<p className="text-gray-600">Are you in an emergency situation?</p>
						</div>

						<div className="space-y-3 mb-4">
							<button
								onClick={() => window.location.href = 'tel:100'}
								className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition"
							>
								Call Police (100)
							</button>
							<button
								onClick={() => alert('Emergency contacts notified!')}
								className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 transition"
							>
								Alert Emergency Contacts
							</button>
							<button
								onClick={() => alert('Support team notified!')}
								className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition"
							>
								Contact Support Team
							</button>
						</div>

						<button
							onClick={() => setShowSOSModal(false)}
							className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}