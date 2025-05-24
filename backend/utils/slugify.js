export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-") // replace all whitespace with hyphen
    .replace(/-+/g, "-") // replace multiple hyphens with single
    .trim();
}
