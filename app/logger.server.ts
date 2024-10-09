import logger from "pino"

export const log = logger({
  transport: {
    options: {
      colorize: true,
    },
    target: "pino-pretty",
  },
})
