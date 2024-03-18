import express from "express";
import compression from "compression";
import morgan from "morgan";
import { getPayload } from "payload";
import dotenv from "dotenv";

import { createRequestHandler } from "@remix-run/express";
import { loadConfig } from "./loadConfig.js";
import { auth } from "./auth.ts";

dotenv.config();

// initiate vite dev server
const vite =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then(({ createServer }) =>
        createServer({
          server: {
            middlewareMode: true,
          },
        })
      );

// initiate payload local API
const config = await loadConfig("./payload.config.ts");
const payload = await getPayload({ config });

const remixHandler = createRequestHandler({
  // @ts-expect-error
  build: vite
    ? () => vite.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
  async getLoadContext(req, res) {
    // @ts-expect-error
    const headers = new Headers(req.headers);
    const result = await auth({ headers, payload });
    return {
      payload,
      user: result?.user,
      res,
    };
  },
});

// Start Express Server
const app = express();
app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

// handle Remix asset requests
if (vite) {
  app.use(vite.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

// handle Remix SSR requests
app.all("*", remixHandler);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log("Express server listening on http://localhost:" + port)
);
