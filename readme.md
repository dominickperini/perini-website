# Dominick Perini - Personal Site

Terminal-style personal website with MFP-inspired cascade text animation.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run locally
npm run dev

# 3. Open http://localhost:5173
```

## Project Structure

```
dominick-site/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx        ← Edit content here
```

## Editing Content

All site content is in `src/App.jsx` in the `sections` object:

```javascript
const sections = {
  about: `...`,    // Homepage bio
  writing: `...`,  // Blog post list
  post: `...`,     // Individual post
  now: `...`,      // Now page
};
```

## Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Create a GitHub repo and push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → "Add New Project"

3. Import your GitHub repo

4. Click "Deploy" (settings auto-detected)

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel
```

## Connect Namecheap Domain

### In Vercel:
1. Project → Settings → Domains
2. Add `yourdomain.com`
3. Vercel shows you DNS records to add

### In Namecheap:
1. Domain List → Manage → Advanced DNS
2. Delete existing records (except any email records)
3. Add Vercel's records:

   | Type  | Host | Value              |
   |-------|------|--------------------|
   | A     | @    | 76.76.21.21        |
   | CNAME | www  | cname.vercel-dns.com |

4. Wait 5-30 minutes for propagation

## Adding New Blog Posts

1. Add post content to `sections` object in `App.jsx`
2. Add entry to `writing` section
3. Update click handler if needed

## License

MIT
