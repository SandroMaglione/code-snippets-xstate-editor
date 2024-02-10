import { Data, HashSet } from "effect";
import type { ThemedToken } from "shiki";

export interface TokenState {
  readonly id: string;
  readonly tokenList: ThemedToken[];
  readonly status: "hidden" | "visible";
}

export type EventMutation = Data.TaggedEnum<{
  Hidden: { readonly id: string };
  AddAfter: { readonly id: string; readonly newToken: TokenState };
}>;
export const EventMutation = Data.taggedEnum<EventMutation>();

export interface TimelineState {
  readonly id: string;
  readonly events: EventMutation[];
}

export interface Context {
  readonly content: string;
  readonly code: readonly TokenState[];
  readonly timeline: readonly TimelineState[];
  readonly selectedFrameId: string;
  readonly selectedLines: HashSet.HashSet<string>;
}
