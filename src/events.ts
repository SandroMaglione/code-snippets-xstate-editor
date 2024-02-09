export interface SelectToggle {
  readonly type: "select-toggle";
  readonly id: string;
}

export interface AddEvent {
  readonly type: "add-event";
  readonly frameId: string;
  readonly status: "hidden" | "visible";
}

export interface AddFrame {
  readonly type: "add-frame";
}

export interface SelectFrame {
  readonly type: "select-frame";
  readonly frameId: string;
}

export type Events = SelectToggle | AddEvent | AddFrame | SelectFrame;
