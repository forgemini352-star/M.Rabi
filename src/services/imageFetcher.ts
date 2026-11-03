export interface ImageCandidate {
  id: string;
  url: string;
  title: string;
  source: string;
  tags: string[];
}

// Curated high quality product catalog images for mobile retail
const CURATED_IMAGE_DATABASE: ImageCandidate[] = [
  // Samsung
  {
    id: 'samsung-s24-ultra',
    url: '/src/assets/images/phone_samsung_flagship_1793698266683.jpg',
    title: 'Samsung Galaxy S24 Ultra Titanium Gray',
    source: 'Official Studio Render',
    tags: ['samsung', 'galaxy', 's24', 'ultra', 's23', 's25', 'titanium', 'flagship'],
  },
  {
    id: 'samsung-z-fold-flip',
    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    title: 'Samsung Galaxy Z Fold / Flip Series',
    source: 'Samsung Galaxy Hub',
    tags: ['samsung', 'fold', 'flip', 'galaxy', 'z fold', 'z flip'],
  },
  {
    id: 'samsung-a-series',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80',
    title: 'Samsung Galaxy A-Series (A55 / A35 / A15)',
    source: 'Samsung Retail Stock',
    tags: ['samsung', 'a55', 'a35', 'a54', 'a15', 'a25', 'a53', 'galaxy'],
  },

  // Apple
  {
    id: 'apple-iphone-16-pro',
    url: '/src/assets/images/phone_iphone_pro_1793698266739.jpg',
    title: 'Apple iPhone 16 Pro / 15 Pro Natural Titanium',
    source: 'Official Apple Press Asset',
    tags: ['apple', 'iphone', '16', 'pro', '15', 'titanium', 'promax', 'pro max'],
  },
  {
    id: 'apple-iphone-standard',
    url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    title: 'Apple iPhone 16 / 15 Standard Edition',
    source: 'Apple Product Press',
    tags: ['apple', 'iphone', '15', '16', '14', '13', 'base', 'standard'],
  },

  // Realme / Xiaomi / OnePlus / Pixel
  {
    id: 'realme-sub-blue',
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
    title: 'Realme 12 Pro+ / 11 Pro Series Submarine Blue',
    source: 'Realme Global Store',
    tags: ['realme', '12 pro', '11 pro', 'gt', 'narzo', 'realme 12'],
  },
  {
    id: 'xiaomi-redmi-note',
    url: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80',
    title: 'Xiaomi Redmi Note 13 Pro / 14 Series',
    source: 'Xiaomi Global Newsroom',
    tags: ['xiaomi', 'redmi', 'note 13', 'note 12', 'poco', 'mi'],
  },
  {
    id: 'google-pixel-pro',
    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    title: 'Google Pixel 9 Pro / Pixel 8 Pro Visor Camera',
    source: 'Google Hardware Archive',
    tags: ['google', 'pixel', 'pixel 9', 'pixel 8', 'pixel 7', 'pro'],
  },
  {
    id: 'oneplus-flagship',
    url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    title: 'OnePlus 12 / 12R Emerald & Black',
    source: 'OnePlus Media Center',
    tags: ['oneplus', 'nord', '12', '12r', '11', 'oxygenos'],
  },

  // Accessories: Chargers & Cables
  {
    id: 'charger-gan-65w',
    url: '/src/assets/images/accessory_fast_charger_1793698268091.jpg',
    title: 'VelocCharge 65W GaN Dual USB-C Fast Charger',
    source: 'Studio Tech Retail',
    tags: ['charger', 'adapter', 'gan', 'fast', '65w', '30w', '100w', 'cable', 'veloccharge', 'anker', 'baseus'],
  },
  {
    id: 'apple-20w-adapter',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    title: 'Original 20W / 25W USB-C Power Adapter',
    source: 'Accessories Wholesale',
    tags: ['adapter', '20w', 'apple', 'type-c', 'usb-c', 'wall charger'],
  },

  // Accessories: Audio & Earbuds
  {
    id: 'earbuds-sonicure-anc',
    url: '/src/assets/images/accessory_wireless_earbuds_1793698297214.jpg',
    title: 'Sonicure ANC True Wireless Earbuds with Pebble Case',
    source: 'Acoustic Labs Studio',
    tags: ['audio', 'earbuds', 'anc', 'wireless', 'bluetooth', 'airpods', 'buds', 'sonicure', 'tws', 'headphone'],
  },
  {
    id: 'airpods-pro-render',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    title: 'Apple AirPods Pro 2 / AirPods 4 with MagSafe Case',
    source: 'Apple Accessories Archive',
    tags: ['airpods', 'apple', 'earphones', 'tws', 'pro 2'],
  },

  // Accessories: Screen Protectors & Cases
  {
    id: 'tempered-glass-9h',
    url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    title: 'Premium 9H Curved Edge Tempered Glass Screen Protector',
    source: 'Screen Protection Lab',
    tags: ['tempered', 'glass', 'screen protector', '9h', 'curved', 'uv glass', 'privacy'],
  },
  {
    id: 'armor-case-magsafe',
    url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    title: 'Magnetic Shockproof Armor Case (MagSafe Compatible)',
    source: 'Mobile Protection Gear',
    tags: ['case', 'cover', 'silicone', 'armor', 'magsafe', 'shockproof', 'bumper'],
  },

  // Wearables & Power Banks
  {
    id: 'smartwatch-ultra',
    url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    title: 'Smartwatch Series / Fitness Tracker with AMOLED Display',
    source: 'Wearable Tech Stock',
    tags: ['watch', 'smartwatch', 'band', 'apple watch', 'galaxy watch', 'ultra'],
  },
  {
    id: 'power-bank-20000',
    url: 'https://images.unsplash.com/photo-1609592424369-2f22c676bc1a?auto=format&fit=crop&w=800&q=80',
    title: '20,000mAh 22.5W Fast Charging Power Bank with Digital LED',
    source: 'Power Accessories Direct',
    tags: ['power bank', 'battery', 'portable', 'powerbank', 'mah', '20000'],
  },
];

/**
 * Smart Auto-Fetch product images based on Item Name, Model, and Brand/Company
 */
export async function searchProductImages(query: {
  name: string;
  brand: string;
  model: string;
  category?: string;
}): Promise<ImageCandidate[]> {
  // Simulate network query latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  const searchTokens = [
    query.name.toLowerCase(),
    query.brand.toLowerCase(),
    query.model.toLowerCase(),
    (query.category || '').toLowerCase(),
  ]
    .join(' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  // Score candidate matches
  const scored = CURATED_IMAGE_DATABASE.map((candidate) => {
    let score = 0;
    const combinedCandidate = (
      candidate.title +
      ' ' +
      candidate.tags.join(' ')
    ).toLowerCase();

    searchTokens.forEach((token) => {
      if (candidate.tags.includes(token)) {
        score += 5;
      } else if (combinedCandidate.includes(token)) {
        score += 2;
      }
    });

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Filter candidates with matching score or provide top authentic options
  let results = scored
    .filter((s) => s.score > 0)
    .map((s) => s.candidate);

  if (results.length === 0) {
    // If no exact match, return general relevant options
    results = CURATED_IMAGE_DATABASE.slice(0, 4);
  }

  return results.slice(0, 6);
}
