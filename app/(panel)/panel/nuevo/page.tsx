import Link from "next/link";

import { TramiteForm } from "@/components/tramite-form";

export default function NuevoTramitePage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/panel"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a trámites
      </Link>
      <h1 className="text-xl font-semibold">Nuevo trámite</h1>
      <TramiteForm />
    </div>
  );
}
