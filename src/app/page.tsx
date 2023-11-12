import Image, { type ImageProps } from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { type Post, getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/format-date";
import {
  GitHubIcon,
  Icons,
  LinkedInIcon,
  TwitterIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import bluehostLogo from "@/images/bluehost_logo.jpeg";
import pvLogo from "@/images/pv_logo.jpeg";
import lewagonLogo from "@/images/le_wagon_logo.jpeg";
import crowdengineLogo from "@/images/crowdengine_logo.jpeg";
import fluidLogo from "@/images/fluid_logo.jpeg";
import holomeetingLogo from "@/images/holomeetin_logo.jpeg";
import thrivelotLogo from "@/images/thrivelot_logo.jpeg";
import { Card } from "@/components/card";
import { Input } from "@/components/ui/input";

function Post({ post }: { post: Post }) {
  return (
    <Card as="article">
      <Card.Title href={`/posts/${post.slug}`}>{post.title}</Card.Title>
      <Card.Eyebrow as="time" dateTime={post.date} decorate>
        {formatDate(post.date)}
      </Card.Eyebrow>
      <Card.Cta>Read article</Card.Cta>
    </Card>
  );
}

function SocialLink({
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  );
}

function Newsletter() {
  // https://blog.afrieirham.com/how-to-integrate-mailchimp-with-react
  return (
    <form action="/thank-you" className="rounded-2xl border p-6">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <Icons.mail className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <Input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          required
        />
        <Button type="submit" className="ml-4 flex-none">
          Join
        </Button>
      </div>
    </form>
  );
}

interface Role {
  company: string;
  title: string;
  logo: ImageProps["src"];
  start: string | { label: string; dateTime: string };
  end: string | { label: string; dateTime: string };
}

function Role({ role }: { role: Role }) {
  const startLabel =
    typeof role.start === "string" ? role.start : role.start.label;
  const startDate =
    typeof role.start === "string" ? role.start : role.start.dateTime;

  const endLabel = typeof role.end === "string" ? role.end : role.end.label;
  const endDate = typeof role.end === "string" ? role.end : role.end.dateTime;

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        <Image src={role.logo} alt="" className="h-7 w-7" unoptimized />
      </div>
      <dl className="flex flex-auto flex-wrap gap-x-2">
        <dt className="sr-only">Company</dt>
        <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {role.company}
        </dd>
        <dt className="sr-only">Role</dt>
        <dd className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.title}
        </dd>
        <dt className="sr-only">Date</dt>
        <dd
          className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
          aria-label={`${startLabel} until ${endLabel}`}
        >
          <time dateTime={startDate}>{startLabel}</time>{" "}
          <span aria-hidden="true">—</span>{" "}
          <time dateTime={endDate}>{endLabel}</time>
        </dd>
      </dl>
    </li>
  );
}

function Resume() {
  const resume: Array<Role> = [
    {
      company: "Thrivelot",
      title: "Senior Full Stack Developer",
      logo: thrivelotLogo,
      start: "2021",
      end: "2023",

      // Present
      // end: {
      //   label: "Present",
      //   dateTime: new Date().getFullYear().toString(),
      // },
    },
    {
      company: "Prometheus Ventures",
      title: "CTO",
      logo: pvLogo,
      start: "2020",
      end: "2021",
    },
    {
      company: "Holomeeting",
      title: "Senior Full Stack Developer",
      logo: holomeetingLogo,
      start: "2018",
      end: "2020",
    },
    {
      company: "LeWagon",
      title: "Lead Teacher",
      logo: lewagonLogo,
      start: "2017",
      end: "2018",
    },
    {
      company: "Fluid Financial",
      title: "Full Stack Developer",
      logo: fluidLogo,
      start: "2016",
      end: "2017",
    },
    {
      company: "Crowdengine",
      title: "Full Stack Developer",
      logo: crowdengineLogo,
      start: "2013",
      end: "2015",
    },
    {
      company: "Bluehost",
      title: "Software Developer",
      logo: bluehostLogo,
      start: "2011",
      end: "2013",
    },
  ];

  return (
    <div className="rounded-2xl border p-6">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <Icons.briefcase className="h-6 w-6 flex-none" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {resume.map((role, roleIndex) => (
          <Role key={roleIndex} role={role} />
        ))}
      </ol>
      <Button className="group mt-6 w-full">
        Download CV
        <Icons.download className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
      </Button>
    </div>
  );
}

export default async function HomePage() {
  const posts = (await getAllPosts()).slice(0, 5);

  return (
    <>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Software designer, founder, and amateur astronaut.
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I’m Nick, a software developer based in Lisbon, Portugal. I code,
            and sometimes people pay me for it.
          </p>
          <div className="mt-6 flex gap-6">
            <SocialLink
              href="https://twitter.com/thenmajor"
              aria-label="Follow on Twitter"
              icon={TwitterIcon}
            />
            <SocialLink
              href="https://github.com/nmajor"
              aria-label="Follow on GitHub"
              icon={GitHubIcon}
            />
            <SocialLink
              href="https://linkedin.com/nmajor"
              aria-label="Follow on LinkedIn"
              icon={LinkedInIcon}
            />
          </div>
        </div>
      </Container>
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {posts.map((post) => (
              <Post key={post.slug} post={post} />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Newsletter />
            <Resume />
          </div>
        </div>
      </Container>
    </>
  );
}
