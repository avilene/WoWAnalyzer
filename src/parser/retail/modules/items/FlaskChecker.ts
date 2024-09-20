import SPELLS from 'common/SPELLS/thewarwithin/flasks';
import BaseFlaskChecker from 'parser/shared/modules/items/FlaskChecker';

// TODO: Determine how we can tell if a phial was R1 or R2
const MIN_FLASK_IDS: number[] = [
];

const MAX_FLASK_IDS: number[] = [
  SPELLS.FLASK_OF_ALCHEMICAL_CHAOS.id,
  SPELLS.FLASK_OF_SAVING_GRACES.id,
  SPELLS.FLASK_OF_TEMPERED_AGGRESSION.id,
  SPELLS.FLASK_OF_TEMPERED_MASTERY.id,
  SPELLS.FLASK_OF_TEMPERED_SWIFTNESS.id,
  SPELLS.FLASK_OF_TEMPERED_VERSATILITY.id
];

class FlaskChecker extends BaseFlaskChecker {
  get MinFlaskIds(): number[] {
    return MIN_FLASK_IDS;
  }

  get MaxFlaskIds(): number[] {
    return MAX_FLASK_IDS;
  }
}

export default FlaskChecker;
