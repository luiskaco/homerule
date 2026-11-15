'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectAnswers, UserProfile } from '@/stack/domain/types';
import { ProfilePanel } from './ProfilePanel';
import { QuestionForm } from './QuestionForm';

interface Props {
  open: boolean;
  answers: ProjectAnswers;
  profile: UserProfile;
  onAnswers: (answers: ProjectAnswers) => void;
  onProfile: (profile: UserProfile) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Diálogo con las preguntas del proyecto. Rellena solo lo que no elegiste vos. */
export function SuggestDialog({ open, answers, profile, onAnswers, onProfile, onConfirm, onCancel }: Props) {
  const t = useTranslations('Stack.dialog');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      aria-labelledby="suggest-title"
      className="m-auto max-h-[90vh] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-rule bg-paper p-0 text-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h2 id="suggest-title" className="text-lg font-semibold tracking-tight">
            {t('title')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {t('intro')}
          </p>
        </div>

        <QuestionForm answers={answers} onChange={onAnswers} />
        <ProfilePanel profile={profile} onChange={onProfile} />

        <div className="flex flex-wrap justify-end gap-2 border-t border-rule pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-control border border-rule-strong px-3 py-2 text-sm text-ink-soft hover:border-accent"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-control bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
