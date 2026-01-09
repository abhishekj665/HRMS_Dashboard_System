import app from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { env } from "./config/env.js";
import http from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { syncDB } from "./db/syncDB.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      console.log("NO COOKIE HEADER");
      socket.disconnect();
      return;
    }

    const cookies = cookie.parse(cookieHeader);

    const token = cookies.token;

    const decoded = jwt.verify(token, env.jwt_password);

    if (decoded.role === "admin") {
      socket.join("admin");
    }
    socket.join(`user:${decoded.id}`);
  } catch (err) {
    console.log("Socket auth failed");
    socket.disconnect();
  }

  socket.on("disconnect", (reason) => {
    if (reason !== "transport close") {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    }
  });
});

const startServer = async () => {
  await connectDB();

  // await syncDB()

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

startServer();

export { io };
