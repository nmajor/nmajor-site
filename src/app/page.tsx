import Image, { type ImageProps } from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { type Post, getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/format-date";
import { Icons } from "@/components/icons";
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
import { siteConfig } from "@/config/site";

function Post({ post }: { post: Post }) {
  return (
    <Card as="article">
      <Card.Title href={`/posts/${post.slug}`}>{post.title}</Card.Title>
      <Card.Eyebrow as="time" dateTime={post.date} decorate>
        {formatDate(post.date)}
      </Card.Eyebrow>
      <Card.Description>{post.description}</Card.Description>
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
            Welcome!
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Oh, forgive me, thou glitching piece of code,
            <br />
            That I am meek and gentle with these debuggers!
            <br />
            Thou art the bugs in the noblest software
            <br />
            That ever ran in the flow of bytes.
            <br />
            Woe to the hand that wrote this faulty script!
            <br />
            Over thy errors now do I prophesy—
            <br />
            Which, like silent functions, do throw their syntax errors
            <br />
            To beg for the logic and correction of my code—
            <br />
            A curse shall befall upon the lines of developers.
            <br />
            Domestic bugs and fierce syntax conflicts
            <br />
            Shall clutter all the functions of this program.
            <br />
            Errors and exceptions shall be so in use,
            <br />
            And dreadful bugs so familiar,
            <br />
            That programmers shall but chuckle when they behold
            <br />
            Their code dissected with the hands of debugging,
            <br />
            All mercy choked with the habit of faulty runs,
            <br />
            And the program's spirit, seeking for perfection,
            <br />
            With Stack Overflow by its side come hot from GitHub,
            <br />
            Shall in these repositories with a developer's voice
            <br />
            Cry "Havoc!" and let slip the dogs of code,
            <br />
            That this flawed script shall smell above the servers
            <br />
            With error logs, groaning for a fix.
            <br />
            <br />
            -- William GPTspeare, Julius Server (Act 3, Scene 1)
          </p>
          <div className="mt-6 flex gap-6">
            <SocialLink
              href={siteConfig.links.twitter}
              aria-label="Follow on Twitter"
              icon={Icons.twitter}
            />
            <SocialLink
              href={siteConfig.links.github}
              aria-label="Follow on GitHub"
              icon={Icons.github}
            />
            <SocialLink
              href={siteConfig.links.linkedin}
              aria-label="Follow on LinkedIn"
              icon={Icons.linkedin}
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
