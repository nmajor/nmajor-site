import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_MAILCHIMP_ACTION_URL: z.string(),
    NEXT_PUBLIC_GISCUS_REPO: z.string(),
    NEXT_PUBLIC_GISCUS_REPO_ID: z.string(),
    NEXT_PUBLIC_GISCUS_CATEGORY: z.string(),
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_MAILCHIMP_ACTION_URL:
      process.env.NEXT_PUBLIC_MAILCHIMP_ACTION_URL,
    NEXT_PUBLIC_GISCUS_REPO: process.env.NEXT_PUBLIC_GISCUS_REPO,
    NEXT_PUBLIC_GISCUS_REPO_ID: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
    NEXT_PUBLIC_GISCUS_CATEGORY: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
