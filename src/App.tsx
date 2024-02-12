import { useMachine } from "@xstate/react";
import { HashSet, Match, Option, ReadonlyArray, pipe } from "effect";
import { AnimatePresence, motion } from "framer-motion";
import { codeToTokens } from "shiki";
import * as Events from "./events";
import { editorMachine } from "./machine";

const code = `return signUpRequest.pipe(
  Effect.provideService(Request.Request, req),
  Effect.tapError((error) =>
    Effect.logError("Newsletter error")
  ),
  Effect.mapError(
    flow(
      Match.value,
      Match.tags({
        RequestJsonError: () =>
          "Something wrong in the request, please try again 🙏🏼",
        MissingEmailError: () =>
          "No email received it seems, mind trying again? 🙏🏼",
        ParseError: () => "The regex told me that this email is not valid 🤷🏼‍♂️",
        NewsletterSignUpResponseError: () =>
          "Erm, there was an error while adding your email to the list, please try again 🙏🏼",
        NewsletterSignUpUnexpectedError: () =>
          "Erm, there was an error while adding your email to the list, please try again 🙏🏼",
      }),
      Match.orElse(() => "Unknown error (a bug 🐞), please try again 🙏🏼")
    )
  ),
  Effect.map(() => new Response(JSON.stringify(true), { status: 200 })),
  Effect.catchAll((error) =>
    Effect.succeed(new Response(JSON.stringify({ error }), { status: 500 }))
  ),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.runPromise
);`;

const { bg, themeName, fg } = await codeToTokens(code, {
  lang: "typescript",
  theme: "one-dark-pro",
});

export default function App() {
  const [snapshot, send] = useMachine(editorMachine, {
    input: { source: code },
  });

  const timelineSelected = pipe(
    snapshot.context.timeline,
    ReadonlyArray.findFirst((tm) => tm.id === snapshot.context.selectedFrameId)
  );

  const timelineHistory = pipe(
    snapshot.context.timeline,
    ReadonlyArray.takeWhile((tm) => tm.id !== snapshot.context.selectedFrameId)
  );

  console.log({ timelineHistory });

  const currentCode = pipe(
    timelineHistory,
    ReadonlyArray.reduce(snapshot.context.code, (code, tm) =>
      pipe(
        tm.events,
        ReadonlyArray.reduce(code, (ts, event) =>
          Match.value(event).pipe(
            Match.tag("Hidden", (e) =>
              ts.map((token) =>
                token.id !== e.id
                  ? token
                  : { ...token, status: "hidden" as const }
              )
            ),
            Match.tag("AddAfter", (e) =>
              ts.flatMap((token) =>
                token.id !== e.id ? [token] : [token, e.newToken]
              )
            ),
            Match.exhaustive
          )
        )
      )
    )
  );

  return (
    <div>
      <pre
        className={`shiki ${themeName}`}
        tabIndex={0}
        style={{
          backgroundColor: bg,
          color: fg,
        }}
      >
        <code>
          {currentCode.map((token) => {
            return (
              <AnimatePresence key={token.id}>
                {token.status !== "hidden" && (
                  <motion.span
                    id={token.id}
                    key={token.id}
                    className="line"
                    style={{ display: "block" }}
                    animate={{
                      opacity: 1,
                      x: 0,
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
                    initial={{ opacity: 0, x: 20 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() =>
                      send({ type: "select-toggle", id: token.id })
                    }
                  >
                    {token.tokenList.map((themed, idx) => (
                      <span key={idx} style={{ color: themed.color }}>
                        {themed.content}
                      </span>
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            );
          })}
        </code>
      </pre>

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
                Visible
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
