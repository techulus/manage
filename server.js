const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const socket = new Server(httpServer);

	socket.on("connection", (socket) => {
		console.log("A user connected:", socket.id);

		socket.on("join", (userId) => {
			socket.join(userId);
			console.log(`User ${userId} joined channel`);
		});
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected:", socket.id);
	});

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(
				`> Server listening at http://localhost:${port} as ${
					dev ? "development" : process.env.NODE_ENV
				}`,
			);
		});
});
