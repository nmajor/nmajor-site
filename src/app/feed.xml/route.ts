import { env } from "@/env.mjs";
import { getAllPosts } from "@/lib/api";
import assert from "assert";
import { Feed } from "feed";

export async function GET(req: Request) {
  const siteUrl = process.env.VERCEL_URL ?? "http://localhost:3000";

  if (!siteUrl && env.NODE_ENV !== "development") {
    throw Error("Missing VERCEL_URL environment variable");
  }

  const author = {
    name: "Nick Major",
  };

  const feed = new Feed({
    title: author.name,
    description: "Your blog description",
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  });

  const posts = await getAllPosts();

  for (const post of posts) {
    const publicUrl = `${siteUrl}/posts/${post.slug}`;
    const title = post.title;
    const date = post.date;
    const content = post.md;

    assert(typeof title === "string");
    assert(typeof date === "string");
    assert(typeof content === "string");

    feed.addItem({
      title,
      id: publicUrl,
      link: publicUrl,
      content,
      author: [author],
      contributor: [author],
      date: new Date(date),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      "content-type": "application/xml",
      "cache-control": "s-maxage=31556952",
    },
  });
}
