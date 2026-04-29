import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  (global as any).io = io;

  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);

    socket.on("join:question", (questionId: string) => {
      socket.join(`question:${questionId}`);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected:", socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
