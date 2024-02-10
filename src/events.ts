import { Data } from "effect";

export interface SelectToggle {
  readonly type: "select-toggle";
  readonly id: string;
}

export type EventSend = Data.TaggedEnum<{
  Hidden: {};
  AddAfter: { readonly content: string };
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

export type Events = SelectToggle | AddEvent | AddFrame | SelectFrame;
