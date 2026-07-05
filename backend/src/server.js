const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logger");

const server = app.listen(env.port, () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

// Graceful shutdown & crash safety
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", { error: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => logger.info("Process terminated."));
});
