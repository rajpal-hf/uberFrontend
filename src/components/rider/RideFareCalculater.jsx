import React, { useState, useEffect } from "react";
import { MapPin, Car, Bike, Truck } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RideFareCalculator() {


	const navigate = useNavigate();
	const [pickupLocation, setPickupLocation] = useState({
		lat: "",
		lng: "",
		address: "",
	});
	const [dropoffLocation, setDropoffLocation] = useState({
		lat: "",
		lng: "",
		address: "",
	});

	// Search text input
	const [pickup, setPickup] = useState("");
	const [dropoff, setDropoff] = useState("");

	// Suggestions
	const [pickupSuggestions, setPickupSuggestions] = useState([]);
	const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

	const [pickupCoords, setPickupCoords] = useState(null);
	const [dropoffCoords, setDropoffCoords] = useState(null);

	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [gettingLocation, setGettingLocation] = useState(null);


	const requestRide = async (mode) => {
		try {
			const { data } = await axios.post(
				"http://localhost:3000/ride/request",
				{
					vehicleType: mode,
					pickupLocation,
					dropoffLocation,
					fare: result.estimatedFare[mode],
				},
				{withCredentials: true}
			)
			console.log("data while sending request", data);	
			return data;
		}
		catch(error) {
			console.log(error);
			console.error("Error fetching token:", error);
			return
		}
	}


	const goToRequest = async(mode) => {

		try {
			const res = await requestRide(mode);

			if (!res.success) {
				console.log("res", res);
				return 
			}

			console.log("resssssssssssssssss idddddddddddddddddd", res.ride._id);
			navigate(`/searching-driver/${res.ride._id}`, {
				state: {
					rideId: res.rideId,
				},
			});
		} catch (error) {
			console.error("Error fetching token:", error);
			return;
		}
		
	};


	// ------------------------
	// GET CURRENT LOCATION
	// ------------------------
	const getCurrentLocation = (locationType) => {
		setGettingLocation(locationType);
		setError("");

		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser");
			setGettingLocation(null);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				try {
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
					);
					const data = await response.json();
					const address = data.display_name || `${lat}, ${lng}`;

					const locationData = { lat, lng, address };

					if (locationType === "pickup") {
						setPickupLocation(locationData);
						setPickup(locationData.address); // <-- FIX
					} else {
						setDropoffLocation(locationData);
						setDropoff(locationData.address); // <-- FIX
					}

				} catch (err) {
					const locationData = { lat, lng, address: `${lat}, ${lng}` };

					if (locationType === "pickup") {
						setPickupLocation(locationData);
						setPickup(locationData.address); // <-- FIX
					} else {
						setDropoffLocation(locationData);
						setDropoff(locationData.address); // <-- FIX
					}
				}

				setGettingLocation(null);
			},
		)
	}


	// ------------------------
	// SEARCH FOR LOCATION
	// ------------------------
	const searchLocation = async (query, isPickup) => {
		if (!query || query.length < 3) return;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
			);	
			const data = await response.json();

			const mapped = data.map((i) => ({
				name: i.display_name,
				lat: parseFloat(i.lat),
				lng: parseFloat(i.lon),
			}));

			if (isPickup) setPickupSuggestions(mapped);
			else setDropoffSuggestions(mapped);
		} catch (e) {
			console.log("Search error:", e);
		}
	};

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => searchLocation(pickup, true), 400);
		return () => clearTimeout(timer);
	}, [pickup]);

	useEffect(() => {
		const timer = setTimeout(() => searchLocation(dropoff, false), 400);
		return () => clearTimeout(timer);
	}, [dropoff]);

	// ------------------------
	// SELECT SUGGESTION
	// ------------------------
	const selectPickup = (place) => {
		setPickup(place.name);
		setPickupCoords({ lat: place.lat, lng: place.lng });
		setPickupSuggestions([]);

		setPickupLocation({
			lat: place.lat,
			lng: place.lng,
			address: place.name,
		});
	};

	const selectDropoff = (place) => {
		setDropoff(place.name);
		setDropoffCoords({ lat: place.lat, lng: place.lng });
		setDropoffSuggestions([]);

		setDropoffLocation({
			lat: place.lat,
			lng: place.lng,
			address: place.name,
		});
	};


	const calculateFare = async () => {
		if (!pickupLocation.lat || !dropoffLocation.lat) {
			setError("Please enter both pickup and dropoff locations");
			return;
		}

		console.log("dropoffLocation", dropoffLocation);

		setLoading(true);
		setError("");

		console.log("pickupLocation", pickupLocation);
		try {
			console.log("pickupLocation", pickupLocation);	
			const res = await axios.post("http://localhost:3000/ride/ride-fare", {
			pickupLocation,
			dropoffLocation
			},
				{withCredentials: true}
			)

			console.log("res", res);
			setResult(res.data);
		} catch (err) {
			setError("Failed to calculate fare. Please try again.");
		} finally {
			setLoading(false);
		}
	};


	return (
		<div className="min-h-screen bg-linear-to-r from-blue-50 to-indigo-100 p-4">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
						Ride Fare Calculator
					</h1>

					{/* Pickup input */}
					<div className="mb-6">
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Pickup Location
						</label>
						<div className=" flex gap-2">
							<div className=" flex-1">
								<input
									type="text"
									value={pickup}
									onChange={(e) => setPickup(e.target.value)}
									placeholder="pickup location"
									className="w-full px-4 py-3 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<button
								onClick={() => getCurrentLocation('pickup')}
								disabled={gettingLocation === 'pickup'}
								className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
							>
								{gettingLocation === 'pickup' ? (
									<div className="animate-spin">⟳</div>
								) : (
									<MapPin size={20} />
								)}
							</button>
						</div>



						{pickupSuggestions.length > 0 && (
							<ul className="mt-2 bg-white border rounded-lg shadow">
								{pickupSuggestions.map((s, i) => (
									<li
										key={i}
										className="p-2 hover:bg-gray-100 cursor-pointer"
										onClick={() => selectPickup(s)}
									>
										{s.name}
									</li>
								))}
							</ul>
						)}

						{pickupLocation.lat && (
							<p className="text-xs text-gray-500 mt-1">
								Coordinates: {pickupLocation.lat.toFixed(4)},{" "}
								{pickupLocation.lng.toFixed(4)}
							</p>
						)}
					</div>

					{/* Dropoff input */}
					<div className="mb-6">
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Dropoff Location
						</label>

						<div className=" flex gap-2">
							<div className=" flex-1">
								<input
									type="text"
									value={dropoff}
									onChange={(e) => setDropoff(e.target.value)}
									placeholder="Search dropoff location"
									className="w-full px-4 py-3 border-gray-300 rounded-lg border focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<button
								onClick={() => getCurrentLocation('dropoff')}
								disabled={gettingLocation === 'dropoff'}
								className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
							>
								{gettingLocation === 'dropoff' ? (
									<div className="animate-spin">⟳</div>
								) : (
									<MapPin size={20} />
								)}
							</button>
						</div>




						{dropoffSuggestions.length > 0 && (
							<ul className="mt-2 bg-white border rounded-lg shadow">
								{dropoffSuggestions.map((s, i) => (
									<li
										key={i}
										className="p-2 hover:bg-gray-100 cursor-pointer"
										onClick={() => selectDropoff(s)}
									>
										{s.name}
									</li>
								))}
							</ul>
						)}

						{dropoffLocation.lat && (
							<p className="text-xs text-gray-500 mt-1">
								Coordinates: {dropoffLocation.lat.toFixed(4)},{" "}
								{dropoffLocation.lng.toFixed(4)}
							</p>
						)}
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
							{error}
						</div>
					)}

					<button
						onClick={calculateFare}
						disabled={loading}
						className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
					>
						{loading ? "Calculating..." : "Calculate Fare"}
					</button>

					{/* Result */}
					{result && (
						<div className="mt-8 space-y-4">
							<div className="bg-indigo-600 text-white p-4 rounded-lg">
								<div className="flex justify-between">
									<span>Total Distance</span>
									<span className="text-xl font-bold">
										{result.distanceInKm} km
									</span>
								</div>
							</div>

							{/* Fare Cards */}
							{Object.keys(result.estimatedFare).map((mode) => (
								<div
									key={mode}
									onClick={() => gotoSearch(mode)}
									className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-indigo-600 transition"
								>
									<div className="flex justify-between items-center">
										<div className="flex gap-3 items-center">
											<div className="p-3 rounded-full bg-gray-100">
												{mode === "auto" && <Truck size={24} />}
												{mode === "bike" && <Bike size={24} />}
												{mode === "car" && <Car size={24} />}
											</div>

											<div>
												<h3 className="font-semibold capitalize">{mode}</h3>
												<p className="text-sm text-gray-500">
													{result.estimatedTime[mode]} mins
												</p>
											</div>
										</div>

										<div className="text-right">
											<p className="text-xl font-bold">
												₹{result.estimatedFare[mode].toFixed(2)}
											</p>
										</div>
									</div>
								</div>
							))}

						</div>
					)}
				</div>
			</div>
		</div>
	);
}
