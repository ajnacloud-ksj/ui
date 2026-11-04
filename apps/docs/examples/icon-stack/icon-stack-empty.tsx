"use client";

import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  IconStack,
} from "@ajnacloud/ui";
import { Database, Inbox, UserPlus } from "lucide-react";

export function IconStackEmpty() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia>
          <IconStack
            aria-hidden="true"
            className="h-24 w-[5.5rem] text-ajna-primary"
          >
            <Inbox className="size-5 text-ajna-primary" />
          </IconStack>
        </EmptyMedia>
        <EmptyTitle render={<h3>Workspace is ready</h3>} />
        <EmptyDescription>
          Invite teammates or connect a data source to start filling this view.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button size="sm" icon={<UserPlus />}>
          Invite team
        </Button>
        <Button variant="secondary" size="sm" icon={<Database />}>
          Connect source
        </Button>
      </EmptyContent>
    </Empty>
  );
}
