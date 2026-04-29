export function getIO() {
  const io = (global as any).io;
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}