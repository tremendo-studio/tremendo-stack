import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route(undefined, "modules/auth/routes/layout.tsx", () => {
            route("/sign-in", "modules/auth/routes/sign-in.tsx")
            route("/sign-up", "modules/auth/routes/sign-up.tsx")
            route("/authenticate", "modules/auth/routes/authenticate.tsx")
          })
        })
      },
    }),
    tsconfigPaths(),
  ],
})
