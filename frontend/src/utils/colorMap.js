const colorMap = {
  Black: '#000000',
  Brown: '#8B4513',
  Navy: '#000080',
  Red: '#DC2626',
  Blue: '#2563EB',
  Green: '#16A34A',
  White: '#FFFFFF',
  Gray: '#6B7280',
  Grey: '#6B7280',
  Pink: '#EC4899',
  Beige: '#F5F5DC',
  Gold: '#D4AF37',
  Silver: '#C0C0C0',
  Tan: '#D2B48C',
  Camel: '#C19A6B',
  Burgundy: '#800020',
  Mustard: '#EAAA00',
  Olive: '#808000',
  Purple: '#7C3AED',
  Orange: '#EA580C',
  Yellow: '#EAB308',
  Cream: '#FFFDD0',
  Ivory: '#FFFFF0',
  Charcoal: '#36454F',
  Taupe: '#483C32',
  Teal: '#0D9488',
  Maroon: '#800000',
  Coral: '#F97316',
  Blush: '#FECDD3',
  Nude: '#E3BC9A',
  Rose: '#F43F5E',
  Chocolate: '#7B3F00',
  Coffee: '#6F4E37',
  Wine: '#722F37',
  'Dark Brown': '#654321',
  'Light Brown': '#A0522D',
};

export function getColorHex(name) {
  return colorMap[name] || '#CBD5E1';
}

export function isLightColor(name) {
  const hex = getColorHex(name);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}
