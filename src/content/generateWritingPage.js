import { getBlogPosts } from './loader';

/**
 * Format a date string to YYYY.MM.DD format
 * @param {string} dateStr - Date string (e.g., "2025-01-20")
 * @returns {string}
 */
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${year}.${month}.${day}`;
}

/**
 * Extract full first paragraph from the post text
 * Returns enough text to fill 2 lines at any reasonable width
 * @param {string} text - Full post text
 * @returns {string}
 */
function extractPreview(text) {
  const lines = text.split('\n');

  // Find first paragraph (skip headers, separators, empty lines)
  let preview = '';
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip separator markers and special characters
    if (trimmed === '===' || trimmed === '---') continue;
    if (trimmed.match(/^[◦►\[\]]/)) continue;
    if (trimmed.match(/^\d{4}\.\d{2}\.\d{2}$/)) continue;
    if (trimmed === '') {
      if (inParagraph && preview) break; // End of paragraph
      continue;
    }

    // Skip title lines (ALL CAPS with no lowercase)
    if (trimmed.match(/^[A-Z\s]+$/) && trimmed.length > 3) continue;

    // Found paragraph content - collect the whole paragraph
    inParagraph = true;
    preview += (preview ? ' ' : '') + trimmed;
  }

  return preview;
}

/**
 * Generate the writing page text from all blog posts
 * This creates the blog listing with auto-numbered entries
 * Preview lines are wrapped with {{preview:...}} marker for CSS line-clamping
 * @returns {string}
 */
export function generateWritingPageText() {
  const posts = getBlogPosts();

  let output = `WRITING
===`;

  posts.forEach((post, i) => {
    const num = String(i + 1).padStart(3, '0');
    const date = formatDate(post.date);
    const preview = extractPreview(post.text);

    output += `

[${num}]  ${date}
       ${post.title}

{{preview:${preview}}}

---`;
  });

  return output;
}
