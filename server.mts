import express from "express";
import compression from "compression";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
import { getPayload } from "payload";
import invariant from "tiny-invariant";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { createRequestHandler } from "@remix-run/express";
import { installGlobals, type ServerBuild } from "@remix-run/node";
import { loadConfig } from "./loadConfig.js";
import { auth } from "./auth.ts";
import { IncomingHttpHeaders } from "http";

dotenv.config();

// initiate payload local API
const config = await loadConfig("./payload.config.ts");
const payload = await getPayload({ config });

async function start() {
  const app = express();

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

  const remixHandler = createRequestHandler({
    // @ts-expect-error
    build: vite
      ? () => vite.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
    async getLoadContext(req, res) {
      // @ts-expect-error
      const headers = new Headers(req.headers);

      // console.log(headers);

      const result = await auth({ headers, payload });

      // console.log(result);

      return {
        payload,
        user: result?.user,
        res,
      };
    },
  });

  // Express Server setup
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
    app.use(
      "/assets",
      express.static("build/client/assets", { immutable: true, maxAge: "1y" })
    );
  }

  app.use(express.static("build/client", { maxAge: "1h" }));

  // handle Remix SSR requests
  app.all("*", remixHandler);

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log("Express server listening on http://localhost:" + port)
  );
}

start();
