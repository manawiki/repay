"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var express_1 = __importDefault(require("express"));
var compression_1 = __importDefault(require("compression"));
var morgan_1 = __importDefault(require("morgan"));
var payload_1 = __importDefault(require("payload"));
var express_2 = require("@remix-run/express");
require("dotenv").config();
var BUILD_DIR = path_1.default.join(process.cwd(), "build");
start();
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var app, port;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, express_1.default)();
                    // Initialize Payload
                    return [4 /*yield*/, payload_1.default.init({
                            // @ts-expect-error
                            secret: process.env.PAYLOAD_SECRET,
                            // @ts-expect-error
                            mongoURL: process.env.MONGODB_URI,
                            express: app,
                            onInit: function () {
                                payload_1.default.logger.info("Payload Admin URL: ".concat(payload_1.default.getAdminURL()));
                            },
                        })];
                case 1:
                    // Initialize Payload
                    _a.sent();
                    app.use((0, compression_1.default)());
                    // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
                    app.disable("x-powered-by");
                    // Remix fingerprints its assets so we can cache forever.
                    app.use("/build", express_1.default.static("public/build", { immutable: true, maxAge: "1y" }));
                    // Everything else (like favicon.ico) is cached for an hour. You may want to be
                    // more aggressive with this caching.
                    app.use(express_1.default.static("public", { maxAge: "1h" }));
                    app.use((0, morgan_1.default)("tiny"));
                    app.all("*", process.env.NODE_ENV === "development"
                        ? function (req, res, next) {
                            purgeRequireCache();
                            return (0, express_2.createRequestHandler)({
                                build: require(BUILD_DIR),
                                mode: process.env.NODE_ENV,
                            })(req, res, next);
                        }
                        : (0, express_2.createRequestHandler)({
                            build: require(BUILD_DIR),
                            mode: process.env.NODE_ENV,
                        }));
                    port = process.env.PORT || 3000;
                    app.listen(port, function () {
                        console.log("Express server listening on port ".concat(port));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function purgeRequireCache() {
    // purge require cache on requests for "server side HMR" this won't let
    // you have in-memory objects between requests in development,
    // alternatively you can set up nodemon/pm2-dev to restart the server on
    // file changes, but then you'll have to reconnect to databases/etc on each
    // change. We prefer the DX of this, so we've included it for you by default
    for (var key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
        }
    }
}
