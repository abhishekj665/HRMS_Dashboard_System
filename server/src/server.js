import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env, funct } from "./config/env.js";
import http from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { syncDB } from "./config/db.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.client_url,
    credentials: true,
  },
});


io.on("connection", (socket) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      socket.disconnect();
      return;
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;

    const decoded = jwt.verify(token, env.jwt_password);

    if (decoded.role === "admin") {
      socket.join("admin");
    } else if (decoded.role === "manager") {
      socket.join("manager");
    }

    socket.join(`user:${decoded.id}`);

    socket.on("requestCreated", (data) => {
      io.to("admin").emit("requestCreated", data);
    });

    socket.on("requestUpdated", (data) => {
      io.to("admin").emit("requestUpdated", data);
      io.to("manager").emit("requestUpdated", data);
    });
  } catch (err) {
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

funct();

startServer();

export { io };
