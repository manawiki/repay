import path from "path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import payload from "payload";
import { createRequestHandler } from "@remix-run/express";
import invariant from "tiny-invariant";
import chokidar from "chokidar";
import { broadcastDevReady } from "@remix-run/node";

require("dotenv").config();

const BUILD_DIR = path.join(process.cwd(), "build");


async function start() {
  const app = express();

  invariant(process.env.PAYLOAD_SECRET, "PAYLOAD_SECRET is required");
  invariant(process.env.MONGODB_URI, "MONGODB_URI is required");

  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  app.use(payload.authenticate);

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  // Remix fingerprints its assets so we can cache forever.
  app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
  );

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("public", { maxAge: "1h" }));

  app.use(morgan("tiny"));

  app.all(
    "*",
    process.env.NODE_ENV === "development"
      ? (req, res, next) => {
          return createRequestHandler({
            build: require(BUILD_DIR),
            mode: process.env.NODE_ENV,
            getLoadContext(req, res) {
              return {
                // @ts-expect-error
                payload: req.payload,
                // @ts-expect-error
                user: req?.user,
                res,
              };
            },
          })(req, res, next);
        }
      : createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
          getLoadContext(req, res) {
            return {
              // @ts-expect-error
              payload: req.payload,
              // @ts-expect-error
              user: req?.user,
              res,
            };
          },
        })
  );
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
    
    if (process.env.NODE_ENV === 'development') {
      broadcastDevReady(require(BUILD_DIR))
   }
  });
}

start();

// during dev, we'll keep the build module up to date with the changes
if (process.env.NODE_ENV === 'development') {
	const watcher = chokidar.watch(BUILD_DIR, {
		ignored: ['**/**.map'],
	})
	watcher.on('all', () => {
		for (const key in require.cache) {
			if (key.startsWith(BUILD_DIR)) {
				delete require.cache[key]
			}
		}
		broadcastDevReady(require(BUILD_DIR))
	})
}