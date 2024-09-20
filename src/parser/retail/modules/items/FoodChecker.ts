import SPELLS from 'common/SPELLS/thewarwithin/food';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';

const LOWER_FOOD_IDS: number[] = [
];

const MID_TIER_FOOD_IDS: number[] = [
];

const HIGHER_FOOD_IDS: number[] = [
  SPELLS.HEARTY_SUSHI_SPECIAL_STAMINA.id,
  SPELLS.HEARTY_SUSHI_SPECIAL_HASTE.id,
].filter((id) => id !== 0);

class FoodChecker extends BaseFoodChecker {
  get lowerFoodIds(): number[] {
    return LOWER_FOOD_IDS;
  }

  get midFoodIds(): number[] {
    return MID_TIER_FOOD_IDS;
  }

  get highFoodIds(): number[] {
    return HIGHER_FOOD_IDS;
  }
}
export default FoodChecker;
