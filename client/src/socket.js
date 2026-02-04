import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  withCredentials: true,
  autoConnect: true,
});

//import.meta.env.VITE_BASE_URL
