import { Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const RoleRoute = ({ allowedRole }) => {
	return (
		<ProtectedRoute allowedRole={allowedRole}>
			<Outlet />
		</ProtectedRoute>
	);
};

export default RoleRoute;
	