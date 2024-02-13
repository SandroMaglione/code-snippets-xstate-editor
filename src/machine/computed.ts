import { Match, ReadonlyArray, pipe } from "effect";
import type * as Context from "./context";

export const currentCode = ({ context }: { context: Context.Context }) =>
  pipe(
    context.timeline,
    ReadonlyArray.takeWhile((tm) => tm.id !== context.selectedFrameId),
    ReadonlyArray.reduce(context.code, (code, tm) =>
      pipe(
        tm.events,
        ReadonlyArray.reduce(code, (ts, event) =>
          Match.value(event).pipe(
            Match.tag("Hidden", (e) =>
              ts.map((token) => (token.id !== e.token.id ? token : e.token))
            ),
            Match.tag("AddAfter", (e) =>
              ts.flatMap((token) =>
                token.id !== e.id ? [token] : [token, e.newToken]
              )
            ),
            Match.tag("UpdateAt", (e) =>
              ts.flatMap((token) =>
                token.id !== e.id ? [token] : [e.newToken]
              )
            ),
            Match.exhaustive
          )
        )
      )
    )
  );

export const timelineSelected = ({ context }: { context: Context.Context }) =>
  pipe(
    context.timeline,
    ReadonlyArray.findFirst((tm) => tm.id === context.selectedFrameId)
  );
