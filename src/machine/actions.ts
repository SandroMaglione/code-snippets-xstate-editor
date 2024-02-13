import { Effect, HashSet, Layer, Match } from "effect";
import { nanoid } from "nanoid";
import * as Highlight from "../Highlight";
import * as Highlighter from "../Highlighter";
import * as Computed from "./computed";
import type * as Context from "./context";
import type * as Events from "./events";

export const onSelectToggle = (
  context: Context.Context,
  params: Events.SelectToggle
): Partial<Context.Context> => ({
  timeline: context.timeline.map((frame) =>
    frame.id !== context.selectedFrameId
      ? frame
      : {
          ...frame,
          selectedLines: frame.selectedLines.pipe(HashSet.has(params.id))
            ? frame.selectedLines.pipe(HashSet.remove(params.id))
            : frame.selectedLines.pipe(HashSet.add(params.id)),
        }
  ),
});

export const onUnselectAll = (
  context: Context.Context
): Partial<Context.Context> => ({
  timeline: context.timeline.map((frame) =>
    frame.id !== context.selectedFrameId
      ? frame
      : { ...frame, selectedLines: HashSet.empty() }
  ),
});

export const onAddEvent = (
  context: Context.Context,
  params: Events.AddEvent
): Promise<Partial<Context.Context>> =>
  Effect.gen(function* (_) {
    const highlight = yield* _(Highlight.Highlight);
    return {
      timeline: context.timeline.map((frame) =>
        frame.id !== params.frameId
          ? frame
          : {
              ...frame,
              events: [
                ...frame.events,
                ...Match.value(params.mutation).pipe(
                  Match.tag("Hidden", () =>
                    highlight.hideLines({
                      code: Computed.currentCode({ context }),
                      selectedLines: frame.selectedLines,
                    })
                  ),
                  Match.tag("AddAfter", () =>
                    highlight.addLines({
                      code: Computed.currentCode({ context }),
                      content: context.content,
                      selectedLines: frame.selectedLines,
                    })
                  ),
                  Match.tag("UpdateAt", () => [
                    highlight.updateLine({
                      code: Computed.currentCode({ context }),
                      content: context.content,
                      selectedLines: frame.selectedLines,
                    }),
                  ]),
                  Match.exhaustive
                ),
              ],
            }
      ),
    };
  }).pipe(
    Effect.provide(
      Highlight.HighlightLive.pipe(Layer.provide(Highlighter.HighlighterLive))
    ),
    Effect.runPromise
  );

export const onAddFrame = (
  context: Context.Context
): Partial<Context.Context> => ({
  timeline: [
    ...context.timeline,
    {
      id: nanoid(),
      events: [],
      selectedLines: HashSet.empty(),
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
