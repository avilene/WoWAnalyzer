import { Section } from 'interface/guide';

export function IntroSection() {
  return (
    <Section title="Preface">
      <p>
        Hello and welcome to the analyzer for the Devastation Evoker spec! All the theorycrafting
        comes from summarizing the guides over at{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/devastation/overview-pve-dps">
          Wowhead
        </a>
        , <a href="https://www.icy-veins.com/wow/devastation-evoker-pve-dps-guide">Icy Veins</a>,{' '}
        <a href="https://jereico.com/devastation-evoker-guide/">Jereico's Evoker Compendium</a> and{' '}
        <a href="https://discord.com/invite/evoker">Evoker Discord</a>.
      </p>
      <p>
        The accuracy and problems pointed out here are <b>guidelines</b> and don't factor in raid
        conditions or edge cases. To find a good measure of success, you should compare your results
        to other top Evokers in the same fight with Warcraft Logs (e.g{' '}
        <a href="https://www.warcraftlogs.com/zone/rankings/31#boss=2639&class=Evoker&spec=Devastation">
          Mythic Terros Top 100
        </a>
        ).
      </p>
      <p>
        If you have any questions, corrections, complaints, or want to help, I'm happy to talk over
        at <code>#devastation</code> in the{' '}
        <a href="https://discord.com/invite/evoker">Evoker Discord</a>.
      </p>
    </Section>
  );
}
