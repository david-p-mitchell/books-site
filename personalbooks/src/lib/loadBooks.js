import fs from 'fs';
import path from 'path';

/**
 * Load all JSON files from a folder and normalize keys
 * @param {string} folder Absolute or relative folder path
 * @returns {Array} Combined JSON data, each object with __source
 */
export function loadAllJson(folder) {
  if (!fs.existsSync(folder)) {
    console.warn(`Folder not found: ${folder}`);
    return [];
  }

  const files = fs.readdirSync(folder).filter(f => f.endsWith('.json'));
  const combined = [];

  for (const file of files) {
    const filePath = path.join(folder, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      const normalizedItem = normalizeKeys(item);

      // Ensure author is always an array
      normalizedItem.author = Array.isArray(normalizedItem.author)
        ? normalizedItem.author
        : normalizedItem.author
        ? [normalizedItem.author]
        : [];

      // Attach source
      normalizedItem.__source = file;

      combined.push(normalizedItem);
    }
  }

  return combined;
}

/**
 * Normalize keys from messy JSON to consistent keys
 */
function normalizeKeys(book) {
  const mapping = {
    Title: 'title',
    Author: 'author',
    'Resource Type': 'resourceType',
    'Publishers': 'publisher',
    'Publication Date': 'date',
    'My Tags': 'myTags',
    'Community Tags': 'communityTags',
    'Community Rating': 'communityRating',
    'Subjects': 'subjects'
  };

  const normalized = {};
  for (const key in book) {
    const newKey = mapping[key] || key;
    normalized[newKey] = book[key];
  }

  return normalized;
}