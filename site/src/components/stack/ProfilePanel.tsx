'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CATALOG } from '@/stack/catalog';
import type { SkillLevel, UserProfile } from '@/stack/domain/types';

const LEVELS: SkillLevel[] = ['master', 'know', 'never'];

const SHOWN_WITHOUT_FILTER = 12;

interface Props {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function ProfilePanel({ profile, onChange }: Props) {
  const t = useTranslations('Stack.profile');
  const [filter, setFilter] = useState('');

  const options = useMemo(() => CATALOG.filter((x) => !x.isNone), []);
  const query = filter.trim().toLowerCase();
  const visible = query
    ? options.filter((x) => x.name.toLowerCase().includes(query))
    : options.slice(0, SHOWN_WITHOUT_FILTER);

  const setSkill = (id: string, level: SkillLevel | '') => {
    const skills = { ...profile.skills };
    if (level === '') delete skills[id];
    else skills[id] = level;
    onChange({ ...profile, skills });
  };

  const togglePaying = (id: string, paying: boolean) => {
    const rest = profile.alreadyPaying.filter((x) => x !== id);
    onChange({ ...profile, alreadyPaying: paying ? [...rest, id] : rest });
  };

  const count = Object.keys(profile.skills).length + profile.alreadyPaying.length;

  return (
    <details className="rounded-card border border-rule bg-surface p-4">
      <summary className="cursor-pointer text-sm font-medium text-ink">
        {t('title')} {count > 0 && <span className="text-muted">({count})</span>}
      </summary>
      <p className="mt-2 text-xs text-muted">
        {t('intro')}
      </p>
      <label htmlFor="profile-filter" className="sr-only">
        {t('search')}
      </label>
      <input
        id="profile-filter"
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="mt-3 w-full rounded-control border border-rule-strong bg-surface px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-accent"
      />
      <ul className="mt-3 space-y-2">
        {visible.map((tech) => (
          <li key={tech.id} className="flex flex-col gap-1 text-sm">
            <span className="text-ink">{tech.name}</span>
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label={t('levelFor', { name: tech.name })}
                value={profile.skills[tech.id] ?? ''}
                onChange={(e) => setSkill(tech.id, e.target.value as SkillLevel | '')}
                className="rounded-control border border-rule-strong bg-surface px-2 py-1 text-xs text-ink"
              >
                <option value="">{t('unmarked')}</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t(`level.${level}`)}
                  </option>
                ))}
              </select>
              {tech.cost !== 'free' && (
                <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    checked={profile.alreadyPaying.includes(tech.id)}
                    onChange={(e) => togglePaying(tech.id, e.target.checked)}
                    className="size-3.5 accent-accent"
                  />
                  {t('alreadyPaying')}
                </label>
              )}
            </div>
          </li>
        ))}
      </ul>
      {query === '' && options.length > SHOWN_WITHOUT_FILTER && (
        <p className="mt-2 text-xs text-muted">
          {t('showing', { shown: SHOWN_WITHOUT_FILTER, total: options.length })}
        </p>
      )}
      {query !== '' && visible.length === 0 && (
        <p className="mt-2 text-xs text-muted">{t('noMatch')}</p>
      )}
    </details>
  );
}
