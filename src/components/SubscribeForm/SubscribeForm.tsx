"use client";

import * as React from "react";
import data from "../../../data/data";

type SubmissionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function SubscribeForm() {
  const { newsletterheading, hideSubscribeForm } = data;
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<SubmissionState>({ status: "idle" });

  if (hideSubscribeForm) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setState({ status: "error", message: "Merci de saisir une adresse e-mail." });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result: { error?: string } | undefined = await response.json().catch(() => undefined);

      if (!response.ok) {
        throw new Error(result?.error ?? "Une erreur est survenue.");
      }

      setEmail("");
      setState({
        status: "success",
        message: "Merci ! Vérifiez votre boîte mail pour notre message.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible d'envoyer votre inscription.";
      setState({ status: "error", message });
    }
  };

  return (
    <section className="mt-10 w-80 p-3 text-center lg:m-7">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-light leading-6 text-slate-800 dark:text-slate-100"
          >
            {newsletterheading}
          </label>
          <div className="mt-2 flex-col flex lg:flex md:flex-row">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Adresse e-mail"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="block w-full rounded-none border-0 p-2 pl-[10px] text-gray-900 placeholder:text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <button
              type="submit"
              className="ml-0 mt-2 border-2 border-slate-800 bg-slate-900 p-2 text-white hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-75 dark:border-slate-100 dark:text-white md:mt-0"
              disabled={state.status === "loading"}
            >
              {state.status === "loading" ? "Envoi..." : "S'inscrire"}
            </button>
          </div>
        </div>
        {state.status === "error" && (
          <p
            className="text-sm text-red-500"
            role="status"
            aria-live="polite"
          >
            {state.message}
          </p>
        )}
        {state.status === "success" && (
          <p
            className="text-sm text-green-600"
            role="status"
            aria-live="polite"
          >
            {state.message}
          </p>
        )}
      </form>
    </section>
  );
}

export default SubscribeForm;
