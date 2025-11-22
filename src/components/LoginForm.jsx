import React, { useContext, useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { meta } from '@eslint/js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {

	const navigate = useNavigate()
	const { login } = useAuth();	
	const [step, setStep] = useState('phone');
	const [countryCode, setCountryCode] = useState('+91');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [showCountrySelect, setShowCountrySelect] = useState(false);



	const countries = [
		{ code: '+1', name: 'United States', flag: '🇺🇸'},
		{ code: '+44', name: 'United Kingdom', flag: '🇬🇧'},
		{ code: '+91', name: 'India', flag: '🇮🇳'},
		{ code: '+86', name: 'China', flag: '🇨🇳'},
		{ code: '+81', name: 'Japan', flag: '🇯🇵'},
		{ code: '+49', name: 'Germany', flag: '🇩🇪'},
		{ code: '+33', name: 'France', flag: '🇫🇷'},
		{ code: '+61', name: 'Australia', flag: '🇦🇺'},
	];


	
	async function handleSendOtp() {
		if (phoneNumber.length < 10) {
			return { success: false, message: "Invalid phone number" };
		}

		try {
			setStep("otp");

			console.log(import.meta.env.BASE_URL);


			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"; 
			const URL = `${API_BASE_URL}/auth/number-verify`;


			const { data } = await axios.post( URL, {
				phone: countryCode + phoneNumber,
			});

			if (!data.success) {
				return { success: false, message: data.message };
			}

			
			return { success: true };
		} catch (error) {
			console.error(error);
			return {
				success: false,
				message: error.response?.data?.message || "Something went wrong",
			};
		}
	}


	const handleOtpChange = (index, value) => {
		if (value.length <= 1 && /^\d*$/.test(value)) {
			const newOtp = [...otp];
			newOtp[index] = value;
			setOtp(newOtp);

			// Auto-focus next input
			if (value && index < 5) {
				document.getElementById(`otp-${index + 1}`).focus();
			}
		}
	};
	
	const handleVerifyOtp = async () => {
		try {
			const { data } = await axios.post("http://localhost:3000/auth/login", {
				phone: countryCode + phoneNumber,
				otp: otp.join(""),
			},
				{ withCredentials: true }
			
			);

			if (!data.success) {
				return alert(data.message);
			}

			login(data.token, data.role);

			//  Navigate based on role
			if (data.role === "rider") {
				navigate("/	fare-calculate");
			} else if (data.role === "driver") {
				navigate("/driver-home");
			}

		} catch (error) {
			console.error(error);
			alert("Something went wrong");
		}
	};


	const handleBack = () => {
		if (step === 'otp') {
			setStep('phone');
			setOtp(['', '', '', '', '', '']);
		}
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			{/* Header */}
			<div className="p-4 flex items-center">
				{step === 'otp' && (
					<button onClick={handleBack} className="mr-4">
						<ArrowLeft className="w-6 h-6" />
					</button>
				)}
				<h1 className="text-2xl font-bold">Uber</h1>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-md">
					{step === 'phone' && (
						<div>
							<h2 className="text-3xl font-bold mb-2">Enter your mobile number</h2>
							<p className="text-gray-600 mb-8">We'll send you a verification code</p>

							{/* Country Code Selector */}
							<div className="relative mb-4">
								<button
									onClick={() => setShowCountrySelect(!showCountrySelect)}
									className="w-full flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg hover:border-black transition"
								>
									<span className="flex items-center gap-2">
										<span className="text-2xl">
											{countries.find(c => c.code === countryCode)?.flag}
										</span>
										<span className="font-medium">{countryCode}</span>
									</span>
									<ChevronDown className="w-5 h-5" />
								</button>

								{showCountrySelect && (
									<div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
										{countries.map((country) => (
											<button
												key={country.code}
												onClick={() => {
													setCountryCode(country.code);
													setShowCountrySelect(false);
												}}
												className="w-full flex items-center gap-3 p-4 hover:bg-gray-100 transition"
											>
												<span className="text-2xl">{country.flag}</span>
												<span className="flex-1 text-left">{country.name}</span>
												<span className="text-gray-600">{country.code}</span>
											</button>
										))}
									</div>
								)}
							</div>

							{/* Phone Number Input */}
							<div className="mb-6">
								<input
									type="tel"
									value={phoneNumber}
									onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
									placeholder="Phone number"
									className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-black focus:outline-none transition"
									maxLength="15"
								/>
							</div>

							{/* Continue Button */}
							<button
								onClick={handleSendOtp}
								disabled={phoneNumber.length < 10}
								className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition"
							>
								Continue
							</button>

							<p className="text-xs text-gray-500 mt-4">
								By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from Uber and its affiliates to the number provided.
							</p>
						</div>
					)}

					{step === 'otp' && (
						<div>
							<h2 className="text-3xl font-bold mb-2">Enter verification code</h2>
							<p className="text-gray-600 mb-8">
								We sent a code to {countryCode} {phoneNumber}
							</p>

							{/* OTP Input */}
							<div className="flex gap-3 mb-6">
								{otp.map((digit, index) => (
									<input
										key={index}
										id={`otp-${index}`}
										type="text"
										inputMode="numeric"
										value={digit}
										onChange={(e) => handleOtpChange(index, e.target.value)}
										className="w-full aspect-square text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition"
										maxLength="1"
									/>
								))}
							</div>

							{/* Verify Button */}
							<button
								onClick={handleVerifyOtp}
								disabled={otp.some(digit => digit === '')}
								className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition"
							>
								Verify
							</button>

							<button className="w-full text-center mt-4 text-gray-600 hover:text-black transition">
								Resend code
							</button>
						</div>
					)}

					{step === 'success' && (
						<div className="text-center">
							<div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
								<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h2 className="text-3xl font-bold mb-2">Welcome!</h2>
							<p className="text-gray-600 mb-8">You've successfully logged in</p>
							<p className="text-lg font-medium mb-2">Phone Number</p>
							<p className="text-gray-600">{countryCode} {phoneNumber}</p>

							<button
								onClick={() => {
									setStep('phone');
									setPhoneNumber('');
									setOtp(['', '', '', '', '', '']);
								}}
								className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition mt-8"
							>
								Go to Home
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}