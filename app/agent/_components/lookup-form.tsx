import type React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

type LookupFormProps = {
  inputUrl: string;
  loading: boolean;
  error: string | null;
  slug: string;
  onInputChange: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export function LookupForm({
  inputUrl,
  loading,
  error,
  slug,
  onInputChange,
  onSubmit,
}: LookupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <InputGroup className="bg-background shadow-sm">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          value={inputUrl.replace(/^https?:\/\//i, "")}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="polymarket.com/event/example-slug"
          aria-label="Polymarket event URL"
          autoComplete="off"
          spellCheck={false}
          disabled={loading}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" disabled={loading}>
            {loading ? "Loading…" : "Load event"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
