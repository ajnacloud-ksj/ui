"use client";

import { Table } from "@ajnacloud/ui";

export function TableExample() {
  const messages = [
    {
      subject: "Your preview is ready",
      from: "Alex Morgan",
      date: "5 minutes ago",
    },
    { subject: "New project invitation", from: "Sam Lee", date: "1 hour ago" },
    { subject: "Weekly project summary", from: "Ajna", date: "Yesterday" },
  ];
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Table>
        <Table.Caption>Recent workspace messages.</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Subject</Table.Head>
            <Table.Head>From</Table.Head>
            <Table.Head>Date</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {messages.map((message) => (
            <Table.Row key={message.subject}>
              <Table.Cell>{message.subject}</Table.Cell>
              <Table.Cell>{message.from}</Table.Cell>
              <Table.Cell>{message.date}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
