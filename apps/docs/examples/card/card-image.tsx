"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ajnacloud/ui";

export function CardImage() {
  return (
    <Card
      style={{
        width: "100%",
        maxWidth: 400,
        paddingTop: 0,
        overflow: "hidden",
      }}
    >
      <img
        src="/avatars/alex.svg"
        alt="Illustrated portrait of Alex"
        width={400}
        height={180}
        style={{
          display: "block",
          width: "100%",
          height: 180,
          objectFit: "cover",
        }}
      />
      <CardHeader>
        <CardTitle render={<h3>Meet Alex</h3>} />
        <CardDescription>Designer and member of the Ajna team.</CardDescription>
      </CardHeader>
      <CardContent>Building thoughtful tools for everyday work.</CardContent>
    </Card>
  );
}
