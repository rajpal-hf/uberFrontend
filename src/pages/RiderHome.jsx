import React, { useState, useEffect ,useRef } from "react";

import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import LocationInput from "../components/LocationInput";
import RecentPlaces from "../components/RecentPlaces";
import RideOptions from "../components/RideOptions";
import SearchingDriver from "../components/SearchingDriver";
import DriverFound from "../components/DriverFound";
import InRide from "../components/InRide";
import RideCompleted from "../components/RideCompleted";
import {calculateDistance,calculateETA,calculateFare} from "../utils/calculation";
import axios from "axios";


export default function UberRider() {



	
		
	


	const [showMenu, setShowMenu] = useState(false);
	const [step, setStep] = useState("home");
	const [pickup, setPickup] = useState("");
	const [dropoff, setDropoff] = useState("");

	const [pickupCoords, setPickupCoords] = useState(null);
	const [dropoffCoords, setDropoffCoords] = useState(null);

	const [pickupSuggestions, setPickupSuggestions] = useState([]);
	const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

	const [selectedRide, setSelectedRide] = useState(null);
	const [driver, setDriver] = useState(null);
	const [gettingLocation, setGettingLocation] = useState(false);

	const [rideId, setRideId] = useState(null);
	const ws = useRef(null);

	useEffect(() => {
		const token = localStorage.getItem("token");

		ws.current = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

		ws.current.onopen = () => {
			console.log("WS connected");

			ws.current.send(JSON.stringify({
				event: "register"
			}));
		};

		ws.current.onmessage = (msg) => {
			const data = JSON.parse(msg.data);
			console.log("WS EVENT:", data);

			if (data.event === "new_ride") {
				console.log("NEW RIDE AVAILABLE", data.data);
			}
		};

		ws.current.onclose = () => console.log("WS disconnected");

		return () => ws.current.close();
	}, []);

	


	const rideTypes = [
			{ id: 'uberx', name: 'UberX', description: 'Affordable, everyday rides', price: 12.50, time: '3 min', capacity: 4, icon: '🚗' },
			{ id: 'xl', name: 'UberXL', description: 'Affordable rides for groups up to 6', price: 18.50, time: '4 min', capacity: 6, icon: '🚐' },
			{ id: 'black', name: 'Uber Black', description: 'Premium rides in luxury cars', price: 25.00, time: '8 min', capacity: 4, icon: '🚘' },
			{ id: 'comfort', name: 'BBC - Big Black Car', description: 'Newer cars with extra legroom', price: 15.75, time: '5 min', capacity: 4, icon: '🚙' },
		];

	const recentPlaces = [
		{ name: "Home", address: "123 Main Street", icon: "🏠", coords: { lat: 30.704, lng: 76.717 } },
		{ name: "Work", address: "Business Park", icon: "💼", coords: { lat: 30.710, lng: 76.720 } },
	];



	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by your browser');
			return;
		}

		setGettingLocation(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				// Reverse geocode to get address
				try {
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
					);
					const data = await response.json();

					console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", data);
					const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

					setPickup(address);
					setPickupCoords({ lat, lng });
					console.log('Current Location:', { address, lat, lng });
				} catch (error) {
					console.error('Error getting address:', error);
					setPickup(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
					setPickupCoords({ lat, lng });
				}

				setGettingLocation(false);
			},
			(error) => {
				console.error('Error getting location:', error);
				alert('Unable to get your location. Please enter manually.');
				setGettingLocation(false);
			}
		);
	};

	const searchLocation = async (query, isPickup) => {
		if (query.length < 3) return;

		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
			);
			const data = await res.json();

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

	useEffect(() => {
		const t = setTimeout(() => pickup && searchLocation(pickup, true), 400);
		return () => clearTimeout(t);
	}, [pickup]);

	useEffect(() => {
		const t = setTimeout(() => dropoff && searchLocation(dropoff, false), 400);
		return () => clearTimeout(t);
	}, [dropoff]);

	// ---- COMPUTE DISTANCE / ETA ----
	const distance = calculateDistance(pickupCoords, dropoffCoords);
	const eta = calculateETA(distance);

	// fare wrapper
	const fare = (rideType) => calculateFare(distance, rideType);

	// ---- SELECT LOCATION ----
	const selectPickup = (s) => {
		setPickup(s.name);
		setPickupCoords({ lat: s.lat, lng: s.lng });
		setPickupSuggestions([]);
	};

	const selectDropoff = (s) => {
		setDropoff(s.name);
		setDropoffCoords({ lat: s.lat, lng: s.lng });
		setDropoffSuggestions([]);
	};

	// ---- REQUEST RIDE ----
	const requestRide = async () => {
		if (!pickupCoords || !dropoffCoords) {
			alert("Please select pickup and dropoff!");
			return;
		}

		setStep("searching");

		try {
			const res = await axios.post("http://localhost:3000/ride/request", {
				pickupLocation: {
					lat: pickupCoords.lat,
					lng: pickupCoords.lng,
					address: pickup
				},
				dropoffLocation: {
					lat: dropoffCoords.lat,
					lng: dropoffCoords.lng,
					address: dropoff
				},
				driverLocation: {
					lat: pickupCoords.lat, // initially same as pickup or null
					lng: pickupCoords.lng
				}
			}, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`
				}
			});

			console.log("Ride created:", res.data);

			
			setRideId(res.data.ride._id);

			// Simulating driver matching UI
			setTimeout(() => {

				// show here - that driver not found and again hit requestRide


				setDriver({
					name: "John Smith",
					rating: 4.9,
					trips: 1250,
					car: "Toyota Camry",
					plate: "ABC 123",
					photo: "👨",
				});
				setStep("driver-found");
			}, 2500);

		} catch (error) {
			console.log(error?.response?.data || error);
			alert("Failed to request ride!");
			setStep("home");
		}
	};


	const cancelRideHandler = async () => {
		if (!rideId) return;

		try {
			await axios.patch(
				`http://localhost:3000/ride/cancel/${rideId}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`
					}
				}
			);

			setStep("home");
			setRideId(null);
			setDriver(null);
			setSelectedRide(null);

		} catch (err) {
			console.error(err);
			alert("Cancel failed");
		}
	};


	return (
		<div className="min-h-screen flex flex-col bg-gray-50">

			<Header onMenu={() => setShowMenu(true)} />
			<SideMenu show={showMenu} onClose={() => setShowMenu(false)} />

			<div className="flex-1 overflow-y-auto p-4">

				{/* HOME SCREEN */}
				{step === "home" && (
					<>
						<LocationInput
							pickup={pickup}
							dropoff={dropoff}
							onPickupChange={setPickup}
							onDropoffChange={setDropoff}
							onUseCurrent={() => getCurrentLocation()			}
							pickupSuggestions={pickupSuggestions}
							dropoffSuggestions={dropoffSuggestions}
							onSelectPickup={selectPickup}
							onSelectDropoff={selectDropoff}
						/>

						<RecentPlaces
							places={recentPlaces}
							onSelect={(p) => {
								setDropoff(p.address);
								setDropoffCoords(p.coords);
							}}
						/>

						{pickupCoords && dropoffCoords &&
(
							<RideOptions
								rideTypes={rideTypes}

								selectedRide={selectedRide}
								onSelectRide={setSelectedRide}
								distance={distance}
								eta={eta}
								fare={fare}
							/>
						)}

						{selectedRide && (
							<button
								onClick={requestRide}
								className="w-full mt-4 bg-black text-white p-4 rounded-xl font-semibold"
							>
								Request {selectedRide.name}
							</button>
						)}
					</>
				)}

				{step === "searching" && <SearchingDriver />}

				
			
				{step === "driver-found" && driver && (
					<DriverFound
						driver={driver}
						pickup={pickup}
						dropoff={dropoff}
						onStartRide={() => setStep("in-ride")}
						onCancel={cancelRideHandler}
					/>
				)}

				{step === "in-ride" && driver && (
					<InRide
						driver={driver}
						pickup={pickup}
						dropoff={dropoff}
						onComplete={() => setStep("completed")}
					/>
				)}

				{step === "completed" && (
					<RideCompleted
						selectedRide={{ ...selectedRide, price: fare(selectedRide.id) }}
						distance={distance}
						onDone={() => window.location.reload()}
					/>
				)}
			</div>
		</div>
	);
}

