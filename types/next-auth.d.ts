import type { DefaultSession } from "next-auth";

import type { Rol } from "@/lib/estados";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      notariaId: string;
      rol: Rol;
      nombre: string;
    } & DefaultSession["user"];
  }

  interface User {
    notariaId: string;
    rol: Rol;
    nombre: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    notariaId: string;
    rol: Rol;
    nombre: string;
  }
}
