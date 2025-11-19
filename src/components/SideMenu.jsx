import { X, User, Star, Clock, CreditCard, Gift, HelpCircle, LogOut, ChevronRight } from "lucide-react";

export default function SideMenu({ show, onClose }) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 z-50">
			<div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

			<div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
				<div className="p-6">																																					
					<button onClick={onClose} className="mb-6">
						<X className="w-6 h-6" />
					</button>

					{/* Profile */}
					<div className="flex items-center gap-4 mb-8 pb-6 border-b">
						<div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
							<User className="w-8 h-8 text-gray-600" />
						</div>
						<div>
							<h3 className="font-bold text-lg">Alex Rider</h3>
							<div className="flex items-center gap-1 text-sm text-gray-600">
								<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
								<span>4.8</span>
							</div>
						</div>
					</div>

					{/* Menu */}
					<nav className="space-y-1">
						{[
							{ label: "Profile", icon: User },
							{ label: "Your Trips", icon: Clock },
							{ label: "Payment", icon: CreditCard },
							{ label: "Promotions", icon: Gift },
							{ label: "Help", icon: HelpCircle },
						].map((item, i) => (
							<button key={i} className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg">
								<item.icon className="w-5 h-5" />
								<span className="flex-1 text-left font-medium">{item.label}</span>
								<ChevronRight className="w-5 h-5 text-gray-400" />
							</button>
						))}

						{/* Logout */}
						<button className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 text-red-600">
							<LogOut className="w-5 h-5" />
							<span className="flex-1 text-left font-medium">Logout</span>
						</button>
					</nav>
				</div>
			</div>
		</div>
	);
}
