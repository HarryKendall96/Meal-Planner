import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { parseFood, type FoodDraftItem } from "@/services/aiParser";
import { Camera, Sparkles } from "lucide-react";

interface Props {
  onConfirm: (items: { name: string; calories: number }[]) => void;
}

/**
 * Door 3 — describe in words or upload a photo. Calls the stubbed AI parser.
 * Law: AI NEVER auto-commits. The parse becomes an EDITABLE DRAFT the user must
 * confirm. Every item is tagged "estimate" until confirmed.
 * This door is optional and not privileged over Quick/Search.
 */
export function DescribeDoor({ onConfirm }: Props) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<FoodDraftItem[] | null>(null);
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function runText() {
    const result = parseFood({ kind: "text", text });
    setDraft(result.items);
    setNote(result.note);
  }

  function runImage(file?: File) {
    const result = parseFood({ kind: "image", file });
    setDraft(result.items);
    setNote(result.note);
  }

  function editItem(idx: number, patch: Partial<FoodDraftItem>) {
    setDraft((d) =>
      d ? d.map((it, i) => (i === idx ? { ...it, ...patch } : it)) : d
    );
  }

  function confirm() {
    if (!draft) return;
    onConfirm(draft.map((d) => ({ name: d.name, calories: d.calories })));
    setDraft(null);
    setText("");
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Describe a meal, e.g. '2 eggs and toast'"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <Button className="flex-1" onClick={runText} disabled={!text.trim()}>
          <Sparkles className="size-4" />
          Parse text
        </Button>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          aria-label="Upload photo"
        >
          <Camera className="size-5" />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => runImage(e.target.files?.[0])}
        />
      </div>

      {draft && (
        <div className="mt-1 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-bold">Draft — confirm before saving</span>
            <ConfidenceBadge confidence="estimate" />
          </div>
          <p className="mb-3 text-xs text-muted-foreground">{note}</p>

          {draft.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              Nothing to confirm.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {draft.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={item.name}
                    onChange={(e) => editItem(i, { name: e.target.value })}
                    className="h-10 flex-1"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={item.calories}
                    onChange={(e) =>
                      editItem(i, { calories: parseInt(e.target.value, 10) || 0 })
                    }
                    className="h-10 w-20 text-center font-semibold tabular-nums"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDraft(null)}
            >
              Discard
            </Button>
            <Button
              className="flex-1"
              onClick={confirm}
              disabled={draft.length === 0}
            >
              Save to today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
