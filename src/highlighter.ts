import { Context, Effect, Layer } from "effect";
import { getHighlighter } from "shiki";

export interface Highlighter {
  readonly _: unique symbol;
}

export const Highlighter = Context.GenericTag<
  Highlighter,
  Awaited<ReturnType<typeof getHighlighter>>
>("@app/Highlighter");

export const HighlighterLive = Layer.effect(
  Highlighter,
  Effect.promise(() =>
    getHighlighter({
      themes: ["one-dark-pro"],
      langs: ["typescript"],
    })
  )
);
