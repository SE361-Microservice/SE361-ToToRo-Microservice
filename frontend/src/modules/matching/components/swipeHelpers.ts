import type { RoommateProfileResponse, LifestyleTag } from '../../../types/matching';

/** Derive lifestyle tags from profile data for card display */
export function getLifestyleTags(profile: RoommateProfileResponse): LifestyleTag[] {
  const tags: LifestyleTag[] = [];

  // Smoking
  tags.push(profile.isSmoker
    ? { icon: 'smoking_rooms', label: 'Hút thuốc' }
    : { icon: 'smoke_free', label: 'Không hút thuốc' }
  );

  // Wake time
  if (profile.wakeTime === 'early') tags.push({ icon: 'sunny', label: 'Dậy sớm' });
  else if (profile.wakeTime === 'late') tags.push({ icon: 'bedtime', label: 'Dậy muộn' });

  // Introvert/Extrovert
  if (profile.isIntrovert === true) tags.push({ icon: 'menu_book', label: 'Thích yên tĩnh' });
  else if (profile.isIntrovert === false) tags.push({ icon: 'groups', label: 'Năng động' });

  // Pets
  if (profile.hasPets) tags.push({ icon: 'pets', label: 'Có thú cưng' });
  else if (profile.okWithPets) tags.push({ icon: 'pets', label: 'Yêu thú cưng' });

  // Alcohol
  if (profile.drinksAlcohol) tags.push({ icon: 'local_bar', label: 'Uống rượu' });

  // Cleanliness
  if ((profile.cleanliness || 0) >= 4) tags.push({ icon: 'cleaning_services', label: 'Sạch sẽ' });

  // Sleep time
  if (profile.sleepTime === 'early') tags.push({ icon: 'nightlight', label: 'Ngủ sớm' });
  else if (profile.sleepTime === 'very_late') tags.push({ icon: 'dark_mode', label: 'Cú đêm' });

  return tags;
}

/** Format VNĐ currency */
export function formatBudget(amount?: number | null): string {
  if (amount == null) return '0đ';
  if (amount >= 1000000) {
    const m = amount / 1000000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}tr`;
  }
  return `${(amount / 1000).toFixed(0)}k`;
}
