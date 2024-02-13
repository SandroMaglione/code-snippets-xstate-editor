import { useMachine } from "@xstate/react";
import { HashSet, Option, pipe } from "effect";
import { AnimatePresence, motion } from "framer-motion";
import * as Computed from "./machine/computed";
import * as Events from "./machine/events";
import { editorMachine } from "./machine/machine";

const code = `import { Context, Effect } from "effect"

`;

export default function App() {
  const [snapshot, send] = useMachine(editorMachine, {
    input: { source: code },
  });

  const timelineSelected = Computed.timelineSelected({
    context: snapshot.context,
  });

  const currentCode = Computed.currentCode({
    context: snapshot.context,
  });

  return (
    <div>
      <pre
        className={`shiki ${snapshot.context.themeName}`}
        tabIndex={0}
        style={{
          backgroundColor: snapshot.context.bg,
          color: snapshot.context.fg,
        }}
      >
        <code>
          {currentCode.map((token) => (
            <AnimatePresence
              key={token.id}
              mode={token.status === "updated" ? "popLayout" : "sync"}
            >
              {token.status !== "hidden" && (
                <span style={{ display: "flex", columnGap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() =>
                      send({ type: "select-toggle", id: token.id })
                    }
                    style={{
                      width: 120,
                      backgroundColor: pipe(
                        timelineSelected,
                        Option.map((tm) =>
                          tm.selectedLines.pipe(HashSet.has(token.id))
                        ),
                        Option.getOrElse(() => false)
                      )
                        ? "#fff"
                        : undefined,
                    }}
                  >
                    {token.status}
                  </button>
                  <motion.span
                    id={token.id}
                    key={token.id}
                    className="line"
                    style={{ display: "block" }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {token.tokenList.map((themed, idx) => (
                      <span key={idx} style={{ color: themed.color }}>
                        {themed.content}
                      </span>
                    ))}
                  </motion.span>
                </span>
              )}
            </AnimatePresence>
          ))}
        </code>
      </pre>

      <button type="button" onClick={() => send({ type: "unselect-all" })}>
        Unselect all
      </button>

      <section style={{ display: "flex", columnGap: "2rem" }}>
        {snapshot.context.timeline.map((frame) => (
          <div key={frame.id}>
            {snapshot.context.selectedFrameId === frame.id && (
              <span>Selected</span>
            )}

            <div>
              <button
                type="button"
                onClick={() =>
                  send({ type: "select-frame", frameId: frame.id })
                }
              >
                Select
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() =>
                  send({
                    type: "add-event",
                    mutation: Events.EventSend.AddAfter(),
                    frameId: frame.id,
                  })
                }
              >
                Add after
              </button>
              <button
                type="button"
                onClick={() =>
                  send({
                    type: "add-event",
                    mutation: Events.EventSend.Hidden(),
                    frameId: frame.id,
                  })
                }
              >
                Hidden
              </button>
              <button
                type="button"
                onClick={() =>
                  send({
                    type: "add-event",
                    mutation: Events.EventSend.UpdateAt(),
                    frameId: frame.id,
                  })
                }
              >
                Update at
              </button>
            </div>

            <div>
              {frame.events.map((event) => (
                <p key={event.id}>{event._tag}</p>
              ))}
            </div>
          </div>
        ))}

        <div>
          <button type="button" onClick={() => send({ type: "add-frame" })}>
            Add
          </button>
        </div>
      </section>

      <section>
        <textarea
          name="content"
          id="content"
          rows={2}
          value={snapshot.context.content}
          onChange={(e) =>
            send({ type: "update-content", content: e.target.value })
          }
        />
      </section>
    </div>
  );
}
