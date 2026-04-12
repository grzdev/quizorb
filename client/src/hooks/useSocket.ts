import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

// Module-level singleton — shared across all hook consumers.
let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
    });
  }
  return socket;
}

export function useSocket(): Socket {
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const s = socketRef.current;

    if (!s.connected) {
      s.connect();
    }

    function onConnect() {
      console.log("[socket] connected:", s.id);
    }

    function onDisconnect(reason: string) {
      console.log("[socket] disconnected:", reason);
    }

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  return socketRef.current;
}
