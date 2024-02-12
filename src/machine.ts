import { Effect } from "effect";
import { assign, fromPromise, setup } from "xstate";
import * as Actions from "./actions";
import * as Context from "./context";
import type * as Events from "./events";
import * as Input from "./input";

export const editorMachine = setup({
  types: {
    input: {} as Input.Input,
    context: {} as Context.Context,
    events: {} as Events.Events,
  },
  actors: {
    onInit: fromPromise<Context.Context, Input.Input>(({ input }) =>
      Input.init(input).pipe(Effect.runPromise)
    ),
    onAddEvent: fromPromise<
      Partial<Context.Context>,
      { params: Events.AddEvent; context: Context.Context }
    >(({ input: { context, params } }) =>
      Actions.onAddEvent(context, params).pipe(Effect.runPromise)
    ),
  },
  actions: {
    onSelectToggle: assign(({ context }, params: Events.SelectToggle) =>
      Actions.onSelectToggle(context, params)
    ),
    onUnselectAll: assign(({ context }) => Actions.onUnselectAll(context)),
    onAddFrame: assign(({ context }) => Actions.onAddFrame(context)),
    onSelectFrame: assign((_, params: Events.SelectFrame) =>
      Actions.onSelectFrame(params)
    ),
    onUpdateContent: assign((_, params: Events.UpdateContent) =>
      Actions.onUpdateContent(params)
    ),
  },
}).createMachine({
  id: "editor-machine",
  context: Context.Context,
  invoke: {
    input: ({ event }) => {
      if (event.type === "xstate.init") {
        return event.input;
      }

      throw new Error("Unexpected event type");
    },
    onDone: {
      target: ".Idle",
      actions: assign(({ event }) => event.output),
    },
    src: "onInit",
  },
  initial: "Idle",
  states: {
    AddingLines: {
      invoke: {
        src: "onAddEvent",
        input: ({ context, event }) => {
          if (event.type === "add-event") {
            return { context, params: event };
          }

          throw new Error("Unexpected event type");
        },
        onDone: {
          target: "Idle",
          actions: assign(({ event }) => event.output),
        },
      },
    },
    Idle: {
      on: {
        "select-toggle": {
          target: "Idle",
          actions: {
            type: "onSelectToggle",
            params: ({ event }) => event,
          },
        },
        "unselect-all": {
          target: "Idle",
          actions: {
            type: "onUnselectAll",
          },
        },
        "add-event": {
          target: "AddingLines",
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
        "update-content": {
          target: "Idle",
          actions: {
            type: "onUpdateContent",
            params: ({ event }) => event,
          },
        },
      },
    },
  },
});
