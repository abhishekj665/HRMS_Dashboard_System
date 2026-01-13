import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import http from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";

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
      console.log(" NO COOKIE HEADER");
      socket.disconnect();
      return;
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;

    const decoded = jwt.verify(token, env.jwt_password);

    console.log("Socket authenticated:", decoded.role, decoded.id);

    if (decoded.role === "admin") {
      socket.join("admin");
      console.log("➡ joined admin room");
    } else if (decoded.role === "manager") {
      socket.join("manager");
      console.log("➡ joined manager room");
    }

    socket.join(`user:${decoded.id}`);
  } catch (err) {
    console.log("Socket auth failed:", err.message);
    socket.disconnect();
  }

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
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
