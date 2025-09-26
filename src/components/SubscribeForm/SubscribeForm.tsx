"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import data from "../../../data/data";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'adresse e-mail est requise." })
    .email({ message: "Veuillez saisir une adresse e-mail valide." }),
  consent: z
    .boolean()
    .refine((value) => value === true, {
      message: "Vous devez accepter la politique RGPD.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

type SubmissionStatus = "idle" | "loading" | "success" | "error";

function SubscribeForm() {
  const {
    newsletterheading,
    hideSubscribeForm,
  } = data;

  const [status, setStatus] = React.useState<SubmissionStatus>("idle");
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      consent: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setStatus("loading");
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Impossible d'enregistrer votre inscription."
        );
      }

      form.reset({ email: "", consent: false });
      setStatus("success");
      setFeedbackMessage(
        payload.message ??
          "Merci ! Vérifiez votre boîte mail pour confirmer votre inscription."
      );
    } catch (error) {
      setStatus("error");
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    }
  };

  if (hideSubscribeForm) {
    return null;
  }

  return (
    <section className="mt-10 w-full max-w-md rounded-xl border border-slate-200 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {newsletterheading}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Recevez une notification dès que le site est en ligne.
            </p>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse e-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="prenom.nom@email.com"
                    autoComplete="email"
                    inputMode="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 text-sm">
                    <FormLabel className="text-left font-medium text-slate-800 dark:text-slate-100">
                      J&apos;accepte de recevoir les communications de LMF Solutions.
                    </FormLabel>
                    <FormDescription>
                      Vos données sont utilisées uniquement pour vous informer du
                      lancement. Vous pouvez vous désinscrire à tout moment.
                    </FormDescription>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Envoi en cours…" : "S'inscrire"}
          </Button>

          {feedbackMessage && (
            <p
              className={`text-sm ${
                status === "success" ? "text-emerald-600" : "text-red-500"
              }`}
              role="status"
            >
              {feedbackMessage}
            </p>
          )}
        </form>
      </Form>
    </section>
  );
}

export default SubscribeForm;
