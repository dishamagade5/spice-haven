// Local menu images, grouped by folder: veg, non-veg, liquors, desserts.
// Any .jpg/.jpeg/.png/.webp dropped into those folders is picked up automatically.
const files = import.meta.glob('./*/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

export const menuImages = {}; // folder -> [{ slug, url }]
Object.keys(files)
  .sort()
  .forEach((path) => {
    const [, folder, fileName] = path.split('/');
    const base = fileName.replace(/\.[^.]+$/, '');
    const slug = base.replace(/^.*?-\d{2}-/, ''); // "veg-01-spring-rolls" -> "spring-rolls"
    (menuImages[folder] ||= []).push({ slug, url: files[path] });
  });

// Exact lookup, e.g. getImage('veg', 'spring-rolls')
export function getImage(folder, slug) {
  return menuImages[folder]?.find((image) => image.slug === slug)?.url || '';
}

const normalise = (value) => (value || '').toLowerCase().replace(/[^a-z]/g, '');

// Backend category name -> image folder
export function folderForCategory(category) {
  const key = normalise(category);
  if (['veg', 'vegetarian'].includes(key)) return 'veg';
  if (['nonveg', 'nonvegetarian'].includes(key)) return 'non-veg';
  if (['alcohol', 'alcoholic', 'liquor', 'liquors'].includes(key)) return 'liquors';
  if (['dessert', 'desserts'].includes(key)) return 'desserts';
  return null;
}

const words = (text) => (text || '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 3);

// Gives every dish a local image from its category folder, preferring the picture whose
// file name matches the dish name (e.g. "Chicken Biryani" -> chicken-biryani.jpg).
// `image` keeps the backend photo when there is one; `fallbackImage` is used if it fails to load.
export function withLocalImages(items) {
  const used = {};
  return items.map((item) => {
    const folder = folderForCategory(item.category);
    const pool = folder ? menuImages[folder] : null;
    if (!pool || pool.length === 0) return item;

    used[folder] ||= new Set();
    const nameWords = words(item.name);
    const unused = pool.filter((image) => !used[folder].has(image.slug));
    const candidates = unused.length ? unused : pool;

    let best = null;
    let bestScore = 0;
    candidates.forEach((image) => {
      const score = words(image.slug).filter((w) => nameWords.includes(w)).length;
      if (score > bestScore) {
        best = image;
        bestScore = score;
      }
    });
    const pick = best || candidates[0];
    used[folder].add(pick.slug);
    return { ...item, image: item.image || pick.url, fallbackImage: pick.url };
  });
}
