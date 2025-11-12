import React from "react";
import Navbar from "../components/Navbar";

const RiderHome = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar role="Rider" />

			<div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
				<h2 className="text-2xl font-bold mb-4">Welcome, Rider 👋</h2>
				<p className="text-gray-700 mb-6">
					Book a ride easily and track your driver in real-time.
				</p>

				<div className="space-y-4">
					<button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
						🚕 Request a Ride
					</button>

					<button className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition">
						📜 View Ride History
					</button>

					<button className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition">
						💳 Manage Payments
					</button>
				</div>
			</div>
		</div>
	);
};

export default RiderHome;
