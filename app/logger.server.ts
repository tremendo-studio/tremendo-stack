import pino from "pino"

export const logger = pino({
  transport: {
    options: {
      colorize: true,
    },
    target: "pino-pretty",
  },
})
