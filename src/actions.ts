import { HashSet, Match, ReadonlyArray, pipe } from "effect";
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
                  ReadonlyArray.unsafeGet(
                    context.selectedLines.pipe(HashSet.size) - 1
                  ),
                  (id) =>
                    highlighter
                      .codeToTokens(context.content, {
                        theme: "one-dark-pro",
                        lang: "typescript",
                      })
                      .tokens.map((tokenList) =>
                        Context.EventMutation.AddAfter({
                          id,
                          newToken: {
                            id: nanoid(),
                            status: "visible",
                            tokenList,
                          },
                        })
                      )
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
