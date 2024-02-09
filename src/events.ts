export interface SelectToggle {
  readonly type: "select-toggle";
  readonly id: string;
}

export interface AddEvent {
  readonly type: "add-event";
  readonly timelineId: string;
  readonly status: "hidden" | "visible";
}

export type Events = SelectToggle | AddEvent;
