# Title

Date: 2023-11-01

Status: accepted

## Context

NextJS is hardcoded to use the project `app` directory if it exists. This is a problem because Remix also uses the `app` directory for routes as well, by default.

https://nextjs.org/docs/app/building-your-application/configuring/src-directory

Luckily, we can change the Remix default routes directory to another with the appDirectory prop.

## Decision

We'll set the `appDirectory` prop to `remix-app` in the `remix.config.js` file.

## Consequences

Update from older RePay template need to move the `app` directory to `remix-app` and update their Remix Config in remix.config.js or vite.config.js file.
