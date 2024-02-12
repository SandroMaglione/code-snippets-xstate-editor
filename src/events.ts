import { Data } from "effect";

export interface UpdateContent {
  readonly type: "update-content";
  readonly content: string;
}

export interface SelectToggle {
  readonly type: "select-toggle";
  readonly id: string;
}

export type EventSend = Data.TaggedEnum<{
  Hidden: {};
  AddAfter: {};
}>;
export const EventSend = Data.taggedEnum<EventSend>();

export interface AddEvent {
  readonly type: "add-event";
  readonly frameId: string;
  readonly mutation: EventSend;
}

export interface AddFrame {
  readonly type: "add-frame";
}

export interface SelectFrame {
  readonly type: "select-frame";
  readonly frameId: string;
}

export interface UnselectAll {
  readonly type: "unselect-all";
}

export type Events =
  | SelectToggle
  | UnselectAll
  | AddEvent
  | AddFrame
  | SelectFrame
  | UpdateContent;
