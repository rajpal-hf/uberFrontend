import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getSocket } from '../../utils/webSocket/ws';


export default function LoadingPage() {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();

	// const rideId = id || location.state?.id || location.pathname.split['/'][-1];

	const rideId = 
		id ||
		location.state?.id ||
		location.pathname.split('/').pop();

	const [isLoading, setIsLoading] = useState(true);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (isLoading) {
			const interval = setInterval(() => {
				setProgress(prev => {
					if (prev >= 100) {
						clearInterval(interval);
						setIsLoading(false);
						return 100;
					}
					return prev + 1;
				});
			}, 50);

			return () => clearInterval(interval);
		}
	}, [isLoading]);


	useEffect(() => {
		const socket = getSocket();

		if (!socket) return;

		socket.onmessage = (msg) => {
			const { event, data } = JSON.parse(msg.data);

			if (event === "ride:accepted") {
				console.log("Driver accepted!", data);

				navigate(`/driver-info/${data._id}`, {
					state: { rideId: data._id }
				});
			}
		};
	}, []);


	const checkDriverFound = async () => {
		try {
			console.log("code break after this ");
			const { data } = await axios.get(
				`http://localhost:3000/ride/driver/${rideId}`,
				{ withCredentials: true }
			);

			console.log("data while sending request", data);

			if (data.success && data.ride) {
				navigate(`/driver-info/${rideId}`, 
					{
						state: {
							rideId: data.ride._id,
						},
					}	
				);
			}

		} catch (error) {
			console.log(error);
			console.error( error);
			return
		}
	};

	useEffect(() => {
		if (rideId) checkDriverFound();
	}, []);

	

	const handleCancel = async () => {
		try {
			await axios.patch(`http://localhost:3000/ride/cancel/${rideId}`, {}, {withCredentials: true});
			

			setIsLoading(false);
			setProgress(0);

			// optional redirect
			navigate('/fare-calculate');
		} catch (error) {
			console.log(error);
		}
	};


	

	return (
		<div className="min-h-screen flex flex-col gap-4  bg-linear-to-br from-gray-900 via-gray-800 to-black items-center justify-center">
			<div className="text-center">
				<div className="relative w-24 h-24 mx-auto mb-6">
					<div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
					<div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Finding your driver...</h2>
				<p className="text-gray-400">Please wait while we load ride details</p>
			</div>

				<button
					onClick={handleCancel}
					className="w- flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
				>
					<X className="w-5 h-5" />
					Cancel
				</button>

			
		</div>
		
	);
}