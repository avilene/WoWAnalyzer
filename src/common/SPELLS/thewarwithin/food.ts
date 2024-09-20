import Spell from '../Spell';

const spells = {

  // region Hearty Food
  HEARTY_SUSHI_SPECIAL_HASTE: {
    id: 462180,
    name: 'Hearty Sushi Special: Haste',
    icon: 'inv_tradeskill_cooking_feastofthewater',
  },
  HEARTY_SUSHI_SPECIAL_STAMINA: {
    id: 454188,
    name: 'Hearty Sushi Special: Stamina',
    icon: 'inv_tradeskill_cooking_feastofthewater',
  },

  // endregion
  
} satisfies Record<string, Spell>;

export default spells;
