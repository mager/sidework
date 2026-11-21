export const validShowcaseSlug = value => typeof value === 'string' && /^[a-f0-9]{32}$/.test(value);

export function isPublicShowcasePath(path) {
  return /^\/showcase\/[a-f0-9]{32}\/?$/.test(path);
}
