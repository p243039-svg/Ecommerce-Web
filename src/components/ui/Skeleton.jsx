import React from "react";
import { cn } from "@/lib/utils";
export function Skeleton({ className }) {
    return <div className={cn("skeleton", className)}/>;
}
export function ProductCardSkeleton() {
    return (<div className="bg-surface rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-[3/4] w-full rounded-none"/>
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16"/>
        <Skeleton className="h-5 w-3/4"/>
        <Skeleton className="h-4 w-1/2"/>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-12 rounded-full"/>
          <Skeleton className="h-6 w-12 rounded-full"/>
        </div>
      </div>
    </div>);
}
