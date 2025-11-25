let socket = null;

export function connectWS(token) {
	if (socket) return socket;

	socket = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

	socket.onopen = () => console.log("WS Connected");
	socket.onclose = () => console.log("WS Disconnected");
	socket.onerror = (err) => console.log("WS Error", err);

	return socket;
}

export function getSocket() {
	return socket;
}
