"use client";

export const LogoSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="relative h-10 w-10 animate-spin">
      <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-bg-accent-primary opacity-20"></div>
      <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-t-bg-accent-primary border-transparent"></div>
    </div>
  </div>
);
