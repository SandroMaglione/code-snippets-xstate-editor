import { HashSet, Match, Option, ReadonlyArray, pipe } from "effect";
import { nanoid } from "nanoid";
import * as Context from "./context";
import type * as Events from "./events";
import { highlighter } from "./highlighter";

export const onSelectToggle = (
  context: Context.Context,
  params: Events.SelectToggle
): Partial<Context.Context> => ({
  selectedLines: context.selectedLines.pipe(HashSet.has(params.id))
    ? context.selectedLines.pipe(HashSet.remove(params.id))
    : context.selectedLines.pipe(HashSet.add(params.id)),
});

export const onAddEvent = (
  context: Context.Context,
  params: Events.AddEvent
): Partial<Context.Context> => ({
  timeline: context.timeline.map((frame) =>
    frame.id !== params.frameId
      ? frame
      : {
          ...frame,
          events: [
            ...frame.events,
            ...Match.value(params.mutation).pipe(
              Match.tag("Hidden", () =>
                [...context.selectedLines].map((id) =>
                  Context.EventMutation.Hidden({ id })
                )
              ),
              Match.tag("AddAfter", () =>
                pipe(
                  [...context.selectedLines],
                  ReadonlyArray.last,
                  Option.flatMap((lineId) =>
                    pipe(
                      context.code,
                      ReadonlyArray.findFirstIndex((ts) => ts.id === lineId)
                    )
                  ),
                  Option.flatMap((lastIndex) =>
                    pipe(
                      context.code,
                      ReadonlyArray.get(lastIndex),
                      // TODO: "Filter" hidden lines
                      Option.map((ts) => ({ ...ts, index: lastIndex }))
                    )
                  ),
                  Option.map((tsWithIndex) => {
                    const addLines = context.content.split("\n");
                    return pipe(
                      context.code,
                      ReadonlyArray.flatMap((ts, i) =>
                        i === tsWithIndex.index
                          ? [ts.origin, ...addLines]
                          : [ts.origin]
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
                        Context.EventMutation.AddAfter({
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
                )
              ),
              Match.exhaustive
            ),
          ],
        }
  ),
});

export const onAddFrame = (
  context: Context.Context
): Partial<Context.Context> => ({
  timeline: [
    ...context.timeline,
    {
      id: nanoid(),
      events: [],
    },
  ],
});

export const onSelectFrame = (
  params: Events.SelectFrame
): Partial<Context.Context> => ({
  selectedFrameId: params.frameId,
});

export const onUpdateContent = (
  params: Events.UpdateContent
): Partial<Context.Context> => ({
  content: params.content,
});
