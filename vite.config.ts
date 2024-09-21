import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  optimizeDeps: {
    exclude: ["@mapbox", "mock-aws-s3", "nock", "aws-sdk"],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/", "modules/home/index.tsx")
          route("/dashboard", "modules/dashboard/routes/dashboard.tsx")
          route(undefined, "modules/auth/routes/layout.tsx", () => {
            route("sign-in", "modules/auth/routes/sign-in.tsx")
            route("sign-up", "modules/auth/routes/sign-up.tsx")
            route("authenticate", "modules/auth/routes/authenticate.tsx")
          })
        })
      },
    }),
    tsconfigPaths(),
  ],
})
