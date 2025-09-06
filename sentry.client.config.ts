import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a9f1abcf46066efdc4c151d93fbfaa01@o4509954761424896.ingest.us.sentry.io/4509954798190592",
  integrations: [
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "system",
    }),
  ],
});