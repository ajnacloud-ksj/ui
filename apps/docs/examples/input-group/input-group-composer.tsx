"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@ajnacloud/ui";
import { useState } from "react";

export function InputGroupComposer() {
  const [message, setMessage] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Field>
        <FieldLabel htmlFor="group-message">Message</FieldLabel>
        <InputGroup>
          <InputGroupTextarea
            id="group-message"
            rows={3}
            placeholder="Write a message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText>{message.length} characters</InputGroupText>
            <InputGroupButton
              disabled={!message.trim()}
              onClick={() => setMessage("")}
            >
              Send
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Messages support multiple lines.</FieldDescription>
      </Field>
    </div>
  );
}
