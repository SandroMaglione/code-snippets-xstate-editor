import {
  Context,
  Effect,
  Layer,
  Option,
  ReadonlyArray,
  pipe,
  type HashSet,
} from "effect";
import { nanoid } from "nanoid";
import * as Highlighter from "./Highlighter";
import * as ContextState from "./context";

export class Highlight extends Context.Tag("Highlight")<
  Highlight,
  {
    addLines: (params: {
      readonly selectedLines: HashSet.HashSet<string>;
      readonly code: readonly ContextState.TokenState[];
      readonly content: string;
    }) => Extract<ContextState.EventMutation, { _tag: "AddAfter" }>[];
  }
>() {}

export const HighlightLive = Layer.effect(
  Highlight,
  Effect.map(Highlighter.Highlighter, (highlighter) =>
    Highlight.of({
      addLines: ({ selectedLines, code, content }) =>
        pipe(
          [...selectedLines],
          ReadonlyArray.last,
          Option.flatMap((lineId) =>
            pipe(
              code,
              ReadonlyArray.findFirstIndex((ts) => ts.id === lineId)
            )
          ),
          Option.flatMap((lastIndex) =>
            pipe(
              code,
              ReadonlyArray.get(lastIndex),
              Option.map((ts) => ({ ...ts, index: lastIndex }))
            )
          ),
          Option.map((tsWithIndex) => {
            const addLines = content.split("\n");
            return pipe(
              code,
              ReadonlyArray.flatMap((ts, i) =>
                i === tsWithIndex.index ? [ts.origin, ...addLines] : [ts.origin]
              ),
              ReadonlyArray.join("\n"),
              (code) =>
                highlighter.codeToTokens(code, {
                  theme: "one-dark-pro",
                  lang: "typescript",
                }).tokens,
              (list) =>
                list.slice(
                  tsWithIndex.index,
                  tsWithIndex.index + addLines.length
                ),
              ReadonlyArray.map((tokenList, i) =>
                ContextState.EventMutation.AddAfter({
                  id: tsWithIndex.id,
                  newToken: {
                    id: nanoid(),
                    origin: addLines[i],
                    status: "visible",
                    tokenList,
                  },
                })
              )
            );
          }),
          Option.getOrElse(() => [])
        ),
    })
  )
);
