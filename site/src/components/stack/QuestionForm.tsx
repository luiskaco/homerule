'use client';

import { useTranslations } from 'next-intl';
import { PROJECT_TYPES } from '@/stack/domain/project-types';
import type { Budget, HostingPreference, ProjectAnswers, Scale, SeoLevel } from '@/stack/domain/types';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  name: string;
  legend: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ name, legend, value, options, onChange }: SegmentedProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-ink-soft">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="cursor-pointer rounded-control border border-rule-strong bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-accent-fg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const FEATURE_FIELDS = ['needsUsers', 'needsPayments', 'needsFiles', 'needsEmail', 'needsAI', 'realtime'] as const;

interface Props {
  answers: ProjectAnswers;
  onChange: (answers: ProjectAnswers) => void;
}

export function QuestionForm({ answers, onChange }: Props) {
  const t = useTranslations('Stack.form');
  const set = <K extends keyof ProjectAnswers>(key: K, value: ProjectAnswers[K]) =>
    onChange({ ...answers, [key]: value });

  const selected = PROJECT_TYPES.find((p) => p.id === answers.type);

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()} aria-label={t('ariaLabel')}>
      <div>
        <label htmlFor="project-type" className="mb-1.5 block text-sm font-medium text-ink-soft">
          {t('type')}
        </label>
        <select
          id="project-type"
          value={answers.type}
          onChange={(e) => set('type', e.target.value as ProjectAnswers['type'])}
          className="w-full rounded-control border border-rule-strong bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          {PROJECT_TYPES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {selected && <p className="mt-1.5 text-xs text-muted">{selected.description}</p>}
      </div>

      <Segmented<Scale>
        name="scale"
        legend={t('stage')}
        value={answers.scale}
        onChange={(v) => set('scale', v)}
        options={[
          { value: 'prototype', label: t('scale.prototype') },
          { value: 'product', label: t('scale.product') },
        ]}
      />

      <Segmented<SeoLevel>
        name="seo"
        legend={t('seo')}
        value={answers.seo}
        onChange={(v) => set('seo', v)}
        options={[
          { value: 'none', label: t('seoLevel.none') },
          { value: 'useful', label: t('seoLevel.useful') },
          { value: 'critical', label: t('seoLevel.critical') },
        ]}
      />

      <Segmented<HostingPreference>
        name="hosting"
        legend={t('hosting')}
        value={answers.hosting}
        onChange={(v) => set('hosting', v)}
        options={[
          { value: 'serverless', label: t('hostingOption.serverless') },
          { value: 'own-server', label: t('hostingOption.ownServer') },
          { value: 'any', label: t('hostingOption.any') },
        ]}
      />

      <Segmented<Budget>
        name="budget"
        legend={t('budget')}
        value={answers.budget}
        onChange={(v) => set('budget', v)}
        options={[
          { value: 'free', label: t('budgetOption.free') },
          { value: 'low', label: t('budgetOption.low') },
          { value: 'flexible', label: t('budgetOption.flexible') },
        ]}
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-soft">{t('needs')}</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {FEATURE_FIELDS.map((key) => {
            const forced = key === 'needsAI' && answers.type === 'ai-app';
            return (
              <label key={key} className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={forced || answers[key]}
                  disabled={forced}
                  onChange={(e) => set(key, e.target.checked)}
                  className="size-4 rounded border-rule-strong accent-accent"
                />
                {t(`feature.${key}`)}
              </label>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}
