import { Data, HashSet } from "effect";
import type { ThemedToken } from "shiki";

export interface TokenState {
  readonly id: string;
  readonly tokenList: ThemedToken[];
  readonly status: "hidden" | "visible" | "added" | "updated";
  readonly origin: string;
}

export type EventMutation = Data.TaggedEnum<{
  Hidden: { readonly id: string; readonly token: TokenState };
  AddAfter: { readonly id: string; readonly newToken: TokenState };
  UpdateAt: { readonly id: string; readonly newToken: TokenState };
}>;
export const EventMutation = Data.taggedEnum<EventMutation>();

export interface TimelineState {
  readonly id: string;
  readonly selectedLines: HashSet.HashSet<string>;
  readonly events: EventMutation[];
}

export interface Context {
  readonly content: string;
  readonly code: readonly TokenState[];
  readonly timeline: readonly TimelineState[];
  readonly selectedFrameId: string;
  readonly bg: string | undefined;
  readonly themeName: string | undefined;
  readonly fg: string | undefined;
}

export const Context: Context = {
  code: [],
  content: "",
  selectedFrameId: "",
  timeline: [],
  bg: undefined,
  fg: undefined,
  themeName: undefined,
};
