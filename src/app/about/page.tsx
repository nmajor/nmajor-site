import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { Icons } from "@/components/icons";
import portraitImage from "@/images/avatar.jpg";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className={cn(className, "flex")}>
      <Link
        href={href}
        className="group flex items-center text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-5 w-5 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4 pt-0.5">{children}</span>
      </Link>
    </li>
  );
}

export const metadata: Metadata = {
  title: "About",
  description:
    "I’m Spencer Sharp. I live in New York City, where I design the future.",
};

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            I’m Nick Major.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I grew up in Utah. In 2015, I quit my job, sold all my things,
              bought 2 backpacks and a 1 way ticket to Thailand. I was a Digital
              Nomad for 4 years, and lived in placed like Thailand, Vietnam,
              Brazil, Germany and Mexico.
            </p>
            <p>
              During that time I made a friend in Lisbon and decided to teach at
              her new coding bootcamp. I fell in love with Lisbon, and so when I
              became tired of the nomad life, I decided to settle down here.
            </p>
            <p>
              I like traveling, writing code, and learning new things. I’m
              currently learning Portuguese, and I’m working on a few side
              projects. I game occasionally and periodically get obsessed with
              Rimworld.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink href={siteConfig.links.twitter} icon={Icons.twitter}>
              Follow on Twitter
            </SocialLink>
            <SocialLink
              href={siteConfig.links.github}
              icon={Icons.github}
              className="mt-4"
            >
              Follow on GitHub
            </SocialLink>
            <SocialLink
              href={siteConfig.links.linkedin}
              icon={Icons.linkedin}
              className="mt-4"
            >
              Follow on LinkedIn
            </SocialLink>
            {/* <SocialLink
              href="mailto:spencer@planetaria.tech"
              icon={MailIcon}
              className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
            >
              spencer@planetaria.tech
            </SocialLink> */}
          </ul>
        </div>
      </div>
    </Container>
  );
}
