import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null); // { token, role }
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");

		if (token && role) {
			setUser({ token, role });
		} else {
			setUser(null);
		}
		setLoading(false);
	}, []);

	const login = (token, role) => {
		localStorage.setItem("token", token);
		localStorage.setItem("role", role);
		setUser({ token, role });
	};

	const logout = () => {
		localStorage.clear();
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
