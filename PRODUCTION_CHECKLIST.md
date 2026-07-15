# 🚀 Production Web App Checklist

> Use this checklist before publishing any web app to production.  
> Ask your AI coding assistant to implement any unchecked items.

---

## 🔴 Critical (Must Have)

### 1. Error Handling & Logging
- [ ] **Global Error Boundaries** (React: `ErrorBoundary`; Vue: `onErrorCaptured`)
- [ ] **API Error Handling**: Standardized error responses (4xx/5xx) with user-friendly messages
- [ ] **Client-side Logging**: Catch unhandled promise rejections (`window.onunhandledrejection`)
- [ ] **Server-side Logging**: Structured logs (Winston, Pino, or CloudWatch/LogRocket)
- [ ] **Error Tracking**: Integrate **Sentry**, **Bugsnag**, or **Rollbar** for real-time crash reports

### 2. Security
- [ ] **HTTPS everywhere** (TLS 1.2+)
- [ ] **Environment Variables**: Never expose API keys, DB URLs, or secrets in frontend code
- [ ] **CORS**: Properly configured for your domains only
- [ ] **Input Validation**: Sanitize all user inputs (Zod, Joi, or Yup on both client & server)
- [ ] **Rate Limiting**: Prevent brute force (Express `express-rate-limit` or Cloudflare)
- [ ] **SQL Injection Protection**: Use parameterized queries / ORM (Prisma, Sequelize)
- [ ] **XSS Protection**: Escape output, use `Content-Security-Policy` headers
- [ ] **Authentication Security**:
  - [ ] JWT with short expiry + refresh tokens
  - [ ] Password hashing (bcrypt/Argon2)
  - [ ] OAuth (Google/Firebase) with proper redirect URI validation

### 3. Database & Backend
- [ ] **Connection Pooling** (PgBouncer for PostgreSQL)
- [ ] **Database Migrations** (Prisma Migrate, Drizzle, or raw SQL migrations)
- [ ] **Backup Strategy**: Automated daily backups (Supabase/RDS/Render has this)
- [ ] **API Rate Limiting & Throttling**
- [ ] **Request Validation**: Validate every request body/query before hitting DB

---

## 🟡 Important (Should Have)

### 4. Performance
- [ ] **Code Splitting / Lazy Loading** (React.lazy, dynamic imports)
- [ ] **Image Optimization**: WebP/AVIF, lazy loading, CDN (Cloudinary, AWS S3 + CloudFront)
- [ ] **Caching Strategy**:
  - [ ] Browser caching (Cache-Control headers)
  - [ ] API response caching (Redis or in-memory)
  - [ ] CDN caching for static assets
- [ ] **Bundle Size Analysis** (`webpack-bundle-analyzer`)
- [ ] **Database Query Optimization**: Add indexes, avoid N+1 queries

### 5. SEO & Meta
- [ ] **SSR or SSG** (Next.js, Nuxt, or prerendering for SPAs)
- [ ] **Dynamic `<meta>` tags** for each page (Open Graph, Twitter Cards)
- [ ] **`robots.txt`** and **`sitemap.xml`**
- [ ] **Canonical URLs** to prevent duplicate content
- [ ] **Structured Data** (JSON-LD Schema.org)

### 6. User Experience (UX)
- [ ] **Loading States**: Skeleton screens, spinners, progress bars
- [ ] **Empty States**: Friendly messages when no data exists
- [ ] **404 / 500 Pages**: Custom error pages with navigation back
- [ ] **Form Validation**: Real-time validation with clear error messages
- [ ] **Toast/Notification System**: Success/error feedback (Sonner, React-Toastify)
- [ ] **Responsive Design**: Mobile-first, tested on multiple devices

### 7. Monitoring & Analytics
- [ ] **Uptime Monitoring**: UptimeRobot, Pingdom, or Better Uptime
- [ ] **Performance Monitoring**: Lighthouse CI, Web Vitals (LCP, FID, CLS)
- [ ] **Analytics**: Google Analytics 4, Plausible, or Mixpanel
- [ ] **Server Monitoring**: PM2, New Relic, or Datadog

---

## 🟢 Nice to Have (Polish)

### 8. DevOps & Deployment
- [ ] **CI/CD Pipeline**: GitHub Actions / GitLab CI for automated testing & deploy
- [ ] **Staging Environment**: Test everything before production
- [ ] **Docker Containerization** (optional but recommended)
- [ ] **Database Seeding**: Scripts to populate dev/staging DBs
- [ ] **Rollback Strategy**: Easy revert to previous version

### 9. Legal & Compliance
- [ ] **Privacy Policy** & **Terms of Service** pages
- [ ] **Cookie Consent Banner** (GDPR/CCPA compliance)
- [ ] **Data Deletion**: User can delete their account/data
- [ ] **Accessibility (a11y)**: ARIA labels, keyboard navigation, color contrast (WCAG 2.1 AA)

### 10. Additional Features
- [ ] **Dark Mode Toggle**
- [ ] **Internationalization (i18n)** if targeting multiple languages
- [ ] **PWA Support**: Service worker, manifest.json, offline capability
- [ ] **Search functionality** (Algolia, Meilisearch, or full-text DB search)

---

## 📋 Quick Pre-Launch Table

| Category | Task | Status |
|----------|------|--------|
| **Security** | HTTPS enabled | ☐ |
| | Secrets in `.env` (not in repo) | ☐ |
| | Rate limiting active | ☐ |
| | Input validation on all forms | ☐ |
| **Error Handling** | Global error boundary set | ☐ |
| | Sentry/Bugsnag integrated | ☐ |
| | Custom 404/500 pages | ☐ |
| **Performance** | Images optimized + CDN | ☐ |
| | Lazy loading implemented | ☐ |
| | Lighthouse score > 90 | ☐ |
| **Database** | Migrations ready | ☐ |
| | Backups configured | ☐ |
| | Connection pooling | ☐ |
| **SEO** | Meta tags dynamic | ☐ |
| | Sitemap + robots.txt | ☐ |
| **Monitoring** | Analytics connected | ☐ |
| | Uptime monitoring active | ☐ |
| **UX** | Loading states everywhere | ☐ |
| | Mobile responsive | ☐ |
| | Toast notifications | ☐ |

---

## 🛠️ Recommended Stack Additions for Production

| Purpose | Tool |
|---------|------|
| Error Tracking | **Sentry** |
| Logging | **Pino** (server) / **LogRocket** (client) |
| Monitoring | **Better Uptime** + **Google Analytics 4** |
| Image CDN | **Cloudinary** or **AWS CloudFront** |
| Caching | **Redis** (Upstash for serverless) |
| CI/CD | **GitHub Actions** |
| Email | **Resend** or **SendGrid** |

---

## 💬 How to Use This File

1. Copy this file into your project root as `PRODUCTION_CHECKLIST.md`
2. Go through each section and check off completed items
3. For unchecked items, paste the relevant section into your AI assistant and ask:  
   > *"Implement the unchecked items in the [Category] section for my [React/Vue/Node] app."*
4. Re-check items as you complete them
5. Do a final review before every production deployment

---

*Last updated: 2026-07-16*
