"use client";

import { useState } from "react";
import { RedirectWarningModal } from "./RedirectWarningModal";
import BookmakerIcon from "./BookmakerIcon";

interface BookmakerLinkProps {
  name: string;
  url: string;
  bookmakerKey: string;
  className?: string;
}

export default function BookmakerLink({ name, url, bookmakerKey, className }: BookmakerLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group flex items-center gap-2 transition hover:text-sky-300 ${className ?? ""}`}
      >
        <BookmakerIcon bookmakerKey={bookmakerKey} size={16} />
        <span className="font-medium underline-offset-2 group-hover:underline">{name}</span>
        <svg className="h-3 w-3 text-white/30 transition group-hover:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
      {open && (
        <RedirectWarningModal isOpen={true} onClose={() => setOpen(false)} bookmakerName={name} url={url} />
      )}
    </>
  );
}
