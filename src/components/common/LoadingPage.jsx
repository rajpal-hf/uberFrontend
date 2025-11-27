import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {  getSocket } from '../../utils/webSocket/ws';

export default function LoadingPage() {
	const { rideId } = useParams();
	const location = useLocation();

	const id =
		rideId ||
		location.state?.rideId ||
		location.pathname.split('/').pop();

	const [isLoading, setIsLoading] = useState(true);
	const [showCancel, setShowCancel] = useState(false); 



	useEffect(() => {
		const timer = setTimeout(() => {
			setShowCancel(true);
		}, 10000); 

		return () => clearTimeout(timer);
	}, []);

	const handleCancel = async () => {
		try {
			console.log("hittinggggg")
			const ws = getSocket();
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify({
					event: "ride:cancel",
					data: { rideId : id }
				}));
			}
			setIsLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="min-h-screen flex flex-col gap-4 bg-linear-to-br from-gray-900 via-gray-800 to-black items-center justify-center">
			<div className="text-center">
				<div className="relative w-24 h-24 mx-auto mb-6">
					<div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
					<div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Finding your driver...</h2>
				<p className="text-gray-400">Please wait while we load ride details</p>
			</div>

			{showCancel && (
				<button
					onClick={handleCancel}
					className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
				>
					<X className="w-5 h-5" />
					Cancel
				</button>
			)}
		</div>
	);
}
