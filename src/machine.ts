import { nanoid } from "nanoid";
import type { ThemedToken } from "shiki";
import { assign, setup } from "xstate";
import * as Actions from "./actions";
import type * as Context from "./context";
import type * as Events from "./events";

export const editorMachine = setup({
  types: {
    input: {} as ThemedToken[][],
    context: {} as Context.Context,
    events: {} as Events.Events,
  },
  actions: {
    onSelectToggle: assign(({ context }, params: Events.SelectToggle) =>
      Actions.onSelectToggle(context, params)
    ),
    onAddEvent: assign(({ context }, params: Events.AddEvent) =>
      Actions.onAddEvent(context, params)
    ),
    onAddFrame: assign(({ context }) => Actions.onAddFrame(context)),
    onSelectFrame: assign((_, params: Events.SelectFrame) =>
      Actions.onSelectFrame(params)
    ),
  },
}).createMachine({
  id: "editor-machine",
  context: ({ input }) => {
    const selectedFrameId = nanoid();
    return {
      selectedFrameId,
      timeline: [{ id: selectedFrameId, events: [] }],
      state: input.map(
        (token): Context.TokenState => ({
          id: nanoid(),
          status: "visible",
          tokenList: token,
          isSelected: false,
        })
      ),
    };
  },
  initial: "Idle",
  states: {
    Idle: {
      on: {
        "select-toggle": {
          target: "Idle",
          actions: {
            type: "onSelectToggle",
            params: ({ event }) => event,
          },
        },
        "add-event": {
          target: "Idle",
          actions: {
            type: "onAddEvent",
            params: ({ event }) => event,
          },
        },
        "add-frame": {
          target: "Idle",
          actions: {
            type: "onAddFrame",
          },
        },
        "select-frame": {
          target: "Idle",
          actions: {
            type: "onSelectFrame",
            params: ({ event }) => event,
          },
        },
      },
    },
  },
});
