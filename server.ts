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
      console.log(`socket ${socket.id} joined question:${questionId}`);
    });

    socket.on("leave:question", (questionId: string) => {
      socket.leave(`question:${questionId}`);
      console.log(`socket ${socket.id} left question:${questionId}`);
    });

    socket.on("join:tutorial", (tutorialId: string) => {
      socket.join(`tutorial:${tutorialId}`);
      console.log(`socket ${socket.id} joined tutorial:${tutorialId}`);
    });

    socket.on("leave:tutorial", (tutorialId: string) => {
      socket.leave(`tutorial:${tutorialId}`);
    });

    socket.on("join:feed", () => {
      socket.join("feed");
      console.log(`socket ${socket.id} joined feed`);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected:", socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});

export function emitNewAnswer(questionId: string, answer: object) {
  const io = (global as any).io as Server;
  io.to(`question:${questionId}`).emit("new:answer", answer);
}

export function emitNewComment(questionId: string, comment: object) {
  const io = (global as any).io as Server;
  io.to(`question:${questionId}`).emit("new:comment", comment);
}

export function emitDemandUpdate(questionId: string, demandScore: number) {
  const io = (global as any).io as Server;
  io.to("feed").emit("update:demand", { questionId, demandScore });
}

export function emitTutorialLinked(questionId: string, tutorial: object) {
  const io = (global as any).io as Server;
  io.to(`question:${questionId}`).emit("linked:tutorial", tutorial);
}