import stringSimilarity from 'string-similarity';
/**
 * Merge books using smart heuristics:
 * - Prefix-based title match + author overlap
 * - Fuzzy title + author match fallback
 * - Collates all extra properties, including sources
 */
export function mergeBooksFuzzy(books, titleThreshold = 0.95, authorThreshold = 0.85) {
  const merged = [];

  for (const book of books) {
    if (!book?.title) continue;

    const normalizedBookTitle = normalizeTitle(book.title);
    const bookAuthors = book.author || [];
    const bookSources = book.__source ? [book.__source] : [];

    const match = merged.find(b => {
      const existingAuthors = b.author || [];

      // 1️⃣ Prefix-based title + author overlap
      if (isTitlePrefixMatch(b.title, book.title) && authorOverlap(existingAuthors, bookAuthors)) {
        return true;
      }

      // 2️⃣ Fuzzy fallback
      const titleSim = stringSimilarity.compareTwoStrings(normalizeTitle(b.title), normalizedBookTitle);
      const authorSim = Math.max(
        ...(existingAuthors.map(a =>
          bookAuthors.map(ba => stringSimilarity.compareTwoStrings(normalizeString(a), normalizeString(ba)))
        ).flat())
      ) || 0;

      return titleSim >= titleThreshold && authorSim >= authorThreshold;
    });

    if (match) {
      // Merge authors
      const matchAuthors = match.author || [];
      match.author = Array.from(new Set([...matchAuthors, ...bookAuthors]));

      // Merge dates
      match.dates = Array.from(new Set([...(match.dates || []), book.date].filter(Boolean)));

      // Merge sources
      match.__sources = Array.from(new Set([...(match.__sources || []), ...bookSources]));

      // Merge all other properties
      for (const key of Object.keys(book)) {
        if (['title', 'author', 'dates', 'originalTitles', '__source'].includes(key)) continue;

        const existing = match[key];
        const value = book[key];

        if (existing === undefined) {
          match[key] = value;
        } else if (Array.isArray(existing)) {
          if (Array.isArray(value)) match[key] = Array.from(new Set([...existing, ...value]));
          else match[key] = Array.from(new Set([...existing, value]));
        } else if (existing !== value) {
          match[key] = Array.from(new Set([existing, value]));
        }
      }
    } else {
      merged.push({
        ...book,
        dates: book.date ? [book.date] : [],
        __sources: bookSources
      });
    }
  }

  return merged;
}

/** Normalize title by removing series/volume suffixes */
function normalizeTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\(\s*crucial questions series book \d+\s*\)/i, '') 
    .replace(/\(\s*crucial questions\s*\)/i, '')                  
    .replace(/\(\s*christ-centered exposition commentary\s*\)/i, '') 
    .replace(/[^a-z0-9]/g, '')                                    
    .trim();
}

/** Normalize string for author comparison */
function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Check if at least one author matches */
function authorOverlap(authorsA = [], authorsB = []) {
  const normA = authorsA.map(a => normalizeString(a));
  const normB = authorsB.map(b => normalizeString(b));
  return normA.some(a => normB.includes(a));
}

/** Check if one title is a prefix of the other */
function isTitlePrefixMatch(titleA, titleB) {
  const normA = normalizeString(titleA);
  const normB = normalizeString(titleB);
  return normA.length > 0 && (normB.startsWith(normA) || normA.startsWith(normB));
}