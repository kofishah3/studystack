import { DatabaseError } from "@/lib/errors";

export function getIO() {
  const io = (global as any).io;
  if (!io) throw new DatabaseError("Socket.io not initialized");
  return io;
}
