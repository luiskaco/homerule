import type { Technology } from '../domain/types';

type TechInput = Pick<Technology, 'id' | 'name' | 'layer' | 'types' | 'solves'> &
  Partial<Omit<Technology, 'id' | 'name' | 'layer' | 'types' | 'solves'>>;

/** Completa los campos opcionales para que cada registro sea corto de escribir. */
export function tech(input: TechInput): Technology {
  return {
    traits: [],
    bestFor: [],
    provides: [],
    needs: [],
    conflicts: [],
    excludeWhen: [],
    avoidWhen: [],
    cost: 'free',
    isNone: false,
    verifiedAt: null,
    source: '',
    ...input,
  };
}
