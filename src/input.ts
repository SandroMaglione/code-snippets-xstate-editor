import { Effect, HashSet } from "effect";
import { nanoid } from "nanoid";
import * as Highlighter from "./Highlighter";
import * as Context from "./context";

export interface Input {
  readonly source: string;
}

export const init = (input: Input): Effect.Effect<Context.Context> =>
  Effect.gen(function* (_) {
    const highlighter = yield* _(Highlighter.Highlighter);

    const selectedFrameId = nanoid();
    return {
      content: "",
      selectedFrameId,
      selectedLines: HashSet.empty(),
      code: highlighter
        .codeToTokens(input.source, {
          theme: "one-dark-pro",
          lang: "typescript",
        })
        .tokens.map(
          (token): Context.TokenState => ({
            id: nanoid(),
            tokenList: token,
            status: "visible",
            origin: token.map((tt) => tt.content).join(""),
          })
        ),
      timeline: [
        {
          id: selectedFrameId,
          events: [],
          selectedLines: HashSet.empty(),
        },
      ],
    };
  }).pipe(Effect.provide(Highlighter.HighlighterLive));
