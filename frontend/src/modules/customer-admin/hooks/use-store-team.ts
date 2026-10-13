"use client";
import { useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/http";
import {
  loadTeam,
  inviteTeamMember,
  changeTeamRole,
  revokeTeamMember,
} from "../services/team-api";
import type { TeamMember } from "../types/collaboration";
export function useStoreTeam(slug: string) {
  const [value, setValue] = useState<TeamMember[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [invitation, setInvitation] = useState("");
  const writing = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    loadTeam(slug, controller.signal)
      .then((result) => {
        setValue(result.items);
        setReady(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [slug]);
  async function save(next: TeamMember[]) {
    if (!ready || writing.current) return false;
    writing.current = true;
    setReady(false);
    try {
      const added = next.find(
          (member) => !value.some((current) => current.id === member.id),
        ),
        removed = value.find(
          (member) => !next.some((current) => current.id === member.id),
        ),
        changed = next.find(
          (member) =>
            JSON.stringify(member) !==
            JSON.stringify(value.find((current) => current.id === member.id)),
        );
      if (added) {
        const result = await inviteTeamMember(slug, added.email, added.role);
        setInvitation(
          `${window.location.origin}/ekip-daveti?${new URLSearchParams({ token: result.token })}`,
        );
      } else if (removed) {
        await revokeTeamMember(slug, removed);
      } else if (changed) {
        await changeTeamRole(slug, changed);
      }
      const result = await loadTeam(slug);
      setValue(result.items);
      setError("");
      return true;
    } catch (error) {
      setError(errorMessage(error));
      try {
        const latest = await loadTeam(slug);
        setValue(latest.items);
      } catch {
        /* Preserve the last confirmed state when the refresh also fails. */
      }
      return false;
    } finally {
      writing.current = false;
      setReady(true);
    }
  }
  return { value, ready, error, setError, save, invitation };
}
