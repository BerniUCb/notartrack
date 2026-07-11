import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { db } from "@/db";
import { usuario } from "@/db/schema";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const rows = await db
          .select()
          .from(usuario)
          .where(eq(usuario.email, email))
          .limit(1);

        const found = rows[0];
        if (!found) return null;

        const ok = await bcrypt.compare(parsed.data.password, found.passwordHash);
        if (!ok) return null;

        return {
          id: found.id,
          email: found.email,
          name: found.nombre,
          nombre: found.nombre,
          notariaId: found.notariaId,
          rol: found.rol,
        };
      },
    }),
  ],
});
