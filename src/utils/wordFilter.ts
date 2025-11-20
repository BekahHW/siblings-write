import Filter from 'bad-words';

const filter = new Filter();

// Add custom NSFW words if needed
// filter.addWords('word1', 'word2');

/**
 * Check if a word is valid for submission
 */
export function validateWord(word: string): { valid: boolean; error?: string } {
  // Trim and normalize the word
  const normalizedWord = word.trim();

  // Check if empty
  if (!normalizedWord) {
    return { valid: false, error: 'Word cannot be empty' };
  }

  // Check if it's a single word (no spaces)
  if (/\s/.test(normalizedWord)) {
    return { valid: false, error: 'You can only submit one word at a time' };
  }

  // Check if it contains only letters (English alphabet) and common punctuation
  // Allow apostrophes for contractions and hyphens for compound words
  if (!/^[a-zA-Z'-]+$/.test(normalizedWord)) {
    return { valid: false, error: 'Word must contain only English letters' };
  }

  // Check for NSFW content
  if (filter.isProfane(normalizedWord)) {
    return { valid: false, error: 'Word contains inappropriate content' };
  }

  // Check reasonable length (between 1 and 30 characters)
  if (normalizedWord.length > 30) {
    return { valid: false, error: 'Word is too long (maximum 30 characters)' };
  }

  return { valid: true };
}

/**
 * Sanitize a word for storage
 */
export function sanitizeWord(word: string): string {
  return word.trim();
}
