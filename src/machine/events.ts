import { Data } from "effect";
import * as Input from "./input";

/** https://stately.ai/docs/input#initial-event-input */
export interface AutoInit {
  readonly type: "xstate.init";
  readonly input: Input.Input;
}

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
  UpdateAt: {};
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
  | AutoInit
  | SelectToggle
  | UnselectAll
  | AddEvent
  | AddFrame
  | SelectFrame
  | UpdateContent;
