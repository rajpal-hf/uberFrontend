
import LoadingPage from "../common/LoadingPage";
import ActiveRidePage from "../driver/ActiveRIde";
import DriverPanel from "../driver/DriverPannel";
import PickupNavigation from "../driver/NavigationPage";
import PaymentVerify from "../driver/PaymentVerify";
import DriverHome from "../DriverFound";
import DriverInfoPage from "../rider/DriverInfoPage";
import RideFareCalculator from "../rider/RideFareCalculater";


export const routes = [
	{
		role: "rider",
		children: [
			{ path: "/fare-calculate", element: RideFareCalculator },
			{ path: "/searching-driver/:id", element: LoadingPage },
			{ path: "/driver-info/:id", element: DriverInfoPage },
		]
	},

	{
		role: "driver",
		children: [
			{ path: "/driver-home", element: DriverPanel},
			{ path: "/pickup-navigation/:id", element:PickupNavigation},
			{ path: "/active-ride/:id", element: ActiveRidePage },
			{ path: "/payment-verify", element: PaymentVerify },
		]
	},


];
