import type React from "react";

type IconName =
  | "archive"
  | "book"
  | "box"
  | "check"
  | "chevron-down"
  | "dice"
  | "edit"
  | "globe"
  | "lightbulb"
  | "lock"
  | "map-pin"
  | "message"
  | "scroll"
  | "search"
  | "sword"
  | "trash"
  | "user";

const paths: Record<IconName, React.ReactNode> = {
  archive: (
    <>
      <path d="M4 7h16" />
      <path d="M5 7l1.2 12h11.6L19 7" />
      <path d="M8 4h8l1 3H7l1-3Z" />
      <path d="M10 11h4" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20" />
      <path d="M8 7h8" />
      <path d="M8 11h7" />
    </>
  ),
  box: (
    <>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  "chevron-down": (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 8.5h.01" />
      <path d="M15.5 8.5h.01" />
      <path d="M12 12h.01" />
      <path d="M8.5 15.5h.01" />
      <path d="M15.5 15.5h.01" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21" />
      <path d="M12 3C9.5 5.7 8.3 8.7 8.3 12S9.5 18.3 12 21" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.2 14.6A6 6 0 1 1 15.8 14.6c-.7.6-.8 1.3-.8 2.4H9c0-1.1-.1-1.8-.8-2.4Z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  message: (
    <>
      <path d="M21 12a8 8 0 0 1-8 8H6l-3 3v-7a8 8 0 1 1 18-4Z" />
    </>
  ),
  scroll: (
    <>
      <path d="M8 4h10a3 3 0 0 1 3 3v1h-5V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v13h12" />
      <path d="M16 8v12a3 3 0 0 1-6 0v-1h11v1a3 3 0 0 1-3 3h-8" />
      <path d="M7 8h5" />
      <path d="M7 12h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 5 5" />
    </>
  ),
  sword: (
    <>
      <path d="M14.5 4.5 20 4l-.5 5.5L9 20l-5-5L14.5 4.5Z" />
      <path d="m13 6 5 5" />
      <path d="m7 17-3 3" />
      <path d="m4 14 6 6" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

export default function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
