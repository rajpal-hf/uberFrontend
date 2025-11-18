import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
	const { user, loading } = useAuth();

	if (loading) return <p className="text-center mt-10">Loading...</p>;

	if (!user) {
		return <Navigate to="/login"  />;
	}

	if (allowedRole && user.role !== allowedRole) {
		return <Navigate to={`/home`} />;
	}
	return children;
};

export default ProtectedRoute;
