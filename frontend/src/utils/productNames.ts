const PRODUCT_NAMES = [
  'Солнцезащитный спрей Sensitive SPF50',
  'Крем Hyalu B5 против морщин',
  'Тональный флюид Soft Glam Filter',
  'Румяна Baked Soft',
  'Солнцезащитный крем SPF50 Multifilter',
  'Блеск для губ J\'aime D\'amour',
  'Набор Solar & Radiance Routine',
  'Пилинг для кожи головы Rosemary Lush',
  'Парфюмерная вода Unframe',
  'Осветляющая крем-маска Pore + Dark Spot',
  'Тинт для губ Juicy Piglet',
  'Тонирующий крем SPF50+ Mineral Tone-Up',
  'Кератиновый шампунь LPP',
  'Гидрофильное масло Collagen Cleansing',
  'Стик для контуринга SHIK Studio',
  'Жидкий консилер LUNA',
  'Пенка для умывания Azulene pH',
  'Подарочный набор Dolce & Gabbana',
  'Уход для волос Hydro Liquid Silk',
  'Тушь для ресниц Capsule 5XL',
];

export function getProductName(id: number): string {
  const index = (id - 1) % PRODUCT_NAMES.length;
  return PRODUCT_NAMES[index];
}
