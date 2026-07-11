import Link from "next/link";
import { SearchX } from "lucide-react";

export default function TramiteNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-20 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-200 text-neutral-500">
        <SearchX className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-neutral-900">
        No encontramos ese trámite
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        El código no corresponde a ningún trámite. Revisá que esté bien escrito
        o buscá con tu cédula de identidad.
      </p>
      <Link
        href="/seguimiento"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Volver a buscar
      </Link>
    </main>
  );
}
