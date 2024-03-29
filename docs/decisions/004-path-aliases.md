# Title

Date: 2023-11-01

Status: accepted

## Context

Typescript 5.4 ships subpath aliasing "#" from package.json. Using "#app/" in lieu of "~" will help with sharing react components between Remix and Payload.

- [Annoucing Typescript 5.4: Auto-Import Support for Subpath Imports](https://devblogs.microsoft.com/typescript/announcing-typescript-5-4/#auto-import-support-for-subpath-imports)
- [Epic-Stack Decision Doc: Imports](https://github.com/epicweb-dev/epic-stack/blob/main/docs/decisions/031-imports.md)

## Decision

Replace "~/" with "#app/" in all imports.

## Consequences

Requires updating all imports; unfamiliar syntax for Remix devs.
