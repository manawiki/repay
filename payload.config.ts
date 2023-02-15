import { buildConfig } from "payload/config";
import path from "path";
import Users from "./cms/collections/Users";

export default buildConfig({
  serverURL: "http://localhost:3000",
  admin: {
    user: Users.slug,
  },
  collections: [Users],
  typescript: {
    outputFile: path.resolve(__dirname, "cms/payload-types.ts"),
  }
});
