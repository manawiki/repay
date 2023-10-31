import * as path from "node:path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler, type RequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import payload from "payload";
import invariant from "tiny-invariant";
import sourceMapSupport from "source-map-support";

// patch in Remix runtime globals
installGlobals();
require("dotenv").config();
sourceMapSupport.install();

/**
 * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
 */
const BUILD_PATH = path.resolve("./build/index.js");
const WATCH_PATH = path.resolve("./build/version.txt");

/**
 * Initial build
 * @type {ServerBuild}
 */
let build = require(BUILD_PATH);

// We'll make chokidar a dev dependency so it doesn't get bundled in production.
const chokidar =
  process.env.NODE_ENV === "development" ? require("chokidar") : null;

async function start() {
  const app = express();

  invariant(process.env.PAYLOAD_SECRET, "PAYLOAD_SECRET is required");

  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
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

  // Check if the server is running in development mode and reflect realtime changes in the codebase.
  // We'll also inject payload in the remix handler so we can use it in our routes.
  app.all(
    "*",
    process.env.NODE_ENV === "development"
      ? createDevRequestHandler()
      : createRequestHandler({
          build,
          mode: process.env.NODE_ENV,
          getLoadContext(req, res) {
            return {
              payload: req.payload,
              user: req?.user,
              res,
            };
          },
        })
  );
  const port = process.env.PORT || 3000;

  app.listen(port, async () => {
    console.log(`Express server listening on port ${port}`);

    if (process.env.NODE_ENV === "development") {
      await broadcastDevReady(build);
    }
  });
}

start();

// Create a request handler that watches for changes to the server build during development.
function createDevRequestHandler(): RequestHandler {
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();

    // Add debugger to assist in v2 dev debugging
    if (build?.assets === undefined) {
      console.log(build.assets);
      debugger;
    }

    // 2. tell dev server that this app server is now up-to-date and ready
    await broadcastDevReady(build);
  }

  chokidar
    ?.watch(WATCH_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
        getLoadContext(req, res) {
          return {
            payload: req.payload,
            user: req?.user,
            res,
          };
        },
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// CJS require cache busting
/**
 * @type {() => Promise<ServerBuild>}
 */
async function reimportServer() {
  // 1. manually remove the server build from the require cache
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key];
    }
  });

  // 2. re-import the server build
  return require(BUILD_PATH);
}
