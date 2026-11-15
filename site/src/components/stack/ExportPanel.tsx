'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface BlockProps {
  title: string;
  hint: string;
  filename: string;
  content: string;
}

function ExportBlock({ title, hint, filename, content }: BlockProps) {
  const t = useTranslations('Stack.export');
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 2200);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const button =
    'rounded-control border border-rule-strong px-3 py-1.5 text-sm text-ink-soft hover:border-accent hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-accent';

  return (
    <section className="rounded-card border border-rule bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={copy} className={button}>
            {status === 'copied' ? t('copied') : status === 'failed' ? t('copyFailed') : t('copy')}
          </button>
          <button type="button" onClick={download} className={button}>
            {t('download')}
          </button>
        </div>
      </div>
      <textarea
        readOnly
        value={content}
        aria-label={title}
        rows={12}
        className="w-full resize-y rounded-control border border-rule bg-sunken p-3 font-mono text-xs text-ink"
      />
    </section>
  );
}

interface Props {
  agentsBlock: string;
  decisionRecord: string;
}

export function ExportPanel({ agentsBlock, decisionRecord }: Props) {
  const t = useTranslations('Stack.export');
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <ExportBlock
        title={t('agentsTitle')}
        hint={t('agentsHint')}
        filename="stack-agents-block.md"
        content={agentsBlock}
      />
      <ExportBlock
        title={t('adrTitle')}
        hint={t('adrHint')}
        filename="stack-adr.md"
        content={decisionRecord}
      />
    </div>
  );
}
