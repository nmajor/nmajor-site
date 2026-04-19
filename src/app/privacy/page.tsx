import { type Metadata } from "next";

import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for nmajor.com",
};

export default function PrivacyPolicy() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: April 8, 2026
        </p>
        <div className="mt-8 space-y-8 text-base text-zinc-600 dark:text-zinc-400">
          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Introduction
            </h2>
            <p className="mt-3">
              This Privacy Policy applies to www.nmajor.com and any associated
              applications operated by Nick Major (&ldquo;I&rdquo;, &ldquo;me&rdquo;, &ldquo;my&rdquo;). This
              includes third-party integrations such as LinkedIn and Facebook
              developer applications that are used solely by me for personal use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Data Collection
            </h2>
            <p className="mt-3">
              The associated applications are self-hosted and used exclusively by
              me. No personal data is collected from third-party users, as there
              are no third-party users. Any data accessed through connected
              services (such as LinkedIn or Facebook APIs) is used solely for my
              own personal social media management purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Data Storage
            </h2>
            <p className="mt-3">
              Any data processed through the associated applications is stored on
              my own self-hosted infrastructure and is not shared with any third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Third-Party Services
            </h2>
            <p className="mt-3">
              The applications may connect to third-party APIs (such as LinkedIn
              and Facebook) for the purpose of managing my own social media
              accounts. No third-party user data is accessed, collected, or
              stored through these integrations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Data Sharing
            </h2>
            <p className="mt-3">
              I do not sell, trade, or share any data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Changes to This Policy
            </h2>
            <p className="mt-3">
              I may update this Privacy Policy from time to time. Any changes
              will be reflected on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
              Contact
            </h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy, you can reach
              me via{" "}
              <a
                href="https://www.linkedin.com/in/nmajor"
                className="text-teal-500 hover:underline"
              >
                LinkedIn
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
