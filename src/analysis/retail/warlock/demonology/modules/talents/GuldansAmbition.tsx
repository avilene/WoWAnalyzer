import { formatNumber, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import DemoPets from '../pets/DemoPets';
import SPELLS from 'common/SPELLS/warlock';

class GuldansAmbition extends Analyzer {
  get pitlords() {
    return this.demoPets.timeline.filter(
      (pet) => pet.summonAbility === SPELLS.GULDANS_AMBITION_PIT_LORD.id,
    );
  }
  get damage() {
    return this.pitlords.map((pet) => this.demoPets.getPetDamage(pet.guid, pet.instance));
  }

  get totalDamage() {
    return this.damage.reduce((total, current) => total + current, 0);
  }

  static dependencies = {
    demoPets: DemoPets,
  };
  demoPets!: DemoPets;
  hasGuldansAmbition!: boolean;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GULDANS_AMBITION_TALENT);
  }

  statistic() {
    const dropdown = (
      <ul>
        {this.damage.map((d, i) => (
          <li key={i}>{`Cast ${i + 1}: ${formatNumber(d)} damage`}</li>
        ))}
      </ul>
    );
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.totalDamage)} damage`}
        dropdown={dropdown}
      >
        <BoringSpellValueText spell={TALENTS.GULDANS_AMBITION_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GuldansAmbition;
