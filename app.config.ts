import appJson from "./app.json";

const posthogProjectToken = process.env.POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.POSTHOG_HOST;

export default {
  ...appJson.expo,
  extra: {
    ...(appJson.expo as { extra?: Record<string, unknown> }).extra,
    posthogProjectToken,
    posthogHost,
  },
};
