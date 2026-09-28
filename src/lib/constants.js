export const SERVICE_TYPES = ["كهرباء", "سباكة", "دهان", "نجارة", "تكييف", "أخرى"];

export const REQUEST_STATUS = {
  open: { label: "مفتوح", cls: "bg-accent/15 text-primary" },
  in_progress: { label: "قيد التنفيذ", cls: "bg-amber-100 text-amber-700" },
  done: { label: "مكتمل", cls: "bg-secondary text-muted-foreground" },
  cancelled: { label: "ملغي", cls: "bg-destructive/10 text-destructive" },
};
