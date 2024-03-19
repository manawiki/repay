import { mongooseAdapter } from "@payloadcms/db-mongodb";
// import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload/config";
import path from "path";
import Users from "./cms/collections/Users";

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  // editor: lexicalEditor({}),
  editor: {
    validate: () => true,
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI ?? false,
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  collections: [Users],
  typescript: {
    outputFile: path.resolve(__dirname, "cms/payload-types.ts"),
  },
});
