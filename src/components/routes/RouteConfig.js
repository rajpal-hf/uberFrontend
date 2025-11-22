
import DriverHome from "../DriverFound";
import RequestRide from "../rider/RequestRide";
import RideFareCalculator from "../rider/RideFareCalculater";


export const routes = [
	{
		role: "rider",
		children: [
			{ path: "/fare-calculate", element: RideFareCalculator },
			{ path: "/request/:id", element: RequestRide },
		]
	},

	{
		role: "driver",
		children: [
			{ path: "/driver-home", element: DriverHome  },
		]
	},


];
