'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Cost, LayerDef } from '@/stack/domain/types';
import type { OptionState, SelectionWarning } from '@/stack/engine/assemble';
import type { Origin } from './storage';

const NONE_VALUE = '__none__';

const hasProblem = (warnings: SelectionWarning[]) => warnings.some((w) => w.severity === 'warning');

function Tag({ tone, children }: { tone: 'neutral' | 'ok' | 'warn' | 'accent'; children: React.ReactNode }) {
  const tones = {
    neutral: 'border-rule-strong text-muted',
    ok: 'border-transparent bg-ok-soft text-ok',
    warn: 'border-transparent bg-warn-soft text-warn',
    accent: 'border-transparent bg-accent-soft text-accent-ink',
  } as const;
  return (
    <span
      className={`inline-block rounded-control border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Detail({ option }: { option: OptionState }) {
  const t = useTranslations('Stack.picker');
  const { tech, warnings } = option;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-ink">{tech.name}</p>
        <Tag tone="neutral">{t(`cost.${tech.cost satisfies Cost}`)}</Tag>
        {tech.verifiedAt ? <Tag tone="ok">{t('verified')}</Tag> : <Tag tone="warn">{t('unverified')}</Tag>}
        {tech.isNone && <Tag tone="neutral">{t('builtIn')}</Tag>}
      </div>
      <p className="text-sm text-ink-soft">{tech.solves}</p>
      {tech.avoidWhen.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted">
          {tech.avoidWhen.map((text) => (
            <li key={text}>{t('avoidIf')} {text}</li>
          ))}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="space-y-1 text-sm">
          {warnings.map((w) => (
            <li key={`${w.kind}-${w.message}`} className={w.severity === 'warning' ? 'text-warn' : 'text-muted'}>
              <span className="font-medium">{w.severity === 'warning' ? t('warningPrefix') : t('notePrefix')}</span>
              {w.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props {
  layer: LayerDef;
  options: OptionState[];
  /** `undefined` = sin elegir · `null` = "no uso nada" · string = id de la tecnología. */
  value: string | null | undefined;
  origin: Origin | undefined;
  /** false = las respuestas del proyecto indican que esta capa no hace falta. */
  relevant: boolean;
  onPick: (value: string | null) => void;
  onClear: () => void;
}

export function LayerPicker({ layer, options, value, origin, relevant, onPick, onClear }: Props) {
  const t = useTranslations('Stack.picker');
  const groupId = useId();
  const [inspected, setInspected] = useState<string | null>(null);

  const shownId = inspected ?? (typeof value === 'string' ? value : null);
  const shown = options.find((o) => o.tech.id === shownId);
  const radioValue = value === undefined ? '' : value === null ? NONE_VALUE : value;

  const chip =
    'inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-control border border-rule-strong bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-accent-fg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent';

  return (
    <section
      aria-labelledby={`${groupId}-title`}
      className={`rounded-card border border-rule bg-surface p-4 ${relevant ? '' : 'opacity-70'}`}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            id={`${groupId}-title`}
            className="font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted"
          >
            {layer.label}
          </h3>
          {!relevant && <Tag tone="neutral">{t('notNeeded')}</Tag>}
          {value !== undefined && origin === 'user' && <Tag tone="accent">{t('chosenByYou')}</Tag>}
          {value !== undefined && origin === 'suggested' && <Tag tone="neutral">{t('suggested')}</Tag>}
        </div>
        {value !== undefined && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-control px-1 text-sm text-muted underline underline-offset-2 hover:text-ink"
          >
            {t('clear')}
          </button>
        )}
      </header>

      <div role="radiogroup" aria-label={layer.label} className="flex flex-wrap gap-2">
        <label className={`${chip} border-dashed`}>
          <input
            type="radio"
            name={groupId}
            value={NONE_VALUE}
            checked={radioValue === NONE_VALUE}
            onChange={() => onPick(null)}
            className="sr-only"
          />
          {t('none')}
        </label>
        {options.map((option) => (
          <label
            key={option.tech.id}
            className={`${chip} ${option.tech.isNone ? 'border-dashed' : ''}`}
            onMouseEnter={() => setInspected(option.tech.id)}
            onMouseLeave={() => setInspected(null)}
          >
            <input
              type="radio"
              name={groupId}
              value={option.tech.id}
              checked={radioValue === option.tech.id}
              onChange={() => onPick(option.tech.id)}
              onFocus={() => setInspected(option.tech.id)}
              onBlur={() => setInspected(null)}
              className="sr-only"
            />
            <span className="truncate">{option.tech.name}</span>
            {hasProblem(option.warnings) && (
              <>
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-warn" />
                <span className="sr-only">{t('withWarnings')}</span>
              </>
            )}
          </label>
        ))}
      </div>

      <div className="mt-3 min-h-12 rounded-control bg-sunken p-3" aria-live="polite">
        {shown ? (
          <Detail option={shown} />
        ) : value === null ? (
          <p className="text-sm text-muted">{t('noneInLayer')}</p>
        ) : (
          <p className="text-sm text-muted">{t('hint')}</p>
        )}
      </div>
    </section>
  );
}
