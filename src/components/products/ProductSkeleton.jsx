import React from "react";
export function ProductSkeleton() {
    return (<div className="bg-surface rounded-2xl overflow-hidden border border-border animate-pulse-soft">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] bg-muted skeleton"/>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <div className="h-2 w-16 bg-muted rounded skeleton"/>
        
        {/* Name */}
        <div className="h-4 w-3/4 bg-muted rounded skeleton"/>
        
        {/* Rating */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="h-3 w-3 bg-muted rounded-full skeleton"/>))}
        </div>
        
        {/* Price & Colors */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-20 bg-muted rounded skeleton"/>
          <div className="flex gap-1">
            <div className="h-3 w-8 bg-muted rounded skeleton"/>
            <div className="h-3 w-8 bg-muted rounded skeleton"/>
          </div>
        </div>
      </div>
    </div>);
}
