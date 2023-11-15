"use client";

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
      repo="nmajor/nmajor-site"
      repoId="R_kgDOKsWxnA"
      category="Announcements"
      categoryId="DIC_kwDOKsWxnM4Ca-Bz"
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
