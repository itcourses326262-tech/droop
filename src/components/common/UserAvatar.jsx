import { cn } from "@/lib/utils";

// صورة المستخدم أو أول حرف من اسمه.
export default function UserAvatar({ name, photo, className }) {
  const initial = (name || "؟").trim().charAt(0);
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || ""}
        className={cn("w-9 h-9 rounded-full object-cover shrink-0 bg-secondary", className)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className={cn(
        "w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0",
        className
      )}
    >
      {initial}
    </span>
  );
}
