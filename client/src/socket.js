import { io } from "socket.io-client";

console.log(import.meta.env.VITE_BASE_URL);

export const socket = io(import.meta.env.VITE_BASE_URL, {
  withCredentials: true,
  autoConnect: true,
});
