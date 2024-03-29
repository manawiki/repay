import {
  getAccessResults,
  getAuthenticatedUser,
  parseCookies,
} from "payload/auth";

export const auth = async ({ headers, payload }) => {
  const cookies = parseCookies(headers);

  //   console.log(cookies);

  const user = await getAuthenticatedUser({
    cookies,
    headers,
    payload,
  });

  const permissions = await getAccessResults({
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
