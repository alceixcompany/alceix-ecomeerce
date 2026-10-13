import { z } from "zod";
import { api, messageSchema } from "@/lib/http";
export const authSchema = z.object({
  platformAdmin:z.boolean().default(false),
  user: z.object({ id: z.uuid(), name: z.string(), email: z.email() }),
  stores: z.array(
    z.object({ id: z.uuid(), slug: z.string(), name: z.string() }),
  ),
});
export function submitAuth(
  register: boolean,
  payload: { email: string; password: string; name?: string; store?: string },
) {
  return api(`/auth/${register ? "register" : "login"}`, authSchema, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function forgotPassword(email: string) {
  return api("/auth/forgot-password", messageSchema, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
export function logout() {
  return api("/auth/logout", messageSchema, { method: "POST" });
}
export function currentAccount() {
  return api("/auth/me", authSchema);
}

export function resetPassword(token:string,password:string){return api('/auth/reset-password',messageSchema,{method:'POST',body:JSON.stringify({token,password})});}
