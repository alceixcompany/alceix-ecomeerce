"use client";
import { useHydrated } from "@/components/hooks/use-hydrated";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { errorMessage } from "@/lib/http";
export function ApplicationForm({
  children,
  className,
  submit,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  submit: (
    values: Record<string, string>,
  ) => Promise<{ id: string; message: string }>;
}) {
  const ready = useHydrated();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const buttons = Array.from(
      formRef.current?.querySelectorAll("button[type=submit]") || [],
    );
    buttons.forEach((button) => {
      if (button instanceof HTMLButtonElement) button.disabled = pending;
    });
  }, [pending]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    setPending(true);
    setMessage("");
    try {
      const result = await submit(
        Object.fromEntries(
          [...new FormData(form).entries()].filter(
            (pair): pair is [string, string] => typeof pair[1] === "string",
          ),
        ),
      );
      setMessage(`${result.message} Başvuru numarası: ${result.id}`);
      form.reset();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      ref={formRef}
      inert={!ready}
      id={id}
      aria-busy={pending}
      className={className}
      onSubmit={handleSubmit}
    >
      {children}
      {message && (
        <p
          role="status"
          className="rounded-xl bg-surface-container p-3 text-body-sm text-on-surface"
        >
          {message}
        </p>
      )}
    </form>
  );
}
