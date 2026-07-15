"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { notificarListoParaRecoger } from "@/lib/notificaciones";
import { getCurrentUser } from "@/lib/tenant";

/** Reenvía manualmente la notificación "listo para recoger" de un trámite. */
export async function reenviarNotificacion(formData: FormData): Promise<void> {
  const tramiteId = z.uuid().parse(formData.get("tramiteId"));
  const user = await getCurrentUser();

  // notificarListoParaRecoger filtra por notariaId (aislamiento multi-tenant).
  await notificarListoParaRecoger(tramiteId, user.notariaId);

  revalidatePath(`/panel/${tramiteId}`);
}
