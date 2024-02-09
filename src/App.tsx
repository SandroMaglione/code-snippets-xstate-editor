import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useState } from "react";
import { ThemedToken, codeToTokens } from "shiki";

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

interface TokenState {
  id: string;
  status: "visible" | "hidden";
  tokenList: ThemedToken[];
}

const tokensWithId = tokens.map(
  (token): TokenState => ({
    id: nanoid(),
    status: "visible",
    tokenList: token,
  })
);

export default function App() {
  const [tokenState, setTokenState] = useState<TokenState[]>(tokensWithId);

  const onHide = (id: string) => {
    setTokenState((s) =>
      s.map((ts) =>
        ts.id !== id
          ? ts
          : {
              ...ts,
              status: "hidden",
            }
      )
    );
  };

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
          {tokenState.map((token) => (
            <AnimatePresence key={token.id}>
              {token.status !== "hidden" && (
                <motion.span
                  id={token.id}
                  className="line"
                  style={{ display: "block" }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => onHide(token.id)}
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
    </div>
  );
}
