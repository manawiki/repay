# Title

Date: 2023-11-01

Status: accepted

## Context

Both Remix and PayloadCMS are adopting Vite as the JS ecosystem converge.

https://vitejs.dev/guide/why.html

It's anticipated that eventually Vite would be the default dev environment for both packages.

## Decision

We'll adopt Vite early to help shake out any growing pains.

## Consequences

The CJS build of Vite's Node API is deprecated. We'll continue to see CJS interop issues until PayloadCMS ships ESM releases.
