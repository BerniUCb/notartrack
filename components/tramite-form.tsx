"use client";

import { useActionState, useState, useTransition } from "react";

import {
  createTramite,
  findClienteByCi,
  type CreateTramiteState,
} from "@/actions/tramites";
import { TIPOS, TIPO_LABEL } from "@/lib/estados";

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium";

export function TramiteForm() {
  const [state, formAction, isPending] = useActionState<
    CreateTramiteState,
    FormData
  >(createTramite, undefined);

  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [clienteExistente, setClienteExistente] = useState(false);
  const [buscando, startBuscar] = useTransition();

  function onCiBlur(e: React.FocusEvent<HTMLInputElement>) {
    const ci = e.target.value.trim();
    if (ci.length < 3) {
      setClienteExistente(false);
      return;
    }
    startBuscar(async () => {
      const found = await findClienteByCi(ci);
      if (found) {
        setNombre(found.nombreCompleto);
        setCelular(found.celular ?? "");
        setClienteExistente(true);
      } else {
        setClienteExistente(false);
      }
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ci" className={labelClass}>
          CI del cliente
        </label>
        <input
          id="ci"
          name="ci"
          inputMode="numeric"
          required
          onBlur={onCiBlur}
          className={inputClass}
          placeholder="Ej: 4587963"
        />
        <p className="text-xs text-muted-foreground">
          {buscando
            ? "Buscando cliente…"
            : clienteExistente
              ? "Cliente existente: se usará el registro guardado."
              : "Si el CI no existe, se crea un cliente nuevo con los datos de abajo."}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombreCompleto" className={labelClass}>
          Nombre completo
        </label>
        <input
          id="nombreCompleto"
          name="nombreCompleto"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          readOnly={clienteExistente}
          className={inputClass}
          placeholder="Ej: María Elena Quispe Mamani"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="celular" className={labelClass}>
          Celular <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="celular"
          name="celular"
          inputMode="numeric"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          readOnly={clienteExistente}
          className={inputClass}
          placeholder="Ej: 70012345"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo" className={labelClass}>
          Tipo de trámite
        </label>
        <select id="tipo" name="tipo" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Seleccioná un tipo…
          </option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TIPO_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observaciones" className={labelClass}>
          Observaciones <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Detalle interno del trámite"
        />
      </div>

      {state?.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Creando…" : "Crear trámite"}
      </button>
    </form>
  );
}
