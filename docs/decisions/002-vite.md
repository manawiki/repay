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

Breaking changes. Until PayloadCMS have ESM releases, we'll continue to have CJS interop issues in Vite.
