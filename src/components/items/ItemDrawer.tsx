"use client";

import { createElement, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  FolderOpen,
  Info,
  Pencil,
  Pin,
  Star,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { cn, formatLongDate } from "@/lib/utils";
import { typeIcon } from "@/lib/type-icons";
import { updateItem, type UpdateItemInput } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Item types that show the Content / Language fields in edit mode.
const CONTENT_EDITABLE_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_EDITABLE_TYPES = new Set(["snippet", "command"]);

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; item: ItemDetail };

// Right-side detail view for an item: fetches full detail on open (card data
// is already known to the caller, but content/url/language/collection aren't),
// shows a skeleton while loading, then the header, action bar, and detail
// sections. Editing/code-editor/mutations are deferred — display only for now.
export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {/* Keyed by itemId so switching items remounts with a clean loading
            state instead of needing an explicit reset inside the effect. */}
        {itemId && <ItemDrawerLoader key={itemId} itemId={itemId} />}
      </SheetContent>
    </Sheet>
  );
}

function ItemDrawerLoader({ itemId }: { itemId: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/items/${itemId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load item");
        return json.data as ItemDetail;
      })
      .then((item) => {
        if (!cancelled) setState({ status: "loaded", item });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  if (state.status === "loading") return <ItemDrawerSkeleton />;
  if (state.status === "error") {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Couldn&apos;t load this item. Please try again.
      </p>
    );
  }
  return <ItemDrawerDetail item={state.item} />;
}

function ItemDrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center gap-3">
        <div className="size-9 shrink-0 animate-pulse rounded-md bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="h-9 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-28 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

function ItemDrawerDetail({ item: initialItem }: { item: ItemDetail }) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  function handleCopy() {
    const text = item.content ?? item.url;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleSaved(updated: ItemDetail) {
    setItem(updated);
    setMode("view");
    setSavedNotice(true);
    router.refresh();
    setTimeout(() => setSavedNotice(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5 overflow-y-auto p-4">
      <SheetHeader className="gap-2 p-0">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            {createElement(typeIcon(item.typeIcon), {
              className: "size-4",
              // Inline style: the type color is a per-type hex value from the
              // DB, so it can't be expressed as a static Tailwind class.
              style: item.typeColor ? { color: item.typeColor } : undefined,
            })}
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate">{item.title}</SheetTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="capitalize">
                {item.typeName}s
              </Badge>
              {item.language && <Badge variant="outline">{item.language}</Badge>}
            </div>
          </div>
        </div>
      </SheetHeader>

      {mode === "edit" ? (
        <ItemEditForm item={item} onCancel={() => setMode("view")} onSaved={handleSaved} />
      ) : (
        <>
          <div className="flex items-center gap-1 border-y border-border py-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(item.isFavorite && "text-yellow-500 hover:text-yellow-500")}
            >
              <Star className={cn("size-4", item.isFavorite && "fill-yellow-500")} />
              Favorite
            </Button>
            <Button variant="ghost" size="sm">
              <Pin className={cn("size-4", item.isPinned && "fill-current")} />
              Pin
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!item.content && !item.url}>
              <Copy className="size-4" />
              {copied ? "Copied" : "Copy"}
            </Button>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setMode("edit")}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {savedNotice && (
            <p role="status" className="text-sm text-emerald-500">
              Changes saved.
            </p>
          )}

          {item.description && (
            <Section label="Description">
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Section>
          )}

          {(item.content || item.url) && (
            <Section label="Content">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                <code>{item.content ?? item.url}</code>
              </pre>
            </Section>
          )}

          {item.tags.length > 0 && (
            <Section label="Tags" icon={Tag}>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {item.collection && (
        <Section label="Collections" icon={FolderOpen}>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {item.collection.name}
          </span>
        </Section>
      )}

      <Section label="Details" icon={Info}>
        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
          <span className="text-muted-foreground">Created</span>
          <span className="text-right">{formatLongDate(item.createdAt)}</span>
          <span className="text-muted-foreground">Updated</span>
          <span className="text-right">{formatLongDate(item.updatedAt)}</span>
        </div>
      </Section>
    </div>
  );
}

function ItemEditForm({
  item,
  onCancel,
  onSaved,
}: {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (item: ItemDetail) => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const showsContent = CONTENT_EDITABLE_TYPES.has(item.typeName);
  const showsLanguage = LANGUAGE_EDITABLE_TYPES.has(item.typeName);
  const showsUrl = item.typeName === "link";

  async function handleSave() {
    setError("");
    setSaving(true);

    const payload: UpdateItemInput = {
      title,
      description: description.trim() === "" ? null : description,
      content: showsContent ? (content.trim() === "" ? null : content) : item.content,
      url: showsUrl ? (url.trim() === "" ? null : url) : item.url,
      language: showsLanguage ? (language.trim() === "" ? null : language) : item.language,
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const result = await updateItem(item.id, payload);
    setSaving(false);

    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to save changes.");
      return;
    }
    onSaved(result.data);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2 border-y border-border py-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || title.trim() === ""}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Field label="Title" htmlFor="edit-title">
        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>

      <Field label="Description" htmlFor="edit-description">
        <Textarea
          id="edit-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      {showsContent && (
        <Field label="Content" htmlFor="edit-content">
          <Textarea
            id="edit-content"
            rows={8}
            className="font-mono text-xs"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
      )}

      {showsLanguage && (
        <Field label="Language" htmlFor="edit-language">
          <Input id="edit-language" value={language} onChange={(e) => setLanguage(e.target.value)} />
        </Field>
      )}

      {showsUrl && (
        <Field label="URL" htmlFor="edit-url">
          <Input id="edit-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
      )}

      <Field label="Tags" htmlFor="edit-tags">
        <Input
          id="edit-tags"
          placeholder="Comma-separated, e.g. react, hooks"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </div>
      {children}
    </div>
  );
}
