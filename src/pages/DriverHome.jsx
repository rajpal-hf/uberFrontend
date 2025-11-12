import React from "react";
import Navbar from "../components/Navbar";

const DriverHome = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar role="Driver" />

			<div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl">
				<h2 className="text-2xl font-bold mb-4">Welcome, Driver 🚗</h2>
				<p className="text-gray-700 mb-6">
					Start accepting rides and manage your trips easily.
				</p>

				<div className="space-y-4">
					<button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
						🟢 Go Online
					</button>

					<button className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition">
						📜 Ride History
					</button>

					<button className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition">
						🧾 Earnings Summary
					</button>
				</div>
			</div>
		</div>
	);
};

export default DriverHome;
