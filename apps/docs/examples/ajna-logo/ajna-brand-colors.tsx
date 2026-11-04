"use client";

export function AjnaBrandColors() {
  const colors = [
    ["Navy", "#12234E", "bg-ajna-brand-navy"],
    ["Orange", "#FF8D2B", "bg-ajna-brand-orange"],
    ["Blue", "#569FF5", "bg-ajna-brand-blue"],
    ["Light blue", "#E0EAF4", "bg-ajna-brand-light-blue"],
    ["Gray", "#6F6F6F", "bg-ajna-brand-gray"],
  ];
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-5">
      {colors.map(([name, hex, className]) => (
        <div key={name} className="space-y-2">
          <div className={`h-20 rounded-md ${className}`} aria-hidden />
          <div className="text-sm font-medium">{name}</div>
          <code className="text-xs text-[hsl(var(--ajna-muted-foreground))]">
            {hex}
          </code>
        </div>
      ))}
    </div>
  );
}
