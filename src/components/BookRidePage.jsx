import React, { useEffect, useRef, useState } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Polyline,
	useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const BookRidePage = () => {
	const { user } = useAuth();
	const [pickup, setPickup] = useState(null);
	const [drop, setDrop] = useState(null);
	const [route, setRoute] = useState([]);
	const [coords, setCoords] = useState(null);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	// Get current location
	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setCoords([pos.coords.latitude, pos.coords.longitude]);
			},
			(err) => {
				console.error("Location access denied:", err);
				setMessage("Please enable location permissions.");
			}
		);
	}, []);

	// Handle map click for selecting pickup & drop
	function LocationSelector() {
		useMapEvents({
			click(e) {
				const { lat, lng } = e.latlng;
				if (!pickup) {
					setPickup({ lat, lng });
				} else if (!drop) {
					setDrop({ lat, lng });
				} else {
					setPickup({ lat, lng });
					setDrop(null);
					setRoute([]);
					setMessage("Pickup reset. Select drop point again.");
				}
			},
		});
		return null;
	}

	// Fetch route from OpenRouteService once both points are set
	useEffect(() => {
		const fetchRoute = async () => {
			if (pickup && drop) {
				try {
					const res = await axios.get(
						`https://api.openrouteservice.org/v2/directions/driving-car`,
						{
							params: {
								api_key: import.meta.env.VITE_ORS_API_KEY,
								start: `${pickup.lng},${pickup.lat}`,
								end: `${drop.lng},${drop.lat}`,
							},
						}
					);

					const coords = res.data.features[0].geometry.coordinates.map((c) => [
						c[1],
						c[0],
					]);
					setRoute(coords);
				} catch (err) {
					console.error("Failed to fetch route:", err);
					setMessage("Could not get route.");
				}
			}
		};
		fetchRoute();
	}, [pickup, drop]);

	const handleBookRide = async () => {
		if (!pickup || !drop) {
			setMessage("Please select pickup and drop points.");
			return;
		}

		try {
			setLoading(true);
			const res = await axios.post(
				`${import.meta.env.VITE_API_URL}/ride/create`,
				{
					pickupCoords: pickup,
					dropCoords: drop,
				},
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);

			if (res.data.success) {
				setMessage("✅ Ride booked successfully!");
			}
		} catch (error) {
			console.error(error);
			setMessage(
				error.response?.data?.message || "Failed to book ride. Try again."
			);
		} finally {
			setLoading(false);
		}
	};

	const pickupIcon = new L.Icon({
		iconUrl:
			"https://cdn-icons-png.flaticon.com/512/684/684908.png",
		iconSize: [35, 35],
	});
	const dropIcon = new L.Icon({
		iconUrl:
			"https://cdn-icons-png.flaticon.com/512/149/149059.png",
		iconSize: [35, 35],
	});

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar role="rider" />
			<div className="flex-1 relative">
				{coords ? (
					<MapContainer
						center={coords}
						zoom={13}
						scrollWheelZoom={true}
						className="h-full w-full"
					>
						<TileLayer
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							attribution="&copy; OpenStreetMap contributors"
						/>
						<LocationSelector />
						{pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
						{drop && <Marker position={[drop.lat, drop.lng]} icon={dropIcon} />}
						{route.length > 0 && (
							<Polyline positions={route} color="blue" weight={4} />
						)}
					</MapContainer>
				) : (
					<p className="text-center mt-20 text-gray-500">
						Getting your location...
					</p>
				)}

				<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg p-4 w-80">
					<h2 className="font-semibold text-lg mb-2 text-center">Book Ride</h2>
					<p className="text-sm text-gray-600 mb-2 text-center">
						{pickup && drop
							? "Ready to confirm your ride!"
							: "Click map to set pickup & drop"}
					</p>
					<button
						onClick={handleBookRide}
						disabled={!pickup || !drop || loading}
						className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40"
					>
						{loading ? "Booking..." : "Confirm Ride"}
					</button>
					{message && (
						<p className="text-center text-xs text-gray-600 mt-2">{message}</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default BookRidePage;
	