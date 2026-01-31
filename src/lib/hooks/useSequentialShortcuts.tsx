/**
 * INSTRUCCIONES DE INSTALACIÓN:
 *
 * 1. Guarda este archivo en: src/hooks/useSequentialShortcuts.ts
 *
 * 2. Si no existe la carpeta src/hooks/, créala primero
 *
 * 3. Si tu proyecto usa una estructura diferente, ajusta el import en MCUserMenuContent.tsx:
 *    - Si guardas en src/shared/hooks: import { useSequentialShortcuts } from "@/shared/hooks/useSequentialShortcuts";
 *    - Si guardas en src/hooks: import { useSequentialShortcuts } from "@/hooks/useSequentialShortcuts";
 */

import { useEffect, useRef, useCallback } from "react";

interface ShortcutConfig {
  sequence: string[]; // e.g., ['g', 'p'] for G then P
  action: () => void;
  description?: string;
}

interface UseSequentialShortcutsOptions {
  shortcuts: ShortcutConfig[];
  enabled?: boolean;
  timeout?: number; // Time window to complete sequence (ms)
}

export function useSequentialShortcuts({
  shortcuts,
  enabled = true,
  timeout = 2000,
}: UseSequentialShortcutsOptions) {
  const sequenceRef = useRef<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSequence = useCallback(() => {
    sequenceRef.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Get the key pressed (lowercase for consistency)
      const key = event.key.toLowerCase();

      // Ignore modifier keys alone
      if (["control", "shift", "alt", "meta"].includes(key)) {
        return;
      }

      // Handle Ctrl+E separately (single shortcut, not sequential)
      if (event.ctrlKey && key === "e") {
        event.preventDefault();
        const ctrlEShortcut = shortcuts.find(
          (s) => s.sequence.length === 1 && s.sequence[0] === "ctrl+e",
        );
        if (ctrlEShortcut) {
          ctrlEShortcut.action();
          resetSequence();
        }
        return;
      }

      // For sequential shortcuts, ignore if any modifier is pressed
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Add key to sequence
      sequenceRef.current.push(key);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Check if current sequence matches any shortcut
      const currentSequence = sequenceRef.current;
      const matchedShortcut = shortcuts.find((shortcut) => {
        if (shortcut.sequence.length !== currentSequence.length) {
          return false;
        }
        return shortcut.sequence.every(
          (key, index) => key.toLowerCase() === currentSequence[index],
        );
      });

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
        resetSequence();
      } else {
        // Check if current sequence is a valid prefix for any shortcut
        const hasValidPrefix = shortcuts.some((shortcut) => {
          if (shortcut.sequence.length < currentSequence.length) {
            return false;
          }
          return currentSequence.every(
            (key, index) => shortcut.sequence[index].toLowerCase() === key,
          );
        });

        if (!hasValidPrefix) {
          // No matching shortcut prefix, reset
          resetSequence();
        } else {
          // Set timeout to reset sequence if not completed
          timeoutRef.current = setTimeout(() => {
            resetSequence();
          }, timeout);
        }
      }
    },
    [enabled, shortcuts, timeout, resetSequence],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      resetSequence();
    };
  }, [enabled, handleKeyDown, resetSequence]);

  return { resetSequence };
}
