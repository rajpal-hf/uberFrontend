// rzp_test_RcOumgU4UtUrop

import React, { useState, useEffect } from 'react';
import { CreditCard, MapPin, Clock, User, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RidePayment() {

	const location = useLocation();
	const navigate = useNavigate();

	const rideData = location?.state?.payment;

	const [paymentStatus, setPaymentStatus] = useState('pending');
	const [rideDetails, setRideDetails] = useState(null);

	useEffect(() => {
		if (!rideData) {
			navigate('/rider-home');
			return;
		}

		setRideDetails({
			driverName: rideData?.driverName || "Driver",
			driverRating: rideData?.driverRating || 4.5,
			vehicleNumber: rideData?.vehicleNumber || "NA",
			pickupLocation: rideData?.pickupLocation?.address,
			dropLocation: rideData?.dropoffLocation?.address,
			distance: rideData?.distance + " km",
			duration: rideData?.duration + " mins",
			baseFare: rideData?.fareBreakdown?.baseFare || 0,
			distanceFare: rideData?.fareBreakdown?.distanceFare || 0,
			timeFare: rideData?.fareBreakdown?.timeFare || 0,
			serviceFee: rideData?.fareBreakdown?.serviceFee || 0,
			total: Math.round(rideData?.fare)
		});
	}, [rideData, navigate]);

	const loadRazorpay = () => {
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.src = 'https://checkout.razorpay.com/v1/checkout.js';
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	const handlePayment = async () => {
		const res = await loadRazorpay();
		if (!res) {
			alert('Razorpay SDK failed to load. Please check your internet.');
			return;
		}

		setPaymentStatus('processing');

		const options = {
			key: 'rzp_test_RcOumgU4UtUrop', // replace
			amount: rideDetails.total * 100,
			currency: "INR",
			name: "Ride Service",
			description: "Ride Payment",
			handler: async function (response) {
				console.log("Payment success", response);

				await axios.post(
					`${process.env.REACT_APP_BASE_URL}/ride/payment-complete/${rideData._id}`,
					{
						razorpay_payment_id: response.razorpay_payment_id
					},
					{
						headers: { Authorization: localStorage.getItem("token") }
					}
				);

				setPaymentStatus('success');
			},
			theme: { color: "#3B82F6" }
		};

		const paymentObject = new window.Razorpay(options);
		paymentObject.open();
	};

	// WAIT for rideDetails to load 👇
	if (!rideDetails) return <p>Loading...</p>;

	// SUCCESS SCREEN SAME AS BEFORE...
	if (paymentStatus === "success") {
		return (
			<div className="min-h-screen bg-green-100 flex items-center justify-center">
				<div className="p-6 bg-white rounded-xl shadow text-center">
					<CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
					<h2 className="text-2xl font-bold">Payment Successful!</h2>
					<p className="mt-2 text-gray-600">Amount Paid: ₹{rideDetails.total}</p>
					<button
						onClick={() => navigate("/rider-home")}
						className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4"
					>
						Continue
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-blue-50 p-4">
			<div className="max-w-2xl mx-auto pt-8">
				<div className="bg-white rounded-xl shadow p-6">
					<h1 className="text-xl font-bold">Ride Completed</h1>
					<p className="text-gray-600">Complete your payment</p>

					{/* Driver Section */}
					<div className="flex items-center gap-4 mt-4">
						<User className="w-10 h-10 text-blue-600" />
						<div>
							<h3 className="font-semibold">{rideDetails.driverName}</h3>
							<span className="text-sm text-gray-600">⭐ {rideDetails.driverRating}</span>
						</div>
					</div>

					{/* Trip */}
					<div className="mt-4 space-y-3">
						<div className="flex gap-3">
							<MapPin className="w-5 h-5 text-green-600" />
							<p>{rideDetails.pickupLocation}</p>
						</div>
						<div className="flex gap-3">
							<MapPin className="w-5 h-5 text-red-600" />
							<p>{rideDetails.dropLocation}</p>
						</div>
						<div className="flex gap-3">
							<Clock className="w-5 h-5 text-blue-600" />
							<p>{rideDetails.distance} | {rideDetails.duration}</p>
						</div>
					</div>

					{/* Fare */}
					<div className="border-t my-4 pt-4">
						<div className="flex justify-between font-semibold text-lg">
							<span>Total Fare</span>
							<span>₹{rideDetails.total}</span>
						</div>
					</div>

					{/* Pay Button */}
					<button
						onClick={handlePayment}
						disabled={paymentStatus === "processing"}
						className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg"
					>
						{paymentStatus === "processing" ? "Processing..." : `Pay ₹${rideDetails.total}`}
					</button>
				</div>
			</div>
		</div>
	);
}
