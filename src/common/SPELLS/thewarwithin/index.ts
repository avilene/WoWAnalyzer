import safeMerge from 'common/safeMerge';
import Enchants from './enchants';
import Embellishments from './embellishments';
import Others from './others';
import Raids from './raids';
import Trinkets from './trinkets';
import Flasks from './flasks';

const spells = safeMerge(Enchants, Embellishments, Others, Raids, Trinkets, Flasks);

export default spells;
