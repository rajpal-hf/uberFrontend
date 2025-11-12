import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
	const [step, setStep] = useState("phone"); 
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const navigate = useNavigate()

	// 1️⃣ Send OTP
	const handleSendOtp = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		try {
			const res = await axios.post("http://localhost:3000/auth/number-verify", { phone });
			setMessage("OTP sent successfully ✅");
			setStep("otp");
		} catch (err) {
			setMessage(err.response?.data?.message || "Failed to send OTP ❌");
		} finally {
			setLoading(false);
		}
	};

	// 2️⃣ Verify OTP
	const handleVerifyOtp = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		try {
			const res = await axios.post("http://localhost:3000/auth/login", {
				phone,
				otp,
			});

			setMessage("Login successful ✅");
			
			// Example: store JWT or user data
			localStorage.setItem("token", res.data.token); 	
			navigate('/home')	
		} catch (err) {
			setMessage(err.response?.data?.message || "Invalid OTP ");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10">
			<h2 className="text-2xl font-bold text-center mb-6">
				{step === "phone" ? "Login with Phone" : "Enter OTP"}
			</h2>

			{step === "phone" && (
				<form onSubmit={handleSendOtp} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Phone Number
						</label>
						<input
							type="tel"
							required
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="Enter phone number"
							className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
					>
						{loading ? "Sending..." : "Send OTP"}
					</button>
				</form>
			)}

			{step === "otp" && (
				<form onSubmit={handleVerifyOtp} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Enter OTP
						</label>
						<input
							type="text"
							required
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Enter the OTP"
							className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
					>
						{loading ? "Verifying..." : "Verify & Login"}
					</button>

					<p
						onClick={() => setStep("phone")}
						className="text-center text-sm text-blue-600 cursor-pointer"
					>
						Edit phone number
					</p>
				</form>
			)}

			{message && (
				<p className="text-center text-sm mt-4 text-gray-700">{message}</p>
			)}
		</div>
	);
};

export default LoginForm;
