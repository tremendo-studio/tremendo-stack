import { Db } from "~/db"

import cookieSessionStorage from "../cookie-session-storage.server"

export type SessionStorageDeps = {
  cookieStorage: typeof cookieSessionStorage
  dbClient: Db
}
