import React, { useState, useEffect, useRef } from "react";
import { MapPin, Clock, DollarSign, Car, Bike, Truck, Loader, CheckCircle, XCircle, ArrowLeft, Navigation } from "lucide-react";

export default function RiderDetails() {
	// Mock data - in real app this would come from route state

	 
	const [rideDetails] = useState({
		rideType: "auto",
		pickupLocation: {
			lat: 28.6139,
			lng: 77.209,
			address: "Connaught Place, New Delhi, India"
		},
		dropoffLocation: {
			lat: 28.4595,
			lng: 77.0266,
			address: "Cyber Hub, Gurugram, Haryana, India"
		},
		fare: 450,
		eta: 25,
		distance: 35.5
	});

	const socketRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [rideData, setRideData] = useState(null);
	const [rideStatus, setRideStatus] = useState("idle"); 
	const [driverInfo, setDriverInfo] = useState(null);
	const [driverLocation, setDriverLocation] = useState(null);
	const [socketConnected, setSocketConnected] = useState(false);
	const [authToken, setAuthToken] = useState(""); 

	useEffect(() => {
		const token = localStorage.getItem("authToken") || "";
		setAuthToken(token);
	}, []);

	// Initialize WebSocket Connection
	useEffect(() => {
		if (!authToken) {
			setError("Authentication token not found. Please login.");
			return;
		}

		
		try {
			const ws = new WebSocket(`ws://localhost:3000/ws?token=${authToken}`);
			socketRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected");
				setSocketConnected(true);
				setError("");
			};

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					console.log("WebSocket message:", message);

					switch (message.event) {
						case "registered":
							console.log("Successfully registered with userId:", message.userId);
							break;

						case "ride_accepted":
							setRideStatus("accepted");
							if (message.driver) {
								setDriverInfo(message.driver);
							}
							break;

						case "ride_started":
							setRideStatus("ongoing");
							break;

						case "driver_location_update":
							setDriverLocation(message.location);
							break;

						case "ride_completed":
							setRideStatus("completed");
							break;

						case "ride_cancelled":
							setRideStatus("cancelled");
							setError(message.reason || "Ride was cancelled");
							break;

						case "error":
							setError(message.message || "An error occurred");
							break;
					}
				} catch (err) {
					console.error("Error parsing WebSocket message:", err);
				}
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
				setError("Connection error. Please check your connection.");
				setSocketConnected(false);
			};

			ws.onclose = (event) => {
				console.log("WebSocket disconnected", event.code, event.reason);
				setSocketConnected(false);

				if (event.code === 1008) {
					setError("Authentication failed. Please login again.");
				}
			};

			// Cleanup
			return () => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.close();
				}
			};
		} catch (err) {
			console.error("Failed to create WebSocket:", err);
			setError("Failed to establish connection");
		}
	}, [authToken]);

	const getVehicleIcon = (type) => {
		switch (type) {
			case "auto": return <Truck size={32} />;
			case "bike": return <Bike size={32} />;
			case "car": return <Car size={32} />;
			default: return <Car size={32} />;
		}
	};

	const requestRide = async () => {
		setLoading(true);
		setError("");
		setRideStatus("requesting");

		try {
			const response = await fetch("http://localhost:3000/ride/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`
				},
				credentials: "include",
				body: JSON.stringify({
					pickupLocation: {
						lat: rideDetails.pickupLocation.lat,
						lng: rideDetails.pickupLocation.lng,
						address: rideDetails.pickupLocation.address
					},
					dropoffLocation: {
						lat: rideDetails.dropoffLocation.lat,
						lng: rideDetails.dropoffLocation.lng,
						address: rideDetails.dropoffLocation.address
					},
					vehicleType: rideDetails.rideType,
					fare: rideDetails.fare
				})
			});

			const data = await response.json();

			if (data.success) {
				setRideData(data.ride);
				setRideStatus("pending");

				// Emit new_ride event to WebSocket
				if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
					socketRef.current.send(JSON.stringify({
						event: "new_ride",
						data: {
							rideId: data.ride._id,
							vehicleType: rideDetails.rideType,
							pickupLocation: rideDetails.pickupLocation,
							dropoffLocation: rideDetails.dropoffLocation,
							fare: rideDetails.fare,
							distance: rideDetails.distance
						}
					}));
				}
			} else {
				throw new Error(data.message || "Failed to request ride");
			}
		} catch (err) {
			console.error("Request error:", err);
			setError(err.message || "Failed to request ride. Please try again.");
			setRideStatus("idle");
		} finally {
			setLoading(false);
		}
	};

	const cancelRide = async () => {
		if (!rideData) return;

		try {
			const response = await fetch(`http://localhost:3000/ride/${rideData._id}/cancel`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authToken}`
				},
				credentials: "include"
			});

			const data = await response.json();

			if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
				socketRef.current.send(JSON.stringify({
					event: "cancel_ride",
					data: { rideId: rideData._id }
				}));
			}

			setRideStatus("cancelled");
		} catch (err) {
			console.error("Cancel error:", err);
			setError("Failed to cancel ride");
		}
	};

	const getRideStatusColor = () => {
		switch (rideStatus) {
			case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
			case "ongoing": return "bg-green-100 text-green-800 border-green-200";
			case "completed": return "bg-green-100 text-green-800 border-green-200";
			case "cancelled": return "bg-red-100 text-red-800 border-red-200";
			default: return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getRideStatusText = () => {
		switch (rideStatus) {
			case "requesting": return "Requesting ride...";
			case "pending": return "Looking for drivers...";
			case "accepted": return "Driver on the way!";
			case "ongoing": return "Trip in progress";
			case "completed": return "Trip completed";
			case "cancelled": return "Ride cancelled";
			default: return "Ready to request";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6 mt-4">
					<button
						className="p-2 hover:bg-white rounded-lg transition"
					>
						<ArrowLeft size={24} />
					</button>
					<h1 className="text-2xl font-bold text-gray-800">Request Ride</h1>

					{/* Connection Status */}
					<div className="ml-auto flex items-center gap-2">
						<div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
						<span className="text-xs text-gray-600">
							{socketConnected ? "Connected" : "Disconnected"}
						</span>
					</div>
				</div>

				{/* Main Card */}
				<div className="bg-white rounded-2xl shadow-xl p-6">

					{/* Ride Status Banner */}
					{rideStatus !== "idle" && (
						<div className={`mb-6 p-4 rounded-lg border-2 flex items-center justify-between ${getRideStatusColor()}`}>
							<div className="flex items-center gap-3">
								{(rideStatus === "requesting" || rideStatus === "pending") && (
									<Loader className="animate-spin" size={24} />
								)}
								{(rideStatus === "accepted" || rideStatus === "ongoing" || rideStatus === "completed") && (
									<CheckCircle size={24} />
								)}
								{rideStatus === "cancelled" && <XCircle size={24} />}
								<span className="font-semibold">{getRideStatusText()}</span>
							</div>
						</div>
					)}

					{/* Vehicle Type Card */}
					<div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 mb-6 border border-indigo-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-indigo-600 text-white rounded-full shadow-lg">
									{getVehicleIcon(rideDetails.rideType)}
								</div>
								<div>
									<h3 className="text-xl font-bold capitalize text-gray-800">{rideDetails.rideType}</h3>
									<div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
										<Clock size={16} />
										<span>Estimated: {rideDetails.eta} mins</span>
									</div>
								</div>
							</div>
							<div className="text-right">
								<p className="text-3xl font-bold text-indigo-600">₹{rideDetails.fare?.toFixed(2)}</p>
								<p className="text-sm text-gray-500">{rideDetails.distance} km</p>
							</div>
						</div>
					</div>

					{/* Location Details */}
					<div className="space-y-4 mb-6">
						<div className="flex gap-3">
							<div className="flex flex-col items-center pt-1">
								<div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
								<div className="w-0.5 h-16 bg-gray-300 my-1"></div>
								<div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
							</div>
							<div className="flex-1 space-y-8">
								<div className="bg-green-50 p-3 rounded-lg border border-green-200">
									<div className="flex items-start gap-2">
										<MapPin size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-xs text-green-700 font-semibold mb-1">PICKUP LOCATION</p>
											<p className="font-medium text-gray-800">{rideDetails.pickupLocation?.address}</p>
											<p className="text-xs text-gray-500 mt-1">
												{rideDetails.pickupLocation?.lat?.toFixed(4)}, {rideDetails.pickupLocation?.lng?.toFixed(4)}
											</p>
										</div>
									</div>
								</div>
								<div className="bg-red-50 p-3 rounded-lg border border-red-200">
									<div className="flex items-start gap-2">
										<MapPin size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-xs text-red-700 font-semibold mb-1">DROPOFF LOCATION</p>
											<p className="font-medium text-gray-800">{rideDetails.dropoffLocation?.address}</p>
											<p className="text-xs text-gray-500 mt-1">
												{rideDetails.dropoffLocation?.lat?.toFixed(4)}, {rideDetails.dropoffLocation?.lng?.toFixed(4)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Driver Info (when accepted) */}
					{driverInfo && (rideStatus === "accepted" || rideStatus === "ongoing") && (
						<div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-200">
							<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
								<Car size={20} className="text-blue-600" />
								Driver Details
							</h3>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<p className="text-xs text-gray-600">Name</p>
									<p className="font-medium text-gray-800">{driverInfo.name}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600">Vehicle Number</p>
									<p className="font-medium text-gray-800">{driverInfo.vehicleNumber}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600">Phone</p>
									<p className="font-medium text-gray-800">{driverInfo.phone}</p>
								</div>
								<div>
									<p className="text-xs text-gray-600">Rating</p>
									<p className="font-medium text-gray-800">⭐ {driverInfo.rating || "4.8"}</p>
								</div>
							</div>

							{/* Driver Location */}
							{driverLocation && (
								<div className="mt-3 pt-3 border-t border-blue-200">
									<div className="flex items-center gap-2 text-sm text-blue-800">
										<Navigation size={16} />
										<span>Driver Location: {driverLocation.lat?.toFixed(4)}, {driverLocation.lng?.toFixed(4)}</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
							<XCircle size={20} className="flex-shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{/* Action Buttons */}
					<div className="space-y-3">
						{rideStatus === "idle" && (
							<button
								onClick={requestRide}
								disabled={loading || !socketConnected || !authToken}
								className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg"
							>
								{loading ? (
									<>
										<Loader className="animate-spin" size={20} />
										Requesting...
									</>
								) : !authToken ? (
									"Please Login"
								) : !socketConnected ? (
									"Connecting..."
								) : (
									<>
										<Car size={20} />
										Request Ride
									</>
								)}
							</button>
						)}

						{(rideStatus === "pending" || rideStatus === "accepted") && (
							<button
								onClick={cancelRide}
								className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2"
							>
								<XCircle size={20} />
								Cancel Ride
							</button>
						)}

						{rideStatus === "completed" && (
							<button
								className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"
							>
								<CheckCircle size={20} />
								Book Another Ride
							</button>
						)}

						{rideStatus === "cancelled" && (
							<button
								className="w-full bg-gray-500 text-white py-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-lg flex items-center justify-center gap-2"
							>
								<ArrowLeft size={20} />
								Go Back
							</button>
						)}
					</div>

					{/* Ride ID */}
					{rideData && (
						<div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
							<p className="text-xs text-gray-500 mb-1">Ride ID</p>
							<p className="text-sm font-mono text-gray-700 break-all">{rideData._id}</p>
							<div className="mt-2 pt-2 border-t border-gray-200">
								<p className="text-xs text-gray-500">Status: <span className="font-medium">{rideData.rideStatus}</span></p>
								<p className="text-xs text-gray-500">Payment: <span className="font-medium">{rideData.paymentStatus}</span></p>
							</div>
						</div>
					)}
				</div>

				{/* Payment Info */}
				<div className="bg-white rounded-2xl shadow-xl p-6 mt-4">
					<h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
						<DollarSign size={20} className="text-indigo-600" />
						Payment Details
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Base Fare</span>
							<span className="font-medium">₹{rideDetails.fare?.toFixed(2)}</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Distance</span>
							<span className="font-medium">{rideDetails.distance} km</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Vehicle Type</span>
							<span className="font-medium capitalize">{rideDetails.rideType}</span>
						</div>
						{rideData && (
							<div className="flex justify-between py-2">
								<span className="text-gray-600">Payment Status</span>
								<span className={`font-medium px-2 py-1 rounded text-xs ${rideData.paymentStatus === 'pending'
										? 'bg-yellow-100 text-yellow-700'
										: 'bg-green-100 text-green-700'
									}`}>
									{rideData.paymentStatus}
								</span>
							</div>
						)}
						<div className="border-t-2 border-gray-200 pt-3 mt-3">
							<div className="flex justify-between items-center">
								<span className="font-semibold text-gray-800 text-lg">Total Amount</span>
								<span className="font-bold text-indigo-600 text-2xl">₹{rideDetails.fare?.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* WebSocket Debug Info (can be removed in production) */}
				<div className="bg-gray-800 text-gray-300 rounded-xl p-4 mt-4 font-mono text-xs">
					<p className="text-gray-400 mb-2">WebSocket Debug:</p>
					<p>Status: {socketConnected ? "✅ Connected" : " Disconnected"}</p>
					<p>Endpoint: ws://localhost:3000/ws</p>
					<p>Auth: {authToken ? "✅ Token present" : "No token"}</p>
					{rideData && <p>Ride ID: {rideData._id}</p>}
				</div>

				{/* Info Card */}
				<div className="bg-blue-50 rounded-xl p-4 mt-4 border border-blue-200">
					<p className="text-sm text-blue-800">
						💡 <strong>Tip:</strong> Your driver will arrive at the pickup location shortly after accepting the ride.
						Please be ready at the specified location.
					</p>
				</div>
			</div>
		</div>
	);
}