import { Container } from "@/components/container";
import { Prose } from "@/components/prose";
import { type Post } from "@/lib/api";
import { formatDate } from "@/lib/format-date";

export function PostLayout({
  post,
  children,
}: {
  post: Pick<Post, "title" | "date" | "tags" | "readTime">;
  children: React.ReactNode;
}) {
  return (
    <Container className="post mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <article>
            <header className="flex flex-col">
              <h1 className="text-4xl font-bold font-bold tracking-tight sm:text-5xl">
                {post.title}
              </h1>
              <div className="flex gap-3 pt-1">
                <time
                  dateTime={post.date}
                  className="text-muted-foreground order-first flex items-center pr-2 text-base"
                >
                  <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                  <span className="ml-3">{formatDate(post.date)}</span>
                </time>
                {post.tags?.length > 0 && (
                  <span className="text-muted-foreground">-</span>
                )}
                {post.tags?.map((tag) => (
                  <span key={tag} className="text-muted-foreground/80">
                    {tag}
                  </span>
                ))}
              </div>
              {post.readTime && (
                <div className="text-accent-foreground pt-3 text-sm italic">
                  ~{post.readTime}
                </div>
              )}
            </header>
            <Prose className="mt-8" data-md-content>
              {children}
            </Prose>
          </article>
        </div>
      </div>
    </Container>
  );
}
