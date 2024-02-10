import { getHighlighter } from "shiki";

export const highlighter = await getHighlighter({
  themes: ["one-dark-pro"],
  langs: ["typescript"],
});
