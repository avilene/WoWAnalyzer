import TALENTS from 'common/TALENTS/warlock';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  or,
  buffPresent,
  describe,
  hasResource,
  spellAvailable,
  spellCooldownRemaining,
} from 'parser/shared/metrics/apl/conditions';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/warlock';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

// const willNotCapDC = buffStacks(SPELLS.DEMONIC_CORE_BUFF, { atMost: 2 });
const canCastMaxHOG = hasResource(RESOURCE_TYPES.SOUL_SHARDS, { atLeast: 3 });
const canSummonTyrant = spellAvailable(SPELLS.SUMMON_DEMONIC_TYRANT);
const canSummonTyrantSoon = spellCooldownRemaining(SPELLS.SUMMON_DEMONIC_TYRANT, { atMost: 10000 });

const canTyrant = describe(or(canSummonTyrant, canSummonTyrantSoon), () => (
  <>
    <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} /> is (soon) available
  </>
));

// const npOnCD = spellCooldownRemaining(TALENTS.NETHER_PORTAL_TALENT, {atLeast: 80000});
const netherPortalBuffSoonOut = describe(buffPresent(SPELLS.NETHER_PORTAL_BUFF, 5000), () => (
  <>
    <SpellLink spell={TALENTS.NETHER_PORTAL_TALENT} /> has 5 seconds remaining
  </>
));

// const shouldVileFiend = and(
//   or(canSummonTyrant, canSummonTyrantSoon)
//   )

// const hasImps = hasPets(WILD_IMP, {atLeast: 2});

export const apl = (info: PlayerInfo): Apl => {
  const combatant = info.combatant;
  const rules: Rule[] = [];

  if (combatant.hasTalent(TALENTS.NETHER_PORTAL_TALENT)) {
    rules.push({
      spell: TALENTS.NETHER_PORTAL_TALENT,
      condition: canTyrant,
    });
  }

  rules.push({
    spell: SPELLS.SUMMON_DEMONIC_TYRANT,
    condition: netherPortalBuffSoonOut,
  });

  if (combatant.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT)) {
    rules.push({
      spell: TALENTS.SUMMON_VILEFIEND_TALENT,
      condition: canTyrant,
    });

    rules.push({
      spell: TALENTS.SUMMON_VILEFIEND_TALENT,
      condition: spellCooldownRemaining(SPELLS.SUMMON_DEMONIC_TYRANT, { atLeast: 45000 }),
    });
  }

  if (combatant.hasTalent(TALENTS.CALL_DREADSTALKERS_TALENT)) {
    rules.push(TALENTS.CALL_DREADSTALKERS_TALENT);
  }

  // rules.push({
  //   spell: TALENTS.DEMONBOLT_TALENT,
  //   condition: buffPresent(SPELLS.DEMONIC_CORE_BUFF),
  // });

  // rules.push({
  //   spell: SPELLS.SHADOW_BOLT_DEMO,
  //   condition: buffMissing(SPELLS.DEMONIC_CORE_BUFF),
  // });

  rules.push({
    spell: SPELLS.HAND_OF_GULDAN_CAST,
    condition: and(canCastMaxHOG, spellAvailable(TALENTS.NETHER_PORTAL_TALENT, true)),
  });

  // if (combatant.hasTalent(TALENTS.DOOM_WINDS_TALENT)) {
  //   rules.push({
  //     spell: TALENTS.ELEMENTAL_BLAST_TALENT,
  //     condition: atLeastFiveMSW,
  //   });
  //   if (!combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT)) {
  //     rules.push({
  //       spell: TALENTS.LAVA_BURST_TALENT,
  //       condition: atLeastFiveMSW,
  //     });
  //   }
  //   rules.push({
  //     spell: SPELLS.LIGHTNING_BOLT,
  //     condition: combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT)
  //       ? atLeastFiveMSW
  //       : maxStacksMSW,
  //   });
  // } else {
  //   rules.push(
  //     {
  //       spell: TALENTS.ELEMENTAL_BLAST_TALENT,
  //       condition: and(
  //         atLeastFiveMSW,
  //         spellCharges(TALENTS.ELEMENTAL_BLAST_TALENT, { atLeast: 2, atMost: 2 }),
  //       ),
  //     },
  //     {
  //       spell: SPELLS.LIGHTNING_BOLT,
  //       condition: and(atLeastFiveMSW, buffPresent(SPELLS.PRIMORDIAL_WAVE_BUFF)),
  //     },
  //     {
  //       spell: TALENTS.CHAIN_LIGHTNING_TALENT,
  //       condition: and(atLeastFiveMSW, buffPresent(SPELLS.CRACKLING_THUNDER_TIER_BUFF)),
  //     },
  //     {
  //       spell: TALENTS.ELEMENTAL_BLAST_TALENT,
  //       condition: and(
  //         atLeastFiveMSW,
  //         describe(
  //           or(
  //             buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
  //             buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
  //             buffPresent(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
  //           ),
  //           () => (
  //             <>
  //               any <SpellLink spell={TALENTS.ELEMENTAL_SPIRITS_TALENT} /> active
  //             </>
  //           ),
  //         ),
  //       ),
  //     },
  //     {
  //       spell: SPELLS.LIGHTNING_BOLT,
  //       condition: maxStacksMSW,
  //     },
  //   );
  // }

  // if (combatant.hasTalent(TALENTS.ICE_STRIKE_TALENT)) {
  //   rules.push({
  //     spell: TALENTS.ICE_STRIKE_TALENT,
  //     condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
  //   });
  // }
  // if (combatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT)) {
  //   rules.push({
  //     spell: TALENTS.CRASH_LIGHTNING_TALENT,
  //     condition: buffPresent(TALENTS.DOOM_WINDS_TALENT),
  //   });
  // }

  // rules.push(
  //   {
  //     spell: SPELLS.FLAME_SHOCK,
  //     condition: debuffMissing(SPELLS.FLAME_SHOCK),
  //   },
  //   {
  //     spell: TALENTS.FROST_SHOCK_TALENT,
  //     condition: buffPresent(SPELLS.HAILSTORM_BUFF),
  //   },
  //   TALENTS.LAVA_LASH_TALENT,
  //   TALENTS.ICE_STRIKE_TALENT,
  // );

  // if (!combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
  //   rules.push(TALENTS.STORMSTRIKE_TALENT);
  // }

  // if (combatant.hasTalent(TALENTS.HAILSTORM_TALENT)) {
  //   rules.push({
  //     spell: SPELLS.LIGHTNING_BOLT,
  //     condition: describe(and(atLeastFiveMSW, buffMissing(TALENTS.HAILSTORM_TALENT)), () => (
  //       <>
  //         you have at least 5 <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks to generate{' '}
  //         <SpellLink spell={TALENTS.HAILSTORM_TALENT} />
  //       </>
  //     )),
  //   });
  // }

  // rules.push(TALENTS.FROST_SHOCK_TALENT);

  // if (combatant.hasTalent(TALENTS.CRASH_LIGHTNING_TALENT)) {
  //   rules.push(TALENTS.CRASH_LIGHTNING_TALENT);
  // }

  // if (
  //   !combatant.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT) &&
  //   !combatant.hasTalent(TALENTS.HAILSTORM_TALENT)
  // ) {
  //   rules.push({
  //     spell: SPELLS.LIGHTNING_BOLT,
  //     condition: atLeastFiveMSW,
  //   });
  // }

  return build(rules);
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
