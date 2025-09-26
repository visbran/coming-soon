import Link from "next/link";

import { Button } from "@/components/ui/button";

const messages: Record<string, { title: string; description: string }> = {
  confirmed: {
    title: "Merci pour votre confirmation !",
    description:
      "Votre inscription est désormais validée. Vous recevrez bientôt nos actualités.",
  },
  "already-confirmed": {
    title: "Adresse déjà confirmée",
    description:
      "Cette adresse e-mail est déjà inscrite. Merci de votre fidélité !",
  },
  "invalid-token": {
    title: "Lien invalide ou expiré",
    description:
      "Le lien de confirmation n&apos;est plus valide. Veuillez recommencer la procédure d&apos;inscription.",
  },
};

interface MerciPageProps {
  searchParams: { status?: string };
}

export default function MerciPage({ searchParams }: MerciPageProps) {
  const status = searchParams.status ?? "";
  const content = messages[status] ?? {
    title: "Merci !",
    description:
      "Si vous venez de valider votre inscription, surveillez votre boîte mail pour nos prochaines nouvelles.",
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {content.title}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          {content.description}
        </p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
