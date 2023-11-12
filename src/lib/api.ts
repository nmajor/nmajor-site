import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import getReadingTime from "reading-time";
import * as shiki from "shiki";
import { rehypeShiki } from "@/lib/rehype-shiki";

// memoize/cache the creation of the markdown parser, this sped up the
// building of the blog from ~60s->~10s
let p: ReturnType<typeof getParserPre> | undefined;

async function getParserPre() {
  return (
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      // .use(rehypeInferReadingTimeMeta)
      .use(remarkGfm)
      .use(rehypeShiki, {
        highlighter: await shiki.getHighlighter({ theme: "poimandres" }),
      })
      .use(rehypeStringify)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        content: (arg) => ({
          type: "element",
          tagName: "a",
          properties: {
            href: "#" + arg.properties?.id,
            style: "margin-right: 10px",
          },
          children: [{ type: "text", value: "#" }],
        }),
      })
  );
}

function getParser() {
  if (!p) {
    p = getParserPre().catch((e) => {
      p = undefined;
      throw e;
    });
  }
  return p;
}

export interface Post {
  title: string;
  date: string;
  tags: string[];
  slug: string;
  readTime: string;
  html: string;
}

export async function getPostBySlug(id: string) {
  const realSlug = id.replace(/\.md$/, "");
  const fullPath = join("src/_posts", `${realSlug}.md`);
  const { data, content } = matter(
    await fs.promises.readFile(fullPath, "utf8"),
  );

  const parser = await getParser();
  const html = await parser.process(content);
  const readTime = getReadingTime(content);

  return {
    title: data.title,
    slug: realSlug,
    tags: data.tags,
    date: `${data.date?.toISOString().slice(0, 10)}`,
    readTime: readTime.text,
    html: html.value.toString(),
  } as Post;
}

export async function getAllPosts() {
  const posts = await Promise.all(
    fs.readdirSync("src/_posts").map((id) => getPostBySlug(id)),
  );
  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}
