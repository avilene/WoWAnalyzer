import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import {
  calculateEffectiveDamage,
  calculateEffectiveDamageFromCritIncrease,
} from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import HIT_TYPES from 'game/HIT_TYPES';

import { MASTERMIND_CRIT_CHANCE_PER_RANK } from '../../constants';
import { MASTERMIND_CRIT_DAMAGE_PER_RANK } from '../../constants';

class Mastermind extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  damage = 0;
  buffStacks = 0;

  mastermindCritChance =
    MASTERMIND_CRIT_CHANCE_PER_RANK *
    this.selectedCombatant.getTalentRank(TALENTS.MASTERMIND_TALENT); //increase in crit chance
  mastermindCritDamage =
    MASTERMIND_CRIT_DAMAGE_PER_RANK *
    this.selectedCombatant.getTalentRank(TALENTS.MASTERMIND_TALENT); //increase in crit damage

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MASTERMIND_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.onSpell);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onSpell,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY), this.onSpell);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.MIND_SPIKE_TALENT),
      this.onSpell,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.onSpell,
    );
  }

  onSpell(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      //only crit events should be sent to effectiveDamageFromCritIncrease,

      this.damage += calculateEffectiveDamageFromCritIncrease(
        //Extra damage from having extra crit chance
        event,
        this.statTracker.currentCritPercentage,
        this.mastermindCritChance,
      );

      //Extra damage from having extra crit damage increase
      //The increase in crit damage increases amount of extra damage critical hits do (in this case, from 100% to 120% or 140%, depending on talent ranks)
      //so the while it increases the critical damage by 20% or 40%, it only increases the total damage of the event by half that amount
      this.damage += calculateEffectiveDamage(event, this.mastermindCritDamage / 2);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="This is the damage gained from the critical chance and damage increase"
      >
        <BoringSpellValueText spell={TALENTS.MASTERMIND_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Mastermind;
