import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoleRoute from "./components/routes/RoleRoutes";
import { routes } from "./components/routes/RouteConfig";
import { connectWS } from './utils/webSocket/ws';
import { useEffect } from 'react';




function App() {

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) connectWS(token);
	}, []);

	return (

		<Routes>

			<Route path="/" element={ <Login />} />
			<Route path="/signup" element={<Signup />} />

			{routes.map((group) => (
				<Route key={group.role} element={<RoleRoute allowedRole={group.role} />}>
					{group.children.map((r) => (
						<Route key={r.path} path={r.path} element={<r.element/>} />
					))}
				</Route>
			))}

		</Routes>
	);
}

export default App;
