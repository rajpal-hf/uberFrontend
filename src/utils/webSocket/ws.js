let socket = null;
let reconnectTimer = null;

export function connectWS(token, onMessage) {
	// Prevent duplicate connections from Strict Mode
	if (socket && socket.readyState !== WebSocket.CLOSED) {
		console.log("Reusing existing WS connection");
		return socket;
	}

	socket = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

	socket.onopen = () => {
		console.log("WS Connected 🚀");
		if (reconnectTimer) clearTimeout(reconnectTimer);
	};

	socket.onclose = () => {
		console.log("WS Disconnected");

		// Prevent multiple reconnect timers
		if (reconnectTimer) return;

		reconnectTimer = setTimeout(() => {
			reconnectTimer = null;
			console.log("WS Reconnecting...");
			connectWS(token, onMessage);
		}, 2000);
	};

	socket.onerror = (err) => console.log("WS Error:", err);

	socket.onmessage = (msg) => {
		if (!onMessage) return;
		try { 
			const data = JSON.parse(msg.data);
			onMessage(data.event, data.data);
		} catch (e) {
			console.log("WS parse error", e);
		}
	};
	return socket;
}

export function getSocket() {
	return socket;
}
