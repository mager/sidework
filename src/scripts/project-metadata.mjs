// Stable IDs shared by the gallery, editor, exports, and MCP.
export const PROJECT_CATEGORIES = Object.freeze({
  'developer-tools': 'Developer tools', productivity: 'Productivity',
  creative: 'Creative tools', learning: 'Learning', games: 'Games & recreation', utilities: 'Utilities',
});
export const SOFTWARE_TYPES = Object.freeze({
  'web-app': 'Web app', cli: 'Command-line tool', 'desktop-app': 'Desktop app',
  'mobile-app': 'Mobile app', 'browser-extension': 'Browser extension', library: 'Library', service: 'API / service',
});
export const MAX_FEATURES = 5;
export const MAX_FEATURE_LENGTH = 160;
export function cleanMetadata(value = {}) {
  const features = Array.isArray(value.features) ? value.features : [];
  return {
    category: Object.hasOwn(PROJECT_CATEGORIES, value.category) ? value.category : '',
    softwareType: Object.hasOwn(SOFTWARE_TYPES, value.softwareType) ? value.softwareType : '',
    audience: typeof value.audience === 'string' ? value.audience.trim().slice(0, 180) : '',
    features: [...new Set(features.filter(item => typeof item === 'string').map(item => item.trim().slice(0, MAX_FEATURE_LENGTH)).filter(Boolean))].slice(0, MAX_FEATURES),
  };
}
export function validateMetadata(value) {
  for (const [key, options, label] of [['category', PROJECT_CATEGORIES, 'category'], ['softwareType', SOFTWARE_TYPES, 'software type']]) {
    if (value[key] !== undefined && value[key] !== '' && !Object.hasOwn(options, value[key])) throw new Error(`Choose a listed ${label}, or leave it blank.`);
  }
  if (value.audience !== undefined && (typeof value.audience !== 'string' || value.audience.length > 180)) throw new Error('Keep the audience description to 180 characters.');
  if (value.features !== undefined && (!Array.isArray(value.features) || value.features.length > MAX_FEATURES || value.features.some(item => typeof item !== 'string' || !item.trim() || item.length > MAX_FEATURE_LENGTH))) throw new Error('Add up to five features, each with 1–160 characters.');
}
export function projectMatches(project, query = '', category = '') {
  const metadata = cleanMetadata(project);
  const text = [project.name, project.tagline, project.description, project.stack, PROJECT_CATEGORIES[metadata.category], SOFTWARE_TYPES[metadata.softwareType], metadata.audience, ...metadata.features].join(' ').toLowerCase();
  return (!category || metadata.category === category) && text.includes(query.trim().toLowerCase());
}
