import { cn } from "@/lib/utils";

/** A compact racing-flag + speed mark used in the header and as favicon. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-9", className)}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="11" fill="var(--primary)" />
      {/* checkered flag */}
      <g fill="#ffffff">
        <rect x="12" y="13" width="5" height="5" />
        <rect x="22" y="13" width="5" height="5" />
        <rect x="17" y="18" width="5" height="5" />
        <rect x="27" y="18" width="5" height="5" fillOpacity="0.55" />
        <rect x="12" y="23" width="5" height="5" fillOpacity="0.55" />
        <rect x="22" y="23" width="5" height="5" />
      </g>
      {/* flag pole */}
      <rect x="10" y="12" width="2" height="24" rx="1" fill="#ffffff" />
    </svg>
  );
}
