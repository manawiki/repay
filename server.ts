import express from "express";
import compression from "compression";
import morgan from "morgan";
import { getPayload } from "payload";
import dotenv from "dotenv";
import next from "next";

import { createRequestHandler } from "@remix-run/express";
import { loadConfig } from "./loadConfig.js";
import { auth } from "./auth.ts";

dotenv.config();

// Initiate Next Handler
let nextApp = next({ dev: process.env.NODE_ENV !== "production" });
let handle = nextApp.getRequestHandler();
await nextApp.prepare();

function nextHandler(req, res) {
  return handle(req, res);
}

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

// First, we need to serve all the /_next URLs, this includes the built files
// and the images optimized by Next.js
app.all("/_next/*", nextHandler);

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

// Finally, we need to tell our server to pass any other request to Next
// so it can keep working as an expected
app.all("/admin*", nextHandler);
app.all("/api*", nextHandler);
app.all("/my-route", nextHandler);

// handle Remix SSR requests
app.all("*", remixHandler);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log("Express server listening on http://localhost:" + port)
);
