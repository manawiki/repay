# Welcome to RePay!

Simple template to get started with [Remix](https://remix.run) and [PayloadCMS](https://payloadcms.com), without the monorepo messiness!

![repay-header](https://github.com/manawiki/repay/assets/84349818/9fc343c2-0c6f-4d2d-a603-c838f8d21156)

## Development

Copy .env.example to .env and fill the required environment variables.

```sh
yarn;
yarn dev
```

## Deployment

First, build your app for production:

```sh
yarn build
```

Then run the app in production mode:

```sh
yarn start
```

This template comes with Github Action for continuous deployment to [Fly.io](https://fly.io/docs/speedrun/), but it can also be deployed to any host that accepts a docker image.

You can disable the the action by deleting `./github/workflows` and `fly.toml`, or in the Actions Workflows tab on Github.
