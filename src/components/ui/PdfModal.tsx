"use client";

import { Modal } from "@/components/ui/Modal";

type Props = {
  open: boolean;
  title: string;
  pdfUrl: string;
  onClose: () => void;
  closeLabel: string;
};

export function PdfModal({ open, title, pdfUrl, onClose, closeLabel }: Props) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-slate-600 bg-slate-900 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 sm:w-auto sm:px-8"
        >
          {closeLabel}
        </button>
      }
    >
      <div className="aspect-[3/4] w-full min-h-[50dvh] bg-black sm:aspect-video sm:min-h-[60dvh]">
        <iframe title={title} src={pdfUrl} className="h-full w-full border-0" />
      </div>
    </Modal>
  );
}
