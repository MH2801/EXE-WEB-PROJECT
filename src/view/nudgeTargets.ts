import type { TripState } from '../core/trip';
import type { OnboardingStep } from '../core/tripSave';

/**
 * What the nudge hand may point at now, as names the Trip scene already places: `rooms.center(name)`, or
 * `cards.center(word)` for `card_<word>`. Rule 5 (addendum 5.2): a choice is swept whole, never the right answer alone.
 */
export function nudgeTargets(s: TripState): string[] {
  const r = s.trip.rooms[s.room];
  switch (s.phase) {
    case 'fork':
      return r?.kind === 'fork' && r.safeOpen ? ['door_safe', 'door_mystery'] : ['door_mystery'];
    case 'teach':
      // All three stalls, marked ones too: dropping them would narrow the sweep toward the answer.
      return s.teach ? ['book_word', ...s.teach.stalls.map((f) => `stall_${f}`)] : [];
    case 'asking':
      return ['yes', 'no'];
    case 'gate':
    case 'robot':
      // The last card left is the answer, so it gets no hand.
      return s.hand.length >= 2 ? s.hand.map((w) => `card_${w}`) : [];
    default:
      return [];
  }
}

/** The first-time verb (addendum 6) a target, or a tap on it, practises. One step per group of options, so a learned step never splits a choice. */
export function nudgeStep(s: TripState, name: string): OnboardingStep | null {
  const r = s.trip.rooms[s.room];
  if (name.startsWith('door_')) return r?.kind === 'fork' && r.safeOpen ? 'fork' : 'mysteryDoor';
  if (name.startsWith('stall_')) return 'stall';
  if (name.startsWith('card_')) return s.phase === 'gate' ? 'card' : 'robotCard';
  return name === 'book_word' ? 'book' : name === 'yes' || name === 'no' ? 'yesNo' : null;
}
