// Websocket implementation
//
// Starts a connection to the server and emits events for other scripts to
// listen for.

let websocket = io('/radar', {});
let socket = {
	connected: false,
	connect: () => {
		attachEvents(websocket)

		function attachEvents(websocket) {
			// Called when the socket is started
			websocket.on("connect", () => {
				socket.connected = true
			})

			websocket.on("disconnect", () => {
				socket.connected = false
			})
		}
	},

	// Dummy element, events are fired from here
	element: {
		addEventListener: websocket.on
	}
}


// Start the socket
socket.connect()
