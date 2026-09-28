import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// عرض التقييم، أو اختياره عند تمرير onChange.
export default function StarRating({ value = 0, onChange, size = 16, className }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <Star
            size={size}
            className={filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-0.5"
            aria-label={`${n} من ٥`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
