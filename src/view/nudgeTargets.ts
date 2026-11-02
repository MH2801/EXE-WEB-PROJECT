import type { TripState } from '../core/trip';

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
