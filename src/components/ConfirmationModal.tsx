"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, Archive, RotateCcw, X, ShieldAlert, Loader2 } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  itemName?: string;
  itemDetails?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  actionType?: "delete" | "archive" | "reset" | "major";
  isProcessing?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemDetails,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  destructive = true,
  actionType = "delete",
  isProcessing = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (actionType) {
      case "archive":
        return <Archive className="h-6 w-6 text-amber-400" />;
      case "reset":
        return <RotateCcw className="h-6 w-6 text-indigo-400" />;
      case "delete":
      default:
        return destructive ? (
          <Trash2 className="h-6 w-6 text-rose-400" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={() => !isProcessing && onClose()}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-[#0d121f] p-6 text-left shadow-2xl transition-all animate-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-40"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${
              destructive
                ? "border-rose-500/30 bg-rose-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}
          >
            {renderIcon()}
          </div>
          <div className="flex-1 pr-4">
            <h3
              id="confirmation-modal-title"
              className="text-lg font-bold tracking-tight text-white"
            >
              {title}
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Affected Item Details Banner */}
        {itemName && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Target Record
            </div>
            <p className="mt-0.5 font-bold text-white truncate">{itemName}</p>
            {itemDetails && (
              <p className="mt-1 text-[11px] text-slate-400">{itemDetails}</p>
            )}
          </div>
        )}

        {/* Warning Indicator */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <span>
            {destructive
              ? "This destructive action cannot be undone."
              : "Please verify before proceeding to prevent unintended changes."}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition disabled:opacity-50 ${
              destructive
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/30"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30"
            }`}
          >
            {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
