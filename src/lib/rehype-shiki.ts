/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type unifiedTypes from "unified";
import { unified } from "unified";
import { modifyChildren as unistUtilModifyChildren } from "unist-util-modify-children";
import { toText as hastUtilToText } from "hast-util-to-text";
import type * as Shiki from "shiki";
import rehypeParse from "rehype-parse";
import html from "@leafac/html";

export const rehypeShiki: unifiedTypes.Plugin<
  [
    {
      highlighter: Shiki.Highlighter | Record<string, Shiki.Highlighter>;
      throwOnUnsupportedLanguage?: boolean;
    },
  ]
> =
  ({ highlighter, throwOnUnsupportedLanguage = false }) =>
  (tree: any) => {
    unistUtilModifyChildren((node: any, index, parent) => {
      if (
        node.tagName === "pre" &&
        Array.isArray(node.children) &&
        node.children.length === 1 &&
        node.children[0].tagName === "code" &&
        typeof node.children[0].properties === "object" &&
        node.children[0].properties !== null &&
        Array.isArray(node.children[0].properties.className) &&
        typeof node.children[0].properties.className[0] === "string" &&
        node.children[0].properties.className[0].startsWith("language-")
      ) {
        const code = hastUtilToText(node).slice(0, -1);
        const language = node.children[0].properties.className[0].slice(
          "language-".length,
        );
        let output: string;
        try {
          if (typeof highlighter.codeToHtml === "function")
            output = highlighter.codeToHtml(code, language);
          else
            output = html`
              <div class="rehype-shiki">
                $${Object.entries(highlighter).map(
                  ([name, highlighter]: [string, Shiki.Highlighter]) => html`
                    <div class="${name}">
                      $${highlighter.codeToHtml(code, language)}
                    </div>
                  `,
                )}
              </div>
            `;
        } catch (error) {
          if (throwOnUnsupportedLanguage) throw error;
          else return;
        }
        const parsedOutput: any = hastParser.parse(output);
        parsedOutput.children.find(
          (child: any) => child.type === "element",
        )!.position = node.position;
        parent.children.splice(index, 1, ...parsedOutput.children);
        return index + parsedOutput.children.length;
      }
    })(tree);
  };

const hastParser = unified().use(rehypeParse, { fragment: true });
