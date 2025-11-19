import React, { useState } from "react";
import axios from "axios";

const SignupForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		role: "rider",
	});

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		try {
			// Replace with your backend endpoint
			const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
			setMessage("Signup successful ✅");
		} catch (error) {
			setMessage(error.response?.data?.message || "Signup failed ");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10">
			<h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">Full Name</label>
					<input
						type="text"
						name="name"
						required
						value={formData.name}
						onChange={handleChange}
						className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						name="email"
						required
						value={formData.email}
						onChange={handleChange}
						className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Phone</label>
					<input
						type="tel"
						name="phone"
						required
						value={formData.phone}
						onChange={handleChange}
						className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Password</label>
					<input
						type="password"
						name="password"
						required
						value={formData.password}
						onChange={handleChange}
						className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">Role</label>
					<select
						name="role"
						value={formData.role}
						onChange={handleChange}
						className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="rider">Rider</option>
						<option value="driver">Driver</option>
					</select>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
				>
					{loading ? "Creating..." : "Sign Up"}
				</button>
			</form>

			{message && (
				<p className="text-center text-sm mt-4 text-gray-700">{message}</p>
			)}
		</div>
	);
};

export default SignupForm;
