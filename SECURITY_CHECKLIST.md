# 🛡️ Security Files & Production Checklist

> Add these files and configurations to your project before publishing.  
> Ask your AI coding assistant to implement any unchecked items.

---

## 🔴 Critical Security Files

### 1. Environment Variables (`.env`)
- [ ] Database connection strings (PostgreSQL, Supabase)
- [ ] JWT secrets (access + refresh tokens)
- [ ] Firebase / OAuth credentials
- [ ] API keys (Resend, SendGrid, Cloudinary, AWS)
- [ ] App URLs and ports
- [ ] Bcrypt rounds, rate limit config
- [ ] **Rule**: Add `.env` to `.gitignore` — NEVER commit to Git

### 2. `.gitignore`
- [ ] Environment files (`.env`, `.env.local`, `.env.production`)
- [ ] `node_modules/`, build outputs, logs
- [ ] IDE files (`.vscode/`, `.idea/`)
- [ ] Secrets (`*.pem`, `*.key`, `*.crt`)
- [ ] Database files (`*.sqlite`, `*.db`)

### 3. HTTP Security Headers Middleware
- [ ] Content Security Policy (CSP)
- [ ] HSTS (HTTP Strict Transport Security)
- [ ] X-Frame-Options (clickjacking protection)
- [ ] X-Content-Type-Options (MIME sniffing)
- [ ] Referrer Policy
- [ ] Hide `X-Powered-By` header
- [ ] Use `helmet` npm package

### 4. CORS Configuration
- [ ] Restrict to your domain only (not `*`)
- [ ] Allow only needed HTTP methods
- [ ] Allow only needed headers
- [ ] Enable credentials if using cookies

### 5. Rate Limiting
- [ ] Global API rate limit (e.g., 100 req / 15 min)
- [ ] Stricter auth rate limit (e.g., 5 login attempts / 15 min)
- [ ] Skip successful requests on auth endpoints
- [ ] Use `express-rate-limit`

### 6. Input Validation & Sanitization
- [ ] Validate all request bodies (Zod, Joi, or Yup)
- [ ] Validate query params and URL params
- [ ] Sanitize user inputs before DB queries
- [ ] Validate file uploads (type, size, scan)
- [ ] Reject unexpected fields

### 7. Authentication Middleware
- [ ] JWT verification with expiry check
- [ ] Refresh token rotation
- [ ] Role-based access control (RBAC)
- [ ] Token blacklisting on logout
- [ ] Secure password hashing (bcrypt / Argon2)

### 8. Database Security
- [ ] Connection pooling (PgBouncer)
- [ ] Parameterized queries only (NO string concatenation)
- [ ] Database migrations system
- [ ] Automated daily backups
- [ ] SSL connection in production
- [ ] Least-privilege DB user

### 9. Secure Error Handling
- [ ] Custom AppError class
- [ ] Don't leak stack traces in production
- [ ] Log errors with context (URL, IP, user ID)
- [ ] Async error wrapper (catch unhandled promise rejections)
- [ ] Generic message for unknown errors

### 10. Secure Frontend API Client
- [ ] Attach Bearer token to every request
- [ ] Auto-refresh expired access tokens
- [ ] Auto-logout on refresh failure
- [ ] Never store secrets in frontend code
- [ ] Use `VITE_` prefix only for public env vars

---

## 🟡 Important Security Measures

### 11. SQL Injection Prevention
- [ ] Always use parameterized queries
- [ ] Use ORM (Prisma, Drizzle, Sequelize)
- [ ] Never concatenate user input into SQL
- [ ] Input validation before DB operations

### 12. XSS (Cross-Site Scripting) Prevention
- [ ] Escape all user-generated output
- [ ] CSP headers to block inline scripts
- [ ] Sanitize HTML if allowing rich text
- [ ] Use `textContent` instead of `innerHTML`

### 13. CSRF Protection
- [ ] CSRF tokens for state-changing operations
- [ ] SameSite cookie attribute
- [ ] Validate Origin/Referer headers

### 14. Session Management
- [ ] Server-side sessions (Redis)
- [ ] Short session expiry
- [ ] Secure + HttpOnly cookies
- [ ] Session invalidation on logout

### 15. File Upload Security
- [ ] Validate file extensions and MIME types
- [ ] Scan uploads for malware
- [ ] Store files outside web root
- [ ] Limit file size
- [ ] Rename files to random names

### 16. Dependency Security
- [ ] Run `npm audit` regularly
- [ ] Use Snyk or Dependabot alerts
- [ ] Keep dependencies updated
- [ ] Pin versions in `package.json`
- [ ] Remove unused dependencies

### 17. HTTPS & TLS
- [ ] Force HTTPS redirect
- [ ] TLS 1.2+ only
- [ ] HSTS preload
- [ ] Secure certificate (Let's Encrypt / Cloudflare)

### 18. API Security
- [ ] API versioning (`/api/v1/`)
- [ ] Request size limits
- [ ] Timeout on all requests
- [ ] API key rotation policy
- [ ] Deprecation strategy for old versions

---

## 🟢 Nice-to-Have Security

### 19. Web Application Firewall (WAF)
- [ ] Cloudflare WAF or AWS WAF
- [ ] DDoS protection
- [ ] Bot management
- [ ] IP reputation filtering

### 20. Monitoring & Alerting
- [ ] Sentry for error tracking
- [ ] Failed login attempt alerts
- [ ] Unusual traffic pattern alerts
- [ ] Database slow query alerts

### 21. Two-Factor Authentication (2FA)
- [ ] TOTP (Google Authenticator)
- [ ] SMS fallback (optional)
- [ ] Backup recovery codes
- [ ] Enforce 2FA for admin accounts

### 22. Data Encryption
- [ ] Encrypt sensitive data at rest
- [ ] Encrypt data in transit (TLS)
- [ ] Hash passwords (never encrypt)
- [ ] Encrypt backups

### 23. Privacy & Compliance
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent banner (GDPR/CCPA)
- [ ] Data deletion endpoint
- [ ] Export user data endpoint

---

## 🚀 CI/CD for GitHub Actions

### 24. GitHub Actions Workflow (`.github/workflows/ci.yml`)
- [ ] **Trigger**: On push to `main` / `develop`, on PR
- [ ] **Node.js setup** with version pinning
- [ ] **Install dependencies** (`npm ci`)
- [ ] **Lint check** (ESLint)
- [ ] **Type check** (TypeScript `tsc --noEmit`)
- [ ] **Run tests** (Jest / Vitest)
- [ ] **Security audit** (`npm audit --audit-level=moderate`)
- [ ] **Build check** (ensure build passes)
- [ ] **Deploy to staging** on `develop` push
- [ ] **Deploy to production** on `main` push (with approval)

### 25. GitHub Actions Workflow (`.github/workflows/security.yml`)
- [ ] **Trigger**: Daily cron + on PR
- [ ] **Dependency audit** (`npm audit`)
- [ ] **Snyk security scan**
- [ ] **CodeQL analysis** (GitHub's static analysis)
- [ ] **Secret scanning** (GitHub Advanced Security)
- [ ] **OpenSSF Scorecard**

### 26. Branch Protection Rules
- [ ] Require PR reviews before merging
- [ ] Require status checks to pass (CI, tests, lint)
- [ ] Require up-to-date branches
- [ ] Restrict push to `main` / `production`
- [ ] Require signed commits
- [ ] Require linear history

### 27. GitHub Repository Security
- [ ] Enable Dependabot alerts
- [ ] Enable secret scanning
- [ ] Enable code scanning (CodeQL)
- [ ] Require 2FA for collaborators
- [ ] Limit repository access
- [ ] Regular access review

### 28. Deployment Security
- [ ] Separate staging and production environments
- [ ] Environment secrets in GitHub (not in code)
- [ ] Deployment approval gates
- [ ] Blue-green or rolling deployments
- [ ] Rollback strategy
- [ ] Post-deploy health checks

---

## 📋 Quick Security Pre-Launch Table

| Category | Task | Status |
|----------|------|--------|
| **Environment** | `.env` in `.gitignore`, not committed | ☐ |
| | Secrets generated with `openssl rand -base64 32` | ☐ |
| **Headers** | Helmet middleware configured | ☐ |
| | CSP directives set | ☐ |
| **Network** | CORS restricted to your domain | ☐ |
| | Rate limiting active on all routes | ☐ |
| **Input** | All inputs validated (Zod/Joi) | ☐ |
| | File uploads validated | ☐ |
| **Auth** | JWT with short expiry + refresh | ☐ |
| | Passwords hashed with bcrypt | ☐ |
| | RBAC implemented | ☐ |
| **Database** | Parameterized queries only | ☐ |
| | Connection pooling enabled | ☐ |
| | Backups configured | ☐ |
| **Errors** | Stack traces hidden in production | ☐ |
| | Errors logged with context | ☐ |
| **Frontend** | No secrets in client-side code | ☐ |
| | Auto token refresh implemented | ☐ |
| **CI/CD** | GitHub Actions workflow created | ☐ |
| | Branch protection enabled | ☐ |
| | Security audit in CI pipeline | ☐ |
| **Monitoring** | Sentry integrated | ☐ |
| | Failed login alerts | ☐ |
| **Compliance** | Privacy Policy + ToS pages | ☐ |
| | Cookie consent banner | ☐ |

---

## 🛠️ Recommended Security Tools

| Purpose | Tool |
|---------|------|
| HTTP Security Headers | **Helmet** |
| Input Validation | **Zod** |
| Authentication | **JWT** + **bcrypt** |
| Rate Limiting | **express-rate-limit** |
| Error Tracking | **Sentry** |
| Dependency Audit | **npm audit** + **Snyk** |
| Secret Scanning | **GitHub Secret Scanning** |
| Static Analysis | **CodeQL** + **ESLint** |
| WAF / DDoS | **Cloudflare** |
| CI/CD | **GitHub Actions** |

---

## 💬 How to Use This File

1. Copy this file into your project root as `SECURITY_CHECKLIST.md`
2. Go through each section and check off completed items
3. For unchecked items, paste the relevant section into your AI assistant and ask:  
   > *"Implement the unchecked items in the [Category] section for my [React/Node/Express] app."*
4. Re-check items as you complete them
5. Run `npm audit` before every deployment

---

*Last updated: 2026-07-16*
