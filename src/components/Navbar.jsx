import React from "react";

const Navbar = ({ role }) => {
	return (
		<nav className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
			<h1 className="text-xl font-semibold">
				Uber Clone <span className="text-sm opacity-75">({role})</span>
			</h1>

			<div className="flex space-x-4">
				<a href="/" className="hover:underline">
					Home
				</a>
				<a href="/profile" className="hover:underline">
					Profile
				</a>
				<button
					onClick={() => {
						localStorage.clear();
						window.location.href = "/login";
					}}
					className="bg-white text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-gray-100"
				>
					Logout
				</button>
			</div>
		</nav>
	);
};

export default Navbar;
