export const calculateDistance = (c1, c2) => {
	if (!c1 || !c2) return 0;

	const R = 6371; //earth radius 
	const toRad = (v) => (v * Math.PI) / 180;

	const dLat = toRad(c2.lat - c1.lat);
	const dLon = toRad(c2.lng - c1.lng);

	const lat1 = toRad(c1.lat);
	const lat2 = toRad(c2.lat);

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculateETA = (distanceKm) => {
	const avgSpeed = 35; // km/h
	const timeHrs = distanceKm / avgSpeed;
	return Math.round(timeHrs ); 
};

export const calculateFare = (distanceKm, rideType) => {
	const base = {
		uberx: 35,
		xl: 45,
		black: 90,
		comfort: 40,
	};

	const perKm = {
		uberx: 12,
		comfort: 16,
		xl: 18,
		black: 25,
	};

	if (!rideType) return 0;

	return (base[rideType] + perKm[rideType] * distanceKm).toFixed(2);
};
