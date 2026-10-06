"use client";

import { useState, useTransition } from "react";
import { loginWithPin } from "@/lib/actions/auth-actions";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "ok"] as const;

export function PinPad() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(fullPin: string) {
    setError(null);
    startTransition(async () => {
      const result = await loginWithPin(fullPin);
      if (result?.error) {
        setError(result.error);
        setPin("");
      }
    });
  }

  function pressDigit(digit: string) {
    if (isPending) return;
    setError(null);
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    if (next.length === PIN_LENGTH) {
      submit(next);
    }
  }

  function pressBackspace() {
    if (isPending) return;
    setError(null);
    setPin((p) => p.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3" aria-label="Введённые цифры PIN">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-gray-400 dark:border-gray-500 ${
              i < pin.length
                ? "bg-gray-800 border-gray-800 dark:bg-gray-100 dark:border-gray-100"
                : "bg-transparent"
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      {isPending && <p className="text-sm text-gray-500 dark:text-gray-400">Входим…</p>}

      <div className="grid grid-cols-3 gap-4">
        {KEYS.map((key) => {
          if (key === "ok") {
            return (
              <button
                key={key}
                type="button"
                disabled
                className="h-16 w-16 rounded-full text-sm text-transparent"
                tabIndex={-1}
              />
            );
          }
          if (key === "⌫") {
            return (
              <button
                key={key}
                type="button"
                onClick={pressBackspace}
                disabled={isPending}
                className="h-16 w-16 rounded-full bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:active:bg-gray-700"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => pressDigit(key)}
              disabled={isPending}
              className="h-16 w-16 rounded-full bg-white text-2xl font-semibold text-gray-900 shadow-sm active:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
