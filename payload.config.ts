import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload/config";
import path from "path";
import Users from "./cms/collections/Users";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI ?? false,
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  collections: [Users],
  typescript: {
    outputFile: path.resolve(dirname, "cms/payload-types.ts"),
  },
});
