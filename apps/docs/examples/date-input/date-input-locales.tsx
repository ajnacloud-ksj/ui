"use client";

import { DateInput, Field, FieldTitle } from "@ajnacloud/ui";
import { parseDate } from "@internationalized/date";

export function DateInputLocales() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      {["en-US", "en-GB", "de-DE"].map((locale) => (
        <Field key={locale}>
          <FieldTitle id={`locale-${locale}`}>{locale}</FieldTitle>
          <DateInput
            aria-labelledby={`locale-${locale}`}
            locale={locale}
            defaultValue={parseDate("2026-04-21")}
          />
        </Field>
      ))}
    </div>
  );
}
