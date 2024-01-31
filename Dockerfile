# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.17.0
FROM node:${NODE_VERSION}-alpine as base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ARG STATIC_URL
ENV STATIC_URL $STATIC_URL

ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.21
RUN npm install -g yarn@$YARN_VERSION --force


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apk update && \
    apk add build-base gyp pkgconfig python3

# Install node modules
COPY --link package.json yarn.lock /patches ./
RUN yarn install --frozen-lockfile --production=false

# Copy application code
COPY --link . .

# Build application
RUN yarn run build

# Remove development dependencies
RUN yarn install --production=true


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD ["yarn", "run", "start"]

