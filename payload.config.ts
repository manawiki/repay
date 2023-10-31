import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { viteBundler } from "@payloadcms/bundler-vite";
import { buildConfig } from "payload/config";
import path from "path";
import Users from "./cms/collections/Users";

export default buildConfig({
  serverURL: "http://localhost:3000",
  admin: {
    user: Users.slug,
    bundler: viteBundler(),
    vite: (incomingViteConfig) => ({
      ...incomingViteConfig,
      build: {
        ...incomingViteConfig.build,
        emptyOutDir: false,
      },
    }),
  },
  editor: lexicalEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI ?? false,
  }),
  collections: [Users],
  typescript: {
    outputFile: path.resolve(__dirname, "cms/payload-types.ts"),
  },
});
