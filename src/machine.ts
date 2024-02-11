import { HashSet } from "effect";
import { nanoid } from "nanoid";
import { assign, setup } from "xstate";
import * as Actions from "./actions";
import type * as Context from "./context";
import type * as Events from "./events";
import { highlighter } from "./highlighter";

export const editorMachine = setup({
  types: {
    input: {} as { readonly source: string },
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
    onUpdateContent: assign((_, params: Events.UpdateContent) =>
      Actions.onUpdateContent(params)
    ),
  },
}).createMachine({
  id: "editor-machine",
  context: ({ input }) => {
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
        },
      ],
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
