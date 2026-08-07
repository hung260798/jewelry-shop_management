import { io } from "socket.io-client";
const socket = io();

socket.on("connect", () => {});

export function bindUser(userId: string) {
  socket.emit("join-by-userId", userId);
}

export function bindNoti(ev: string, showNoti: (...args: any) => void) {
  socket.on(ev, showNoti);
}

export default socket;
