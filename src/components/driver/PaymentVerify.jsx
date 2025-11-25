import { useState } from "react";
import { CheckCircle, Smartphone, Wallet, Loader2, Camera } from "lucide-react";
import axios from "axios";

export default function PaymentModePage() {
	const [mode, setMode] = useState(null);
	const [loading, setLoading] = useState(false);
	const [receiptImage, setReceiptImage] = useState(null);

	const rideId = "RID12345"; // dynamically from props or params

	// -------------------------
	// Auto Verify (Online)
	// -------------------------
	const handleOnlineVerify = async () => {
		setLoading(true);
		try {
			await axios.post("/api/payment/verify-online", { rideId });
			alert("Online Payment Verified Automatically");
		} catch (err) {
			alert("Error verifying online payment");
		}
		setLoading(false);
	};

	// -------------------------
	// Manual Verify (Offline)
	// -------------------------
	const handleOfflineVerify = async () => {
		setLoading(true);

		const formData = new FormData();
		formData.append("rideId", rideId);
		if (receiptImage) formData.append("receipt", receiptImage);

		try {
			await axios.post("/api/payment/verify-offline", formData);
			alert("Offline Payment Verified Successfully");
		} catch (err) {
			alert("Offline verification failed");
		}
		setLoading(false);
	};

	return (
		<div className="p-5 max-w-sm mx-auto">
			<h1 className="text-2xl font-bold mb-5">Payment Verification</h1>

			{/* ----------- Step 1: Choose Mode ----------- */}
			{!mode && (
				<div className="space-y-4">
					{/* Online Button */}
					<button
						className="w-full flex items-center gap-3 justify-center bg-green-600 text-white py-4 rounded-xl shadow"
						onClick={() => {
							setMode("online");
							handleOnlineVerify();
						}}
					>
						<Smartphone size={22} />
						Online Payment (Auto Verify)
					</button>

					{/* Offline Button */}
					<button
						className="w-full flex items-center gap-3 justify-center bg-yellow-500 text-white py-4 rounded-xl shadow"
						onClick={() => setMode("offline")}
					>
						<Wallet size={22} />
						Offline Cash Payment
					</button>
				</div>
			)}

			{/* ----------- Step 2: Online Mode ----------- */}
			{mode === "online" && (
				<div className="text-center mt-8">
					{loading ? (
						<Loader2 className="animate-spin mx-auto mb-3" size={40} />
					) : (
						<CheckCircle size={60} className="text-green-600 mx-auto mb-4" />
					)}

					<h2 className="text-xl font-semibold">Processing Online Payment...</h2>
					<p className="text-gray-600">Please wait, verifying with gateway.</p>
				</div>
			)}

			{/* ----------- Step 3: Offline Mode ----------- */}
			{mode === "offline" && (
				<div className="mt-8">
					<h2 className="text-lg font-semibold mb-3">Verify Offline Payment</h2>

					{/* Upload Receipt */}
					<label htmlFor="receipt" className="block mb-4">
						<div className="border rounded-lg p-3 flex items-center gap-3 cursor-pointer">
							<Camera size={22} />
							{receiptImage ? receiptImage.name : "Upload Receipt (Optional)"}
						</div>
						<input
							id="receipt"
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => setReceiptImage(e.target.files[0])}
						/>
					</label>

					{/* Manual verify button */}
					<button
						className="w-full bg-black text-white py-4 rounded-xl flex justify-center items-center"
						onClick={handleOfflineVerify}
					>
						{loading ? (
							<Loader2 size={20} className="animate-spin" />
						) : (
							<>Verify Cash Payment</>
						)}
					</button>
				</div>
			)}
		</div>
	);
}
