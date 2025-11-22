import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';


export default function LoadingPage() {
	const { rideId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();

	const id = rideId || location.state?.rideId;

	const [isLoading, setIsLoading] = useState(true);
	const [progress, setProgress] = useState(0);

	// Auto progress
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

	const handleCancel = async () => {
		try {
			await fetch(`http://localhost:3000/ride/cancel/${id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});

			setIsLoading(false);
			setProgress(0);

			// optional redirect
			navigate('/');
		} catch (error) {
			console.log(error);
		}
	};
	
	const handleRestart = () => {
		setIsLoading(true);
		setProgress(0);
	};

	if (!isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						{progress === 100 ? 'Complete!' : 'Cancelled'}
					</h2>
					<p className="text-gray-600 mb-6">
						{progress === 100 ? 'Loading finished successfully' : 'Loading was cancelled'}
					</p>
					<button
						onClick={handleRestart}
						className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
					>
						Restart Loading
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
						<Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
					</div>
					<h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
					<p className="text-gray-600">Please wait while we process your request</p>
				</div>

				{/* Progress Bar */}
				<div className="mb-6">
					<div className="flex justify-between text-sm text-gray-600 mb-2">
						<span>Progress</span>
						<span>{progress}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
						<div
							className="bg-indigo-600 h-full transition-all duration-300 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Cancel Button */}
				<button
					onClick={handleCancel}
					className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
				>
					<X className="w-5 h-5" />
					Cancel
				</button>
			</div>
		</div>
	);
}