"use client";

import { t } from "@/lib/i18n";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { ActionState } from "@/lib/action-state";

export default function ActionMessage({ state }: { state: NonNullable<ActionState> }) {
  const [copied, setCopied] = useState(false);
  const errors = Object.values(state.fieldErrors ?? {});
  return <div className="grid gap-2">
    <p className="font-medium">{state.message}</p>
    {errors.length > 0 && <ul className="ml-4 list-disc space-y-0.5">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
    {state.link && <InputGroup className="bg-background text-foreground">
      <InputGroupInput readOnly value={state.link} aria-label={t.common.passwordLink} className="font-mono text-xs" onFocus={(event) => event.currentTarget.select()}/>
      <InputGroupAddon align="inline-end">
        <Button type="button" size="xs" variant="secondary" onClick={() => navigator.clipboard.writeText(state.link!).then(() => setCopied(true))}>{copied ? <Check/> : <Copy/>}{copied ? t.common.copied : t.common.copy}</Button>
      </InputGroupAddon>
    </InputGroup>}
  </div>;
}
