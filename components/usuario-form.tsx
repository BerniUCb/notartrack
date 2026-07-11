"use client";

import { useActionState, useRef, useEffect } from "react";

import { createUsuario, type CreateUsuarioState } from "@/actions/usuarios";
import { ROLES, ROL_LABEL } from "@/lib/estados";

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium";

export function UsuarioForm() {
  const [state, formAction, isPending] = useActionState<
    CreateUsuarioState,
    FormData
  >(createUsuario, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className={labelClass}>
          Nombre completo
        </label>
        <input id="nombre" name="nombre" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rol" className={labelClass}>
            Rol
          </label>
          <select id="rol" name="rol" defaultValue="" required className={inputClass}>
            <option value="" disabled>
              Elegí…
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROL_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state && "error" in state ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state && state.ok ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Usuario creado correctamente.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
