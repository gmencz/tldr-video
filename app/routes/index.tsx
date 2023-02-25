import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { classNames } from "~/utils/classnames";
import { generateTextTLDR } from "~/utils/openai.server";
import {
  validateYoutubeVideoURL,
  getYoutubeVideoTranscript,
  getYoutubeVideoInfo,
} from "~/utils/youtube";
import { useEffect, useState } from "react";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const youtubeVideoURL = formData.get("youtube-video-url");
  if (
    typeof youtubeVideoURL !== "string" ||
    !validateYoutubeVideoURL(youtubeVideoURL)
  ) {
    return json(
      { fieldErrors: { youtubeVideoURL: "Invalid YouTube video URL." } },
      { status: 400 }
    );
  }

  const transcript = await getYoutubeVideoTranscript(youtubeVideoURL);

  try {
    const [{ videoDetails }, tldr] = await Promise.all([
      getYoutubeVideoInfo(youtubeVideoURL),
      generateTextTLDR(transcript),
    ]);

    return json({ tldr, videoTitle: videoDetails.title });
  } catch (e) {
    console.error(e);
    const error = e as any;
    if (
      error?.response?.data?.error?.message?.startsWith(
        "This model's maximum context length is"
      )
    ) {
      return json(
        { formError: "That YouTube video is too long." },
        { status: 500 }
      );
    }

    return json(
      {
        formError:
          "Something went wrong generating the TLDR for that YouTube video.",
      },
      { status: 500 }
    );
  }
}

interface ActionData {
  tldr?: string;
  videoTitle?: string;
  formError?: string;
  fieldErrors?: {
    youtubeVideoURL: string;
  };
}

export default function Index() {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();
  const isSubmitting = transition.state === "submitting";
  const [youtubeVideoURLError, setYoutubeVideoURLError] = useState("");

  useEffect(() => {
    if (actionData?.fieldErrors?.youtubeVideoURL) {
      setYoutubeVideoURLError(actionData.fieldErrors.youtubeVideoURL);
    }
  }, [actionData?.fieldErrors?.youtubeVideoURL]);

  const handleYoutubeVideoURLBlur = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const $input = event.currentTarget;
    const value = $input.value;
    if (!value) {
      // We already have the browser validating for "required" so there's no need
      // to validate this ourselves.
      return;
    }

    const isValid = validateYoutubeVideoURL(value);
    $input.setCustomValidity(isValid ? "" : "Invalid YouTube video URL.");
    if ($input.checkValidity()) setYoutubeVideoURLError("");
    else setYoutubeVideoURLError($input.validationMessage);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <nav className="w-full max-w-4xl mx-auto py-8 px-4 border-b-2 border-b-gray-200 flex items-end justify-between">
        <a className="font-bold text-4xl text-black" href="/">
          TLDR Video
        </a>

        <p className="text-4xl">✍️</p>
      </nav>

      <main className="m-auto py-24 w-full max-w-2xl px-4 flex flex-col items-center">
        <a
          href="https://github.com/gmencz/tldr-video"
          className="inline-flex gap-2 items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
          </svg>

          <span>Star on GitHub</span>
        </a>

        <h1 className="mt-8 text-slate-900 text-4xl md:text-5xl lg:text-6xl font-bold text-center">
          Generate TLDRs for any video in seconds
        </h1>

        <Form
          action="/?index"
          method="post"
          className="mt-16 flex flex-col w-full max-w-lg"
        >
          <div className="w-full">
            <label
              htmlFor="youtube-video-url"
              className="text-black font-semibold"
            >
              Enter the video URL{" "}
              <span className="text-gray-500">
                (only YouTube is supported currently)
              </span>
              .
            </label>

            <div className="relative mt-4 rounded-md shadow-sm w-full">
              <input
                required
                type="url"
                name="youtube-video-url"
                id="youtube-video-url"
                onBlur={handleYoutubeVideoURLBlur}
                placeholder="https://www.youtube.com/watch?v=eBGIQ7ZuuiU"
                aria-invalid={!!youtubeVideoURLError}
                aria-describedby={
                  youtubeVideoURLError ? "youtube-video-url-error" : undefined
                }
                className={classNames(
                  "block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black",
                  youtubeVideoURLError
                    ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                    : null
                )}
              />

              {youtubeVideoURLError ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>

            {youtubeVideoURLError ? (
              <p className="mt-4 text-red-600" id="youtube-video-url-error">
                {youtubeVideoURLError}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 mt-6 rounded-md bg-black px-3.5 py-2.5 font-semibold text-white shadow-sm hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}

            <span>{isSubmitting ? "Generating TLDR..." : "Generate TLDR"}</span>

            {!isSubmitting ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
          </button>

          {actionData?.formError ? (
            <p className="text-red-600 font-medium mt-6">
              {actionData?.formError}
            </p>
          ) : null}
        </Form>

        {actionData?.tldr && actionData.videoTitle ? (
          <div className="mt-14">
            <p className=" text-slate-900 text-2xl font-bold text-center">
              Generated TLDR for{" "}
              <span className="font-semibold">"{actionData.videoTitle}"</span>
            </p>

            <div className="shadow mt-8 bg-white border border-gray-200 rounded-xl px-6 py-4 flex flex-col gap-4">
              {actionData.tldr.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      <footer className="w-full max-w-3xl mx-auto mt-auto py-8 px-4 border-t border-t-gray-200 flex justify-between">
        <p>
          Powered by{" "}
          <a className="font-bold text-black" href="https://openai.com">
            OpenAI
          </a>{" "}
          and{" "}
          <a className="font-bold text-black" href="https://remix.run">
            Remix
          </a>
        </p>

        <div className="flex gap-6">
          <a href="https://github.com/gmencz">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-gray-500"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
            </svg>
          </a>

          <a href="mailto:yo@gabrielmendezc.com">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-gray-500"
            >
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
