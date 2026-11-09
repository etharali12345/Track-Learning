import appJson from "./app.json";

const posthogProjectToken = process.env.POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.POSTHOG_HOST;

export default {
  ...appJson.expo,
  owner: "ethar12345s-team",
  extra: {
    ...(appJson.expo as { extra?: Record<string, unknown> }).extra,
    posthogProjectToken,
    posthogHost,
    eas: {
      projectId: "fbda5038-e47f-45e9-9f2c-84c520b53fb0",
    },
  },
};
