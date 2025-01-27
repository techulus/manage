const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = process.env.PORT ?? 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let io;

app.prepare().then(() => {
	const httpServer = createServer(handler);

	io = new Server(httpServer);

	io.on("connection", (socket) => {
		console.log("Socket.io client connected:", socket.id);

		socket.on("message", (data) => {
			console.log("Received:", data);
			io.emit("message", `Server: ${data}`); // Broadcast to all clients
		});

		socket.on("disconnect", () => {
			console.log("Socket.io client disconnected:", socket.id);
		});
	});

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`);
		});
});

module.exports = { io };
