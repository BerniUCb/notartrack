"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { advanceTramite, revertTramite } from "@/actions/tramites";

function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
}: {
  label: string;
  pendingLabel: string;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const styles =
    variant === "danger"
      ? "border border-input bg-background text-red-700"
      : "bg-primary text-primary-foreground";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium disabled:opacity-60 ${styles}`}
    >
      {pending ? pendingLabel : label}
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
        ¿Confirmás el avance a <strong>{siguienteLabel}</strong>? Queda
        registrado en el historial.
      </p>
      <textarea
        name="comentario"
        rows={2}
        placeholder="Comentario (opcional). Ej: falta el pago del arancel."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton label="Sí, avanzar" pendingLabel="Avanzando…" />
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

export function RevertButton({
  tramiteId,
  anteriorLabel,
}: {
  tramiteId: string;
  anteriorLabel: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-muted-foreground underline-offset-2 hover:underline"
      >
        Retroceder a {anteriorLabel}
      </button>
    );
  }

  return (
    <form action={revertTramite} className="flex flex-col gap-3">
      <input type="hidden" name="tramiteId" value={tramiteId} />
      <p className="text-sm">
        Esto vuelve el trámite a <strong>{anteriorLabel}</strong>. Queda
        registrado en el historial con tu comentario.
      </p>
      <textarea
        name="comentario"
        rows={2}
        required
        placeholder="Motivo del retroceso (obligatorio)."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton
          label={`Volver a ${anteriorLabel}`}
          pendingLabel="Retrocediendo…"
          variant="danger"
        />
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
