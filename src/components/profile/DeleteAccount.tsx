"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Delete-account action: a destructive button gated behind a confirmation
// dialog. On confirm it calls the account API, then signs the user out (which
// clears the now-orphaned session JWT) and lands them on the sign-in page.
export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      await signOut({ callbackUrl: "/sign-in" });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={<Button variant="destructive" className="self-start" />}
        >
          Delete account
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account and all of your items,
              collections, and tags. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={(e) => {
                // Keep the dialog open while the request is in flight.
                e.preventDefault();
                handleDelete();
              }}
            >
              {loading ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
