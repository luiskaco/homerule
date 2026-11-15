'use client';

import { useTranslations } from 'next-intl';
import type { SelectionEvaluation } from '@/stack/engine/assemble';
import type { Origin } from './storage';
import type { LayerId } from '@/stack/domain/types';

interface Props {
  evaluation: SelectionEvaluation;
  origins: Partial<Record<LayerId, Origin>>;
  unverified: number;
  onReset: () => void;
}

export function StackSummary({ evaluation, origins, unverified, onReset }: Props) {
  const t = useTranslations('Stack.summary');
  const rows = evaluation.layers.filter((l) => l.status === 'chosen' || l.status === 'none');
  const problems = evaluation.warnings.filter((w) => w.severity === 'warning');
  const notes = evaluation.warnings.filter((w) => w.severity === 'info');
  const byLayer = new Map(evaluation.layers.map((l) => [l.layer.id, l]));

  const label = (layer: LayerId, techId: string) => {
    const l = byLayer.get(layer);
    return `${l?.layer.label ?? layer}${l?.tech && techId ? ` · ${l.tech.name}` : ''}`;
  };

  return (
    <section
      id="resumen"
      aria-labelledby="summary-title"
      className="rounded-card border border-rule bg-surface p-4 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 id="summary-title" className="font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted">
          {t('title')}
        </h2>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-control px-1 text-sm text-muted underline underline-offset-2 hover:text-ink"
          >
            {t('reset')}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          {t('empty')}
        </p>
      ) : (
        <ul className="divide-y divide-rule text-sm">
          {rows.map((l) => (
            <li key={l.layer.id} className="flex items-baseline justify-between gap-3 py-1.5">
              <span className="text-muted">{l.layer.label}</span>
              <span className="min-w-0 text-right font-medium text-ink">
                {l.tech ? l.tech.name : t('none')}
                {origins[l.layer.id] === 'suggested' && <span className="font-normal text-muted"> · {t('suggestedLower')}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div role="status" className="mt-4 space-y-3 text-sm">
        <p className="text-ink-soft">
          {t('count', { layers: rows.length, warnings: problems.length })}
          {unverified > 0 && ` · ${t('unverifiedCount', { count: unverified })}`}
        </p>

        {problems.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-warn">{t('toReview')}</p>
            <ul className="space-y-1 text-ink-soft">
              {problems.map((w) => (
                <li key={`${w.layer}-${w.kind}-${w.message}`}>
                  <span className="text-muted">{label(w.layer, w.techId)}:</span> {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-ink-soft">{t('toKeepInMind')}</p>
            <ul className="space-y-1 text-muted">
              {notes.map((w) => (
                <li key={`${w.layer}-${w.kind}-${w.message}`}>
                  {label(w.layer, w.techId)}: {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <a
        href="#exportar"
        className="mt-4 inline-flex items-center rounded-control bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
      >
        {t('export')}
      </a>
    </section>
  );
}
