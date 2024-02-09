import type { ThemedToken } from "shiki";

export interface TokenState {
  readonly id: string;
  readonly tokenList: ThemedToken[];
  readonly isSelected: boolean;
}

export interface TimelineState {
  readonly id: string;
  readonly events: {
    readonly id: string;
    readonly event: "visible" | "hidden";
  }[];
}

export interface Context {
  readonly state: readonly TokenState[];
  readonly timeline: readonly TimelineState[];
  readonly selectedFrameId: string;
}
