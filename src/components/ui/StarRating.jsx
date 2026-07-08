import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
export function StarRating({ rating = 0, maxRating = 5, size = "sm", showValue = false, reviewCount, className, }) {
    const sizes = {
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };
    return (<div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
            const filled = i < Math.floor(rating);
            const partial = !filled && i < rating;
            return (<Star key={i} className={cn(sizes[size], filled
                    ? "text-yellow-400 fill-yellow-400"
                    : partial
                        ? "text-yellow-400 fill-yellow-400/50"
                        : "text-muted-foreground/30")}/>);
        })}
      </div>
      {showValue && (<span className="text-sm font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>)}
      {reviewCount !== undefined && (<span className="text-xs text-muted-foreground">
          ({reviewCount})
        </span>)}
    </div>);
}
