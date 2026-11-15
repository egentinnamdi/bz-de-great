export interface NigeriaLocationOption {
  value: string;
  label: string;
}

export const DEFAULT_NIGERIA_LOCATION = 'all';
export const NIGERIA_ALL_LOCATION_LABEL = 'All Nigeria';

export const NIGERIA_MAJOR_CITIES: NigeriaLocationOption[] = [
  { value: 'Abuja', label: 'Abuja (FCT)' },
  { value: 'Maitama, Abuja', label: 'Maitama, Abuja' },
  { value: 'Asokoro, Abuja', label: 'Asokoro, Abuja' },
  { value: 'Wuse 2, Abuja', label: 'Wuse 2, Abuja' },
  { value: 'Jabi, Abuja', label: 'Jabi, Abuja' },
  { value: 'Guzape, Abuja', label: 'Guzape, Abuja' },
  { value: 'Gwarinpa, Abuja', label: 'Gwarinpa, Abuja' },
  { value: 'Katampe, Abuja', label: 'Katampe Extension, Abuja' },
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Victoria Island, Lagos', label: 'Victoria Island, Lagos' },
  { value: 'Ikoyi, Lagos', label: 'Ikoyi, Lagos' },
  { value: 'Lekki, Lagos', label: 'Lekki, Lagos' },
  { value: 'Ikeja, Lagos', label: 'Ikeja, Lagos' },
  { value: 'Asaba', label: 'Asaba, Delta' },
  { value: 'Onitsha', label: 'Onitsha, Anambra' },
  { value: 'Port Harcourt', label: 'Port Harcourt, Rivers' },
  { value: 'Enugu', label: 'Enugu' },
  { value: 'Owerri', label: 'Owerri, Imo' },
  { value: 'Ibadan', label: 'Ibadan, Oyo' },
  { value: 'Benin City', label: 'Benin City, Edo' },
  { value: 'Kano', label: 'Kano' },
  { value: 'Kaduna', label: 'Kaduna' },
  { value: 'Uyo', label: 'Uyo, Akwa Ibom' },
  { value: 'Calabar', label: 'Calabar, Cross River' },
];

export const NIGERIA_STATES: NigeriaLocationOption[] = [
  { value: 'Abia State', label: 'Abia' },
  { value: 'Adamawa State', label: 'Adamawa' },
  { value: 'Akwa Ibom State', label: 'Akwa Ibom' },
  { value: 'Anambra State', label: 'Anambra' },
  { value: 'Bauchi State', label: 'Bauchi' },
  { value: 'Bayelsa State', label: 'Bayelsa' },
  { value: 'Benue State', label: 'Benue' },
  { value: 'Borno State', label: 'Borno' },
  { value: 'Cross River State', label: 'Cross River' },
  { value: 'Delta State', label: 'Delta' },
  { value: 'Ebonyi State', label: 'Ebonyi' },
  { value: 'Edo State', label: 'Edo' },
  { value: 'Ekiti State', label: 'Ekiti' },
  { value: 'Enugu State', label: 'Enugu State' },
  { value: 'FCT Abuja', label: 'FCT — Abuja' },
  { value: 'Gombe State', label: 'Gombe' },
  { value: 'Imo State', label: 'Imo' },
  { value: 'Jigawa State', label: 'Jigawa' },
  { value: 'Kaduna State', label: 'Kaduna State' },
  { value: 'Kano State', label: 'Kano State' },
  { value: 'Katsina State', label: 'Katsina' },
  { value: 'Kebbi State', label: 'Kebbi' },
  { value: 'Kogi State', label: 'Kogi' },
  { value: 'Kwara State', label: 'Kwara' },
  { value: 'Lagos State', label: 'Lagos State' },
  { value: 'Nasarawa State', label: 'Nasarawa' },
  { value: 'Niger State', label: 'Niger' },
  { value: 'Ogun State', label: 'Ogun' },
  { value: 'Ondo State', label: 'Ondo' },
  { value: 'Osun State', label: 'Osun' },
  { value: 'Oyo State', label: 'Oyo' },
  { value: 'Plateau State', label: 'Plateau' },
  { value: 'Rivers State', label: 'Rivers' },
  { value: 'Sokoto State', label: 'Sokoto' },
  { value: 'Taraba State', label: 'Taraba' },
  { value: 'Yobe State', label: 'Yobe' },
  { value: 'Zamfara State', label: 'Zamfara' },
];

const LOCATION_ALIASES: Record<string, string[]> = {
  abuja: ['abuja', 'fct', 'maitama', 'asokoro', 'wuse', 'jabi', 'guzape', 'gwarinpa', 'katampe', 'garki', 'central area', 'karmo', 'lugbe'],
  'fct abuja': ['abuja', 'fct', 'maitama', 'asokoro', 'wuse', 'jabi', 'guzape', 'gwarinpa', 'katampe', 'garki', 'central area', 'karmo', 'lugbe'],
  'abuja, fct': ['abuja', 'fct', 'maitama', 'asokoro', 'wuse', 'jabi', 'guzape', 'gwarinpa', 'katampe', 'garki', 'central area', 'karmo', 'lugbe'],
  lagos: ['lagos', 'victoria island', 'ikoyi', 'lekki', 'ajah', 'ikeja', 'yaba', 'surulere', 'banana island', 'eko atlantic'],
  'lagos state': ['lagos', 'victoria island', 'ikoyi', 'lekki', 'ajah', 'ikeja', 'yaba', 'surulere', 'banana island', 'eko atlantic'],
  'delta state': ['delta', 'asaba', 'okpanam', 'warri', 'effurun', 'ughelli'],
  asaba: ['asaba', 'okpanam', 'delta'],
  'anambra state': ['anambra', 'onitsha', 'awka', 'nnewi'],
  onitsha: ['onitsha', 'anambra'],
  'rivers state': ['rivers', 'port harcourt', 'bonny'],
  'port harcourt': ['port harcourt', 'rivers'],
  'oyo state': ['oyo', 'ibadan', 'ogbomoso'],
  ibadan: ['ibadan', 'oyo'],
  'edo state': ['edo', 'benin city', 'benin'],
  'benin city': ['benin city', 'benin', 'edo'],
  'imo state': ['imo', 'owerri', 'orlu'],
  owerri: ['owerri', 'imo'],
  'enugu state': ['enugu', 'nsukka'],
  enugu: ['enugu', 'nsukka'],
  'akwa ibom state': ['akwa ibom', 'uyo', 'eket'],
  uyo: ['uyo', 'akwa ibom'],
  'cross river state': ['cross river', 'calabar'],
  calabar: ['calabar', 'cross river'],
  'kano state': ['kano'],
  'kaduna state': ['kaduna', 'zaria'],
  'abia state': ['abia', 'aba', 'umuahia'],
  'ogun state': ['ogun', 'abeokuta', 'sagamu'],
  'plateau state': ['plateau', 'jos'],
  'kwara state': ['kwara', 'ilorin'],
  'niger state': ['niger', 'minna', 'suleja'],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsWholeTerm(haystack: string, term: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
  return pattern.test(haystack);
}

/**
 * Matches a listing location against the selected nationwide filter value.
 * Supports city, district, and Nigerian state selections with alias expansion.
 */
export function matchesLocationFilter(itemLocation: string, selectedLocation: string): boolean {
  const normalizedSelected = (selectedLocation || '').trim().toLowerCase();
  if (
    !normalizedSelected ||
    normalizedSelected === 'all' ||
    normalizedSelected === 'all nigeria' ||
    normalizedSelected === 'nigeria'
  ) {
    return true;
  }

  const normalizedItem = (itemLocation || '').trim().toLowerCase();
  if (!normalizedItem) return false;

  const aliases = LOCATION_ALIASES[normalizedSelected];
  if (aliases) {
    return aliases.some(alias => containsWholeTerm(normalizedItem, alias));
  }

  const cleanedState = normalizedSelected.endsWith(' state')
    ? normalizedSelected.slice(0, -' state'.length).trim()
    : normalizedSelected;

  if (cleanedState && cleanedState !== normalizedSelected) {
    return containsWholeTerm(normalizedItem, cleanedState);
  }

  return (
    normalizedItem.includes(normalizedSelected) ||
    normalizedSelected.includes(normalizedItem)
  );
}
