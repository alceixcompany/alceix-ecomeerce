"use client";
import { useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/http";
import {
  loadProfile,
  saveProfile,
  type AccountProfile,
} from "../services/account-api";
import type { Profile } from "../types/collaboration";
const initial: AccountProfile = {
  name: "",
  email: "",
  phone: "",
  city: "",
  bio: "",
  version: 0,
};
export function useAccountProfile() {
  const [value, setValue] = useState(initial),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const writing = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    loadProfile(controller.signal)
      .then((profile) => {
        setValue(profile);
        setReady(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, []);
  async function save(next: Profile) {
    if (!ready || writing.current) return false;
    writing.current = true;
    setPending(true);
    try {
      const saved = await saveProfile(next, value.version);
      setValue(saved);
      setError("");
      window.dispatchEvent(new CustomEvent("alceix-account-profile-update"));
      return true;
    } catch (error) {
      setError(errorMessage(error));
      return false;
    } finally {
      writing.current = false;
      setPending(false);
    }
  }
  return { value, ready, pending, error, save, setError };
}
