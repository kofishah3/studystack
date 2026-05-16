"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

function readAuthToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") ?? "";
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    const socketInstance = io(siteUrl, {
      path: "/socket.io",
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      auth: { token: readAuthToken() },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    const onAuthToken = () => {
      const token = readAuthToken();
      socketInstance.auth = { token };
      if (socketInstance.connected) {
        socketInstance.disconnect().connect();
      } else {
        socketInstance.connect();
      }
    };

    window.addEventListener("studystack:auth-token", onAuthToken);

    setSocket(socketInstance);

    return () => {
      window.removeEventListener("studystack:auth-token", onAuthToken);
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
