import { posthog } from "@/config/posthog";

type LogAttributes = Record<string, string | number | boolean | undefined>;

export const posthogLogger = {
  info(message: string, attributes?: LogAttributes) {
    posthog?.logger.info(message, attributes);
  },
};
