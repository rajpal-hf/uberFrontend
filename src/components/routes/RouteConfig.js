
import LoadingPage from "../common/LoadingPage";
import ActiveRidePage from "../driver/ActiveRIde";
import DriverPanel from "../driver/DriverPannel";
import PickupNavigation from "../driver/NavigationPage";
import PaymentVerify from "../driver/PaymentVerify";
import DriverInfoPage from "../rider/DriverInfoPage";
import RideFareCalculator from "../rider/RideFareCalculater";
import RideOngoingPage from "../rider/RideOnGoing";
import RidePayment from "../rider/RidePayment";


export const routes = [
	{ 
		role: "rider",
		children: [
			{ path: "/rider-home", element: RideFareCalculator },
			{ path: "/searching-driver/:id", element: LoadingPage },
			{ path: "/driver-info/:id", element: DriverInfoPage },
			{ path: "/on-going-ride/:id", element: RideOngoingPage },
			{ path: "/checkout/:id", element: RidePayment },
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
