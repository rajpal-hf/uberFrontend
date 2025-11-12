import React from "react";

const countryCodes = [
	{ code: "+1", name: "US" },
	{ code: "+44", name: "UK" },
	{ code: "+91", name: "India" },
	{ code: "+61", name: "Australia" },
	{ code: "+971", name: "UAE" },
];

const PhoneInput = ({ value, onChange, countryCode, onCodeChange }) => {
	return (
		<div className="flex space-x-2">
			<select
				value={countryCode}
				onChange={(e) => onCodeChange(e.target.value)}
				className="w-24 border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{countryCodes.map((c) => (
					<option key={c.code} value={c.code}>
						{c.name} ({c.code})
					</option>
				))}
			</select>
			<input
				type="tel"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Phone number"
				className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	);
};

export default PhoneInput;
