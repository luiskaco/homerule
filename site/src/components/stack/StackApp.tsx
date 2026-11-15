'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LAYERS } from '@/stack/domain/layers';
import type { LayerId, ManualSelection, ProjectAnswers, UserProfile } from '@/stack/domain/types';
import { evaluateSelection, layerOptions } from '@/stack/engine/assemble';
import { buildManualAgentsBlock, buildManualDecisionRecord, unverifiedManualNames } from '@/stack/engine/export';
import { activeLayers, normalizeAnswers, recommend } from '@/stack/engine/recommend';
import { ExportPanel } from './ExportPanel';
import { LayerPicker } from './LayerPicker';
import { StackSummary } from './StackSummary';
import { SuggestDialog } from './SuggestDialog';
import {
  DEFAULT_ANSWERS,
  EMPTY_BUILD,
  EMPTY_PROFILE,
  loadAnswers,
  loadBuild,
  loadProfile,
  saveAnswers,
  saveBuild,
  saveProfile,
  type Origin,
} from './storage';

type Origins = Partial<Record<LayerId, Origin>>;

export function StackApp() {
  const t = useTranslations('Stack.app');
  // El servidor no tiene localStorage: se arranca con los valores por defecto y se
  // leen los guardados al montar, para que el HTML de servidor y el del cliente coincidan.
  const [hydrated, setHydrated] = useState(false);
  const [answers, setAnswers] = useState<ProjectAnswers>(DEFAULT_ANSWERS);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [selection, setSelection] = useState<ManualSelection>(EMPTY_BUILD.selection);
  const [origins, setOrigins] = useState<Origins>(EMPTY_BUILD.origins);
  const [useContext, setUseContext] = useState(EMPTY_BUILD.useContext);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const build = loadBuild();
    setAnswers(loadAnswers());
    setProfile(loadProfile());
    setSelection(build.selection);
    setOrigins(build.origins);
    setUseContext(build.useContext);
    setHydrated(true);
  }, []);

  // Sin esperar a hidratar, el primer guardado pisaría lo del navegador con los valores por defecto.
  useEffect(() => {
    if (hydrated) saveAnswers(answers);
  }, [hydrated, answers]);
  useEffect(() => {
    if (hydrated) saveProfile(profile);
  }, [hydrated, profile]);
  useEffect(() => {
    if (hydrated) saveBuild({ selection, origins, useContext });
  }, [hydrated, selection, origins, useContext]);

  const context = useContext ? answers : undefined;

  const pick = (layer: LayerId, value: string | null) => {
    setSelection((current) => ({ ...current, [layer]: value }));
    setOrigins((current) => ({ ...current, [layer]: 'user' }));
  };

  const clear = (layer: LayerId) => {
    setSelection(({ [layer]: _removed, ...rest }) => rest);
    setOrigins(({ [layer]: _removed, ...rest }) => rest);
  };

  const reset = () => {
    setSelection({});
    setOrigins({});
    setUseContext(false);
  };

  // Rellena solo las capas que no decidió la persona; lo que eligió a mano guía al resto.
  const suggest = () => {
    const owned = LAYERS.filter((l) => origins[l.id] === 'user' && selection[l.id] !== undefined);
    const pinned: Partial<Record<LayerId, string>> = {};
    for (const layer of owned) {
      const value = selection[layer.id];
      if (typeof value === 'string') pinned[layer.id] = value;
    }

    const recommendation = recommend(answers, { profile, pinned });
    const nextSelection: ManualSelection = {};
    const nextOrigins: Origins = {};

    for (const layer of owned) {
      nextSelection[layer.id] = selection[layer.id];
      nextOrigins[layer.id] = 'user';
    }
    for (const result of recommendation.layers) {
      if (nextOrigins[result.layer.id] === 'user' || !result.chosen) continue;
      nextSelection[result.layer.id] = result.chosen.tech.id;
      nextOrigins[result.layer.id] = 'suggested';
    }

    setSelection(nextSelection);
    setOrigins(nextOrigins);
    setUseContext(true);
    setDialogOpen(false);
  };

  const evaluation = useMemo(
    () => evaluateSelection(selection, { answers: context, allLayers: true }),
    [selection, context],
  );

  const relevantIds = useMemo(
    () => (context ? new Set(activeLayers(normalizeAnswers(context)).map((l) => l.id)) : null),
    [context],
  );

  const date = new Date().toISOString().slice(0, 10);
  const agentsBlock = useMemo(() => buildManualAgentsBlock(evaluation, date, context), [evaluation, date, context]);
  const decisionRecord = useMemo(
    () => buildManualDecisionRecord(evaluation, date, context),
    [evaluation, date, context],
  );

  const unverified = unverifiedManualNames(evaluation).length;
  const chosen = evaluation.layers.filter((l) => l.status === 'chosen' || l.status === 'none').length;
  const problems = evaluation.warnings.filter((w) => w.severity === 'warning').length;

  return (
    <div className="stack-chooser rounded-card pb-20 lg:pb-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-sm text-ink-soft">{t('intro')}</p>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-control bg-accent px-3 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          {t('suggest')}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {useContext && (
            <p className="rounded-control border border-rule bg-sunken px-3 py-2 text-sm text-ink-soft">
              {t('contextNotice')}{' '}
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="rounded-control text-accent-ink underline underline-offset-2"
              >
                {t('changeAnswers')}
              </button>
            </p>
          )}

          {LAYERS.map((layer) => (
            <LayerPicker
              key={layer.id}
              layer={layer}
              options={layerOptions(layer.id, selection, { answers: context })}
              value={selection[layer.id]}
              origin={origins[layer.id]}
              relevant={relevantIds === null || relevantIds.has(layer.id)}
              onPick={(value) => pick(layer.id, value)}
              onClear={() => clear(layer.id)}
            />
          ))}

          <section id="exportar" aria-labelledby="export-title" className="scroll-mt-24">
            <h2
              id="export-title"
              className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.06em] text-muted"
            >
              {t('exportTitle')}
            </h2>
            <ExportPanel agentsBlock={agentsBlock} decisionRecord={decisionRecord} />
          </section>

          <p className="text-xs text-muted">{t('footnote')}</p>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <StackSummary evaluation={evaluation} origins={origins} unverified={unverified} onReset={reset} />
        </aside>
      </div>

      <a
        href="#resumen"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-rule bg-surface px-4 py-3 text-sm lg:hidden"
      >
        <span className="text-ink-soft">{t('bar', { layers: chosen, warnings: problems })}</span>
        <span className="font-medium text-accent-ink">{t('viewStack')}</span>
      </a>

      <SuggestDialog
        open={dialogOpen}
        answers={answers}
        profile={profile}
        onAnswers={setAnswers}
        onProfile={setProfile}
        onConfirm={suggest}
        onCancel={() => setDialogOpen(false)}
      />
    </div>
  );
}
