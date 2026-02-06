import fm from 'front-matter';

/**
 * Collapse consecutive plain-text lines into single lines (paragraph flow),
 * while preserving blank lines, separators, bullets, indented lines, etc.
 */
function collapseLines(text) {
  const lines = text.split('\n');
  const result = [];
  let buffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const isSpecial =
      trimmed === '' ||
      /^={3,}$/.test(trimmed) ||
      /^-{3,}$/.test(trimmed) ||
      /^\{\{preview:.+\}\}$/.test(trimmed) ||
      /^◦/.test(trimmed) ||
      /^\d+\./.test(trimmed) ||
      /^←/.test(trimmed) ||
      /^\d{4}\.\d{2}\.\d{2}$/.test(trimmed) ||
      line.startsWith('  ');

    if (isSpecial) {
      if (buffer) {
        result.push(buffer);
        buffer = '';
      }
      result.push(line);
    } else {
      buffer = buffer ? buffer + ' ' + trimmed : line;
    }
  }

  if (buffer) result.push(buffer);

  return result.join('\n');
}

// Auto-discover all blog posts as raw text
const blogFiles = import.meta.glob('/content/blog/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true
});

// Load static pages
const aboutFile = import.meta.glob('/content/about/index.mdx', {
  query: '?raw',
  import: 'default',
  eager: true
});

const nowFile = import.meta.glob('/content/now/index.mdx', {
  query: '?raw',
  import: 'default',
  eager: true
});

/**
 * Get all blog posts sorted by date (newest first)
 * @returns {Array<{slug: string, text: string, title: string, date: string}>}
 */
export function getBlogPosts() {
  return Object.entries(blogFiles)
    .map(([path, raw]) => {
      const { attributes, body } = fm(raw);
      const slug = path.split('/').pop().replace('.mdx', '');
      return {
        slug,
        text: collapseLines(body.trim()),
        title: attributes.title || 'Untitled',
        date: attributes.date instanceof Date
          ? attributes.date.toISOString().split('T')[0]
          : attributes.date || '1970-01-01'
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get a single blog post by slug
 * @param {string} slug - The post slug (filename without extension)
 * @returns {Object|undefined}
 */
export function getBlogPost(slug) {
  return getBlogPosts().find(p => p.slug === slug);
}

/**
 * Get a blog post by its index in the sorted list
 * @param {number} index - Zero-based index
 * @returns {Object|undefined}
 */
export function getBlogPostByIndex(index) {
  const posts = getBlogPosts();
  return posts[index];
}

/**
 * Get the about page content
 * @returns {string}
 */
export function getAboutContent() {
  const raw = Object.values(aboutFile)[0];
  if (!raw) return '';
  return collapseLines(fm(raw).body.trim());
}

/**
 * Get the now page content
 * @returns {string}
 */
export function getNowContent() {
  const raw = Object.values(nowFile)[0];
  if (!raw) return '';
  return collapseLines(fm(raw).body.trim());
}
