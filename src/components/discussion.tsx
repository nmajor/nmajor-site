"use client";

import { env } from "@/env.mjs";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useMemo } from "react";

export function Discussion() {
  const { theme: themeSetting } = useTheme();

  const theme = useMemo(() => {
    if (themeSetting === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
      if (systemDark.matches) {
        return "dark";
      }
    }

    return themeSetting;
  }, [themeSetting]);

  return (
    <Giscus
      id="comments"
      repo={env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
      repoId={env.NEXT_PUBLIC_GISCUS_REPO_ID}
      category={env.NEXT_PUBLIC_GISCUS_CATEGORY}
      categoryId={env.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === "dark" ? "dark_tritanopia" : "noborder_light"}
      lang="en"
      loading="lazy"
    />
  );
}
