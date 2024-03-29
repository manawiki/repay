import {
  getAccessResults,
  getAuthenticatedUser,
  parseCookies,
} from "payload/auth";

export const auth = async ({ headers, payload }) => {
  const cookies = parseCookies(headers);

  const user = await getAuthenticatedUser({
    cookies,
    headers,
    payload,
  });

  const permissions = await getAccessResults({
    // @ts-ignore
    req: {
      context: {},
      headers,
      i18n: undefined,
      payload,
      payloadAPI: "REST",
      t: undefined,
      user,
    },
  });

  return {
    cookies,
    permissions,
    user,
  };
};
