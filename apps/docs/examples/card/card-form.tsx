"use client";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldLabel,
  Input,
} from "@ajnacloud/ui";
import { useId, useState } from "react";

export function CardForm() {
  const titleId = useId();
  const inputId = useId();
  const [saved, setSaved] = useState("");
  return (
    <Card
      render={<section />}
      aria-labelledby={titleId}
      style={{ width: "100%", maxWidth: 400 }}
    >
      <CardHeader>
        <CardTitle id={titleId} render={<h3>Project settings</h3>} />
        <CardDescription>Choose the name your team will see.</CardDescription>
        <CardAction>
          <a href="/docs/components/field">Help</a>
        </CardAction>
      </CardHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(String(new FormData(event.currentTarget).get("project")));
        }}
        style={{ display: "grid", gap: "var(--ajna-card-spacing)" }}
      >
        <CardContent>
          <Field>
            <FieldLabel htmlFor={inputId}>Project name</FieldLabel>
            <Input
              id={inputId}
              name="project"
              defaultValue="Website"
              required
            />
          </Field>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </CardFooter>
      </form>
      {saved && (
        <CardContent>
          <span role="status">Saved “{saved}”.</span>
        </CardContent>
      )}
    </Card>
  );
}
