import { useMachine } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { codeToTokens } from "shiki";
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
// const html = await codeToHtml(code, {
//   lang: "typescript",
//   theme: "one-dark-pro",
// });

const { tokens, bg, themeName, fg } = await codeToTokens(code, {
  lang: "typescript",
  theme: "one-dark-pro",
});

export default function App() {
  const [snapshot, send] = useMachine(editorMachine, {
    input: tokens,
  });

  return (
    <div>
      {/* <main dangerouslySetInnerHTML={{ __html: html }} /> */}

      <pre
        className={`shiki ${themeName}`}
        tabIndex={0}
        style={{
          backgroundColor: bg,
          color: fg,
        }}
      >
        <code>
          {snapshot.context.state.map((token) => (
            <AnimatePresence key={token.id}>
              {token.status !== "hidden" && (
                <motion.span
                  id={token.id}
                  className="line"
                  style={{ display: "block" }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    backgroundColor: token.isSelected ? "#fff" : undefined,
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => send({ type: "select-toggle", id: token.id })}
                >
                  {token.tokenList.map((themed, idx) => (
                    <span key={idx} style={{ color: themed.color }}>
                      {themed.content}
                    </span>
                  ))}
                </motion.span>
              )}
            </AnimatePresence>
          ))}
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
                    status: "visible",
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
                    status: "hidden",
                    frameId: frame.id,
                  })
                }
              >
                Hidden
              </button>
            </div>

            <div>
              {frame.events.map((event) => (
                <p key={event.id}>{event.event}</p>
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
    </div>
  );
}
