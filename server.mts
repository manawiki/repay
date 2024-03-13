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

// patch in Remix runtime globals
installGlobals();
dotenv.config();
sourceMapSupport.install();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const configPath = path.resolve(dirname, "./payload.config.ts");
console.log("configPath", configPath);
console.log("loading config...");
const config = await loadConfig(configPath);
console.log("loaded config!", config);

const payload = await getPayload({ config });

console.log("COLLECTIONS", payload.collections);

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
    build: vite
      ? () => vite.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
    //  getLoadContext(req, res) {
    //         return {
    //           payload: req.payload,
    //           user: req?.user,
    //           res,
    //         };
    //       },
  });

  // Start Payload CMS
  // invariant(process.env.PAYLOAD_SECRET, "PAYLOAD_SECRET is required");

  // await payload.init({
  //   secret: process.env.PAYLOAD_SECRET,
  //   express: app,
  //   onInit: () => {
  //     payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
  //   },
  // });

  // app.use(payload.authenticate);

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
