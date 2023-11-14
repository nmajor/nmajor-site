/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { env } from "@/env.mjs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Icons } from "./icons";

import { useFormFields, useMailChimpForm } from "use-mailchimp-form";

export function Newsletter() {
  const { loading, error, success, message, handleSubmit } = useMailChimpForm(
    env.NEXT_PUBLIC_MAILCHIMP_ACTION_URL,
  );

  const { fields, handleFieldChange } = useFormFields({
    EMAIL: "",
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(fields);
      }}
      className="rounded-2xl border p-6"
    >
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <Icons.mail className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <Input
          placeholder="hisdudeness@lebowski.com"
          aria-label="Email address"
          required
          id="EMAIL"
          autoFocus
          type="email"
          value={fields.EMAIL}
          onChange={handleFieldChange}
        />
        <Button type="submit" className="ml-4 flex-none">
          {loading ? (
            <Icons.spinner className="h-5 w-5 animate-spin" />
          ) : (
            "Join"
          )}
        </Button>
      </div>
      {message && <div className="pt-4 text-sm">{message}</div>}
    </form>
  );
}
