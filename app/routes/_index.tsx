import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

export const loader = async ({ context: { payload } }: LoaderFunctionArgs) => {
  const users = await payload.find({
    collection: "users",
  });

  return json({ userCount: users.totalDocs }, { status: 200 });
};

export default function Index() {
  const { userCount } = useLoaderData<typeof loader>();
  console.log(userCount);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to RePay</h1>
      <ul className="list-disc">
        <li>
          <a target="_blank" href="/admin" rel="noreferrer">
            Admin Interface
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://payloadcms.com/docs"
            rel="noreferrer"
          >
            Payload Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
