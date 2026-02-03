import fm from 'front-matter';

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
        text: body.trim(),
        title: attributes.title || 'Untitled',
        date: attributes.date || '1970-01-01'
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
  return fm(raw).body.trim();
}

/**
 * Get the now page content
 * @returns {string}
 */
export function getNowContent() {
  const raw = Object.values(nowFile)[0];
  if (!raw) return '';
  return fm(raw).body.trim();
}
