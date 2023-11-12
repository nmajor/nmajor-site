import { PostLayout } from "@/components/post-layout";
import { getPostBySlug, getAllPosts } from "@/lib/api";

// Generate the post, note that this is a "react server component"! it is
// allowed to be async
export default async function Post({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const { html, ...post } = await getPostBySlug(slug);

  return (
    <PostLayout post={post}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </PostLayout>
  );
}

// This function can statically allow nextjs to find all the posts that you
// have made, and statically generate them
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Set the title of the page to be the post title, note that we no longer use
// e.g. next/head in app dir, and this can be async just like the server
// component
export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const { title } = await getPostBySlug(slug);
  return {
    title,
  };
}
