import { createServer } from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import next from "next";
import cron from "node-cron";
import { runTutorialPurge } from "./src/lib/cron/purge-tutorials";
import type { PurgeResult } from "./src/lib/cron/purge-tutorials";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  if (process.env.NODE_ENV !== "test") {
    cron.schedule("0 3 * * *", () => {
      runTutorialPurge()
        .then((result: PurgeResult) =>
          console.log(
            `[purge-tutorials cron] deleted=${result.deleted} files_removed=${result.files_removed}`,
          ),
        )
        .catch((err: any) => console.error("[purge-tutorials cron]", err));
    });

    cron.schedule("0 */3 * * *", () => {
      import("./src/lib/cron/demand-decay")
        .then(({ runDemandDecay }) => runDemandDecay())
        .then((result) => {
          console.log(`[demand-decay cron] updated=${result.updated}`);
          const io = (global as any).io as Server;
          if (io) io.to("feed").emit("update:demand", { batch: true });
        })
        .catch((err: any) => console.error("[demand-decay cron]", err));
    });
  }

  const httpServer = createServer((req, res) => {
    try {
      handle(req, res);
    } catch (err) {
      console.error("Next.js handle error:", err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  (global as any).io = io;

  io.use((socket, next) => {
    const auth = socket.handshake.auth as { token?: unknown } | undefined;
    const token = auth?.token;
    if (typeof token !== "string" || !token) {
      next();
      return;
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      (socket.data as { userId?: string }).userId = payload.userId;
    } catch {
      // Invalid token: still allow the connection for public listeners
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);

    const uid = (socket.data as { userId?: string }).userId;
    if (typeof uid === "string") {
      socket.join(`user:${uid}`);
    }

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

export function emitLeaderboardUpdate() {
  const io = (global as any).io as Server;
  io.emit("leaderboard:update");
}

export function emitUserMetricsUpdate(userId: string) {
  const io = (global as any).io as Server;
  io.emit(`user:metrics_update:${userId}`);
}
