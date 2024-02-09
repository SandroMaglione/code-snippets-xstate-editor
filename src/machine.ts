import { nanoid } from "nanoid";
import type { ThemedToken } from "shiki";
import { assign, setup } from "xstate";
import type * as Events from "./events";

interface TokenState {
  readonly id: string;
  readonly status: "visible" | "hidden";
  readonly tokenList: ThemedToken[];
  readonly isSelected: boolean;
}

interface TimelineState {
  readonly id: string;
  readonly events: {
    readonly id: string;
    readonly event: "visible" | "hidden";
  }[];
}

export const editorMachine = setup({
  types: {
    input: {} as ThemedToken[][],
    context: {} as {
      state: readonly TokenState[];
      timeline: readonly TimelineState[];
    },
    events: {} as Events.Events,
  },
  actions: {
    onSelectToggle: assign(({ context }, params: Events.SelectToggle) => ({
      state: context.state.map((st) =>
        st.id !== params.id
          ? st
          : {
              ...st,
              isSelected: !st.isSelected,
            }
      ),
    })),
    onAddEvent: assign(({ context }, params: Events.AddEvent) => ({
      timeline: context.timeline.map((frame) =>
        frame.id !== params.timelineId
          ? frame
          : {
              ...frame,
              events: [
                ...frame.events,
                ...context.state
                  .filter((ts) => ts.isSelected)
                  .map((ts) => ({
                    id: ts.id,
                    event: params.status,
                  })),
              ],
            }
      ),
    })),
  },
}).createMachine({
  id: "editor-machine",
  context: ({ input }) => ({
    timeline: [
      {
        id: nanoid(),
        events: [],
      },
    ],
    state: input.map(
      (token): TokenState => ({
        id: nanoid(),
        status: "visible",
        tokenList: token,
        isSelected: false,
      })
    ),
  }),
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
      },
    },
  },
});
