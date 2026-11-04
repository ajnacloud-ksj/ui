"use client";

import { Slider } from "@ajnacloud/ui";

export function SliderVertical() {
  return (
    <div
      role="group"
      aria-label="Audio mixer"
      style={{ display: "flex", gap: 32 }}
    >
      {[
        { label: "Microphone", value: 40 },
        { label: "Music", value: 70 },
        { label: "Effects", value: 25 },
      ].map((channel) => (
        <div
          key={channel.label}
          style={{ display: "grid", justifyItems: "center", gap: 12 }}
        >
          <div style={{ height: 180 }}>
            <Slider
              orientation="vertical"
              defaultValue={channel.value}
              aria-label={channel.label}
            />
          </div>
          <span>{channel.label}</span>
        </div>
      ))}
    </div>
  );
}
