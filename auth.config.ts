import type { NextAuthConfig } from "next-auth";

import type { Rol } from "@/lib/estados";

// Config compartida y "edge-safe" (sin acceso a base de datos ni bcrypt): la usa
// el middleware. El provider de credenciales, que sí toca la base, se agrega en
// auth.ts (runtime Node).
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.notariaId = user.notariaId;
        token.rol = user.rol;
        token.nombre = user.nombre;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.notariaId = token.notariaId as string;
        session.user.rol = token.rol as Rol;
        session.user.nombre = token.nombre as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
