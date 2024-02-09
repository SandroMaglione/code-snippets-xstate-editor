import type { HashSet } from "effect";
import type { ThemedToken } from "shiki";

export interface TokenState {
  readonly id: string;
  readonly tokenList: ThemedToken[];
}

export interface TimelineState {
  readonly id: string;
  readonly code: TokenState[];
  readonly events: {
    readonly id: string;
    readonly event: "visible" | "hidden";
  }[];
}

export interface Context {
  readonly timeline: readonly TimelineState[];
  readonly selectedFrameId: string;
  readonly selectedLines: HashSet.HashSet<string>;
}
