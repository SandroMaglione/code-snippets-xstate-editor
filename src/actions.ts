import { HashSet } from "effect";
import { nanoid } from "nanoid";
import type * as Context from "./context";
import type * as Events from "./events";

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
            // TODO
            // ...context.state
            //   .filter((ts) => ts.isSelected)
            //   .map((ts) => ({
            //     id: ts.id,
            //     event: params.status,
            //   })),
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
      code: context.timeline[context.timeline.length - 1].code, // TODO: Unsafe!
      events: [],
    },
  ],
});

export const onSelectFrame = (
  params: Events.SelectFrame
): Partial<Context.Context> => ({
  selectedFrameId: params.frameId,
});
