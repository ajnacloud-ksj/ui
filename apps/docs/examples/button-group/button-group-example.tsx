"use client";

import { Button, ButtonGroup, ButtonGroupText } from "@ajnacloud/ui";
import { useState } from "react";

export function ButtonGroupExample() {
  const [page, setPage] = useState(1);
  return (
    <ButtonGroup aria-label="Pagination">
      <Button
        variant="secondary"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </Button>
      <ButtonGroupText aria-live="polite">Page {page}</ButtonGroupText>
      <Button variant="secondary" onClick={() => setPage(page + 1)}>
        Next
      </Button>
    </ButtonGroup>
  );
}
