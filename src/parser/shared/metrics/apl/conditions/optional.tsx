import * as React from 'react';

import { Condition } from '../index';

/**
   Convert another condition into an optional (positive-only) condition.

   If the `interior` condition matches *and* the spell cast matches the one on
   the rule, then we use this rule. Otherwise, this rule is ignored.

   This is useful for conditions that are difficult or impossible to
   automatically validate.

   For example: in the Brewmaster APL it is correct to cast SCK instead of TP
   even on single target if you're running the WWWTO conduit and doing so would
   get you an extra Invoke Niuzao cast that would occur while you're taking
   damage. Good luck determining whether that condition holds automatically.
**/
export default function optional<T>(
  interior: Condition<T>,
  description?: React.ReactChild,
  showOptional: boolean = true,
): Condition<T> {
  return {
    ...interior,
    key: `optional-${interior.key}`,
    validate: (state, event, spell, lookahead) =>
      spell.id === event.ability.guid && interior.validate(state, event, spell, lookahead),
    describe: (tense) => (
      <>
        {interior.describe(tense)} {showOptional && '(optional)'}
      </>
    ),
    tooltip: () => description,
  };
}