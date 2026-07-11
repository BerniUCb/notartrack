import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { SearchForm } from "@/components/public/search-form";
import { listNotariasPublic } from "@/lib/public-tramites";

export const metadata: Metadata = {
  title: "Seguimiento de trámites | NotarTrack",
  description:
    "Consultá el estado de tu trámite notarial en línea con tu código de seguimiento o tu cédula de identidad. Sin llamadas ni filas.",
};

export default async function SeguimientoPage() {
  const notarias = await listNotariasPublic();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-12 pb-8 sm:pt-20">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
        <ShieldCheck className="h-7 w-7" />
      </div>

      <h1 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        Seguí tu trámite
      </h1>
      <p className="mt-2 mb-8 text-center text-sm text-neutral-600">
        Consultá el estado de tu documento en la notaría, en cualquier momento y
        sin llamar por teléfono.
      </p>

      <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <SearchForm notarias={notarias} />
      </div>
    </main>
  );
}
