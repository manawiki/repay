/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

import type { User } from 'payload/generated-types';
import type { Response } from 'express';
import type { Payload } from 'payload';

export interface RemixRequestContext {
    payload: Payload;
    user: User;
    res: Response;
}

declare module '@remix-run/node' {
    interface AppLoadContext extends RemixRequestContext {}
}