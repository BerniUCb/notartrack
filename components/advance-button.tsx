"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { advanceTramite } from "@/actions/tramites";

function ConfirmSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
    >
      {pending ? "Avanzando…" : "Sí, avanzar"}
    </button>
  );
}

export function AdvanceButton({
  tramiteId,
  siguienteLabel,
}: {
  tramiteId: string;
  siguienteLabel: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto"
      >
        Avanzar a {siguienteLabel}
      </button>
    );
  }

  return (
    <form action={advanceTramite} className="flex flex-col gap-3">
      <input type="hidden" name="tramiteId" value={tramiteId} />
      <p className="text-sm">
        ¿Confirmás el avance a <strong>{siguienteLabel}</strong>? Esta acción
        queda registrada en el historial.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ConfirmSubmit />
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
