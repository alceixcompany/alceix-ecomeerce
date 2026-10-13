import { z } from "zod";
import { api, messageSchema } from "@/lib/http";
import type { TeamMember } from "../types/collaboration";
const member = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["owner", "editor", "support", "viewer"]),
  status: z.enum(["active", "invited"]),
  version: z.number().int(),
});
const path = (slug: string) => `/stores/${encodeURIComponent(slug)}/team`;
export const loadTeam = (slug: string, signal?: AbortSignal) =>
  api(path(slug), z.object({ items: z.array(member) }), { signal });
export const inviteTeamMember = (
  slug: string,
  email: string,
  role: TeamMember["role"],
) =>
  api(
    `${path(slug)}/invitations`,
    z.object({
      id: z.uuid(),
      token: z.string().regex(/^[a-f0-9]{64}$/),
      expiresAt: z.iso.datetime(),
      message: z.string(),
    }),
    { method: "POST", body: JSON.stringify({ email, role }) },
  );
export const changeTeamRole = (slug: string, member: TeamMember) =>
  api(`${path(slug)}/${encodeURIComponent(member.id)}`, messageSchema, {
    method: "PUT",
    body: JSON.stringify({ role: member.role, version: member.version ?? 0 }),
  });
export const revokeTeamMember = (slug: string, member: TeamMember) =>
  api(`${path(slug)}/${encodeURIComponent(member.id)}/revoke`, messageSchema, {
    method: "POST",
    body: JSON.stringify({ version: member.version ?? 0 }),
  });
export const acceptTeamInvitation = (token: string) =>
  api("/team/accept", z.object({ slug: z.string(), message: z.string() }), {
    method: "POST",
    body: JSON.stringify({ token }),
  });
