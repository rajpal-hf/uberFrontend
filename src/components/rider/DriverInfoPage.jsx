import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, Navigation, CreditCard, Calendar } from 'lucide-react';
import LoadingPage from '../common/LoadingPage';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { connectWS, getSocket } from '../../utils/webSocket/ws';

export default function DriverInfoPage() {
	const [ride, setRideData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate()
	const { id } = useParams();
	const rideId = id || location.pathname.split("/")[-1];
	const location = useLocation()


	




	useEffect(() => {
		const token = localStorage.getItem("token");

		connectWS(token, (event, data) => {

			if (event === "ride:started") {
				
			}
			if (event === "ride:accepted") {
				navigate(`/driver-info/${data._id}`)
			}

			if (event === "ride:cancelled") {
				alert("Driver cancelled the ride.");
				navigate("/rider-home");
			}
			if (event === "ride:completed") {
				navigate(`/payment/${rideId}`, {
					state: { payment: data.payment }
				});
			}
		});


	}, []);

	useEffect(() => {
		const fetchRideData = async () => {
			try {
				setLoading(true);
				const { data } = await axios.get(`http://localhost:3000/ride/driver/${rideId}`, {withCredentials: true});

				

				setRideData(data.ride);
				setLoading(false);
			} catch (err) {
				setError('Failed to load ride information');
				setLoading(false);
			}
		};

		fetchRideData();
	}, []);
	const cancelRideHandler = async() => {
		try {
			await axios.patch(`http://localhost:3000/ride/cancel/${rideId}`, {}, { withCredentials: true });


			setLoading(false);
			const ws = getSocket();
					if (!ws || ws.readyState !== WebSocket.OPEN) return;
			
					ws.send(JSON.stringify({
						event: "ride:cancel",
						data: {
							rideId,
						}
					}));
		} catch (error) {
			console.error(error);
		}
	} 

	const getStatusColor = (status) => {
		const colors = {
			'accepted': 'bg-green-500',
			'pending': 'bg-yellow-500',
			'completed': 'bg-blue-500',
			'cancelled': 'bg-red-500'
		};
		return colors[status] || 'bg-gray-500';
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString('en-IN', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	};


	if (error) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
				<div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
					<p className="text-red-400 text-center">{error}</p>
				</div>
			</div>
		);
	}

	if (!ride) return (
		<LoadingPage />
	) ; 

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="bg-linear-to-r from-green-600 to-green-700 rounded-t-2xl p-6 shadow-2xl">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-white mb-2">Your Ride</h1>
							<p className="text-green-100">Ride ID: {ride._id.slice(-8)}</p>
						</div>
						<div className={`${getStatusColor(ride.rideStatus)} px-4 py-2 rounded-full`}>
							<span className="text-white font-semibold uppercase text-sm">{ride.rideStatus}</span>
						</div>
					</div>
				</div>

				{/* Driver Info Card */}
				<div className="bg-gray-800 border-x-2 border-gray-700 p-6">
					<div className="flex items-center space-x-4">
						<div className="w-20 h-20 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
							<User className="w-10 h-10 text-white" />
						</div>
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-white mb-1">{ride.driverId.name}</h2>
							<p className="text-gray-400 flex items-center gap-2">
								<Phone className="w-4 h-4" />
								{ride.driverId.phone}
							</p>
							<p className="text-green-400 mt-2 uppercase text-sm font-semibold">
								{ride.vehicleType}
							</p>
						</div>
					</div>
				</div>

				{/* Location Details */}
				<div className="bg-gray-800 border-x-2 border-gray-700 p-6 space-y-4">
					<div className="flex items-start space-x-4">
						<div className="mt-1 p-2 bg-blue-600 rounded-full">
							<MapPin className="w-5 h-5 text-white" />
						</div>
						<div className="flex-1">
							<h3 className="text-white font-semibold mb-1">Pickup Location</h3>
							<p className="text-gray-400 text-sm">{ride.pickupLocation.address}</p>
							<p className="text-gray-500 text-xs mt-1">
								{ride.pickupLocation.lat}, {ride.pickupLocation.lng}
							</p>
						</div>
					</div>

					<div className="h-px bg-gray-700 my-4"></div>

					<div className="flex items-start space-x-4">
						<div className="mt-1 p-2 bg-red-600 rounded-full">
							<Navigation className="w-5 h-5 text-white" />
						</div>
						<div className="flex-1">
							<h3 className="text-white font-semibold mb-1">Drop-off Location</h3>
							<p className="text-gray-400 text-sm">{ride.dropoffLocation.address}</p>
							<p className="text-gray-500 text-xs mt-1">
								{ride.dropoffLocation.lat}, {ride.dropoffLocation.lng}
							</p>
						</div>
					</div>
				</div>

				{/* Ride Details */}
				<div className="bg-gray-800 border-x-2 border-b-2 border-gray-700 rounded-b-2xl p-6 shadow-2xl">
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-900 rounded-lg p-4">
							<div className="flex items-center space-x-3">
								<CreditCard className="w-6 h-6 text-green-400" />
								<div>
									<p className="text-gray-400 text-sm">Fare</p>
									<p className="text-white text-xl font-bold">₹{ride.fare || 'TBD'}</p>
								</div>
							</div>
						</div>

						<div className="bg-gray-900 rounded-lg p-4">
							<div className="flex items-center space-x-3">
								<Navigation className="w-6 h-6 text-blue-400" />
								<div>
									<p className="text-gray-400 text-sm">Distance</p>
									<p className="text-white text-xl font-bold">{ride.distance || '0'} km</p>
								</div>
							</div>
						</div>

						<div className="bg-gray-900 rounded-lg p-4">
							<div className="flex items-center space-x-3">
								<CreditCard className="w-6 h-6 text-yellow-400" />
								<div>
									<p className="text-gray-400 text-sm">Payment</p>
									<p className="text-white text-lg font-semibold capitalize">{ride.paymentStatus}</p>
								</div>
							</div>
						</div>

						<div className="bg-gray-900 rounded-lg p-4">
							<div className="flex items-center space-x-3">
								<Calendar className="w-6 h-6 text-purple-400" />
								<div>
									<p className="text-gray-400 text-sm">Created</p>
									<p className="text-white text-xs font-semibold">{formatDate(ride.createdAt)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="mt-6 flex gap-4">
					<button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl">
						Call Driver
					</button>
						<button
							onClick={cancelRideHandler}
						className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl">
						Cancel Ride
					</button>
				</div>
			</div>
		</div>
	);
}