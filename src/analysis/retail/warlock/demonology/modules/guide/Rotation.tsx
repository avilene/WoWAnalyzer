import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import { AplSectionData } from 'interface/guide/components/Apl';
import * as AplCheck from '../apl/AplCheck';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/warlock';

export default function Rotation({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Single Target Rotation">
      <p>
        This single target rotation analyzer is based on a number of sources, including the guides
        at{' '}
        <a
          href="https://www.wowhead.com/guide/classes/warlock/demonology/rotation-cooldowns-pve-dps#single-target"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wowhead
        </a>
        {' and '}
        <a
          href="https://www.icy-veins.com/wow/demonology-warlock-pve-dps-rotation-cooldowns-abilities"
          target="_blank"
          rel="noopener noreferrer"
        >
          Icy Veins
        </a>
        .
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
      <hr />
      <p>
        This list does not include major cooldowns (e.g.{' '}
        <SpellLink spell={TALENTS.SUMMON_DEMONIC_TYRANT_TALENT} />
        , <SpellLink spell={TALENTS.NETHER_PORTAL_TALENT} />,{' '}
        <SpellLink spell={TALENTS.GRIMOIRE_FELGUARD_TALENT} />,{' '}
        <SpellLink spell={TALENTS.SUMMON_VILEFIEND_TALENT} />, etc). Cooldowns may often be held for
        fight mechanics, and appear as common problems which interfere with rotation analysis.
      </p>
      <p>
        This should be used as a reference point for improvement when comparing against other logs.
        It does not cover the full set of priorites used by Raidbots (much like the written guides)
        as the list would be far too long and too complex to follow.
        <br />
        <br />
        Potential areas of inaccuracy:
        <ul>
          <li>Holding cooldowns for raid events</li>
          <li>Multiple targets</li>
          <li>Movement or periods of downtime</li>
        </ul>
      </p>
    </Section>
  );
}
