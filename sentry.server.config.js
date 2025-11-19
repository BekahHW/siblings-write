import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://20e7ac8481551e0afc2e1f9dc45f1f7f@o4510381825064960.ingest.us.sentry.io/4510381829849088",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});