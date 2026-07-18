# DocuPDF Backend API

Laravel 12 + PHP 8.3 REST API backend for DocuPDF - a comprehensive PDF tools platform.

## Tech Stack

- **Framework:** Laravel 12
- **Language:** PHP 8.3
- **Database:** MySQL
- **Auth:** Laravel Sanctum (Token-based)
- **Image Processing:** Intervention Image
- **Payments:** SSLCommerz (Bangladesh)
- **Permissions:** Spatie Laravel Permission

## Features

- ✅ User Authentication (Register, Login, Forgot Password, Email Verification)
- ✅ Premium Subscription (Free, Pro Monthly, Pro Yearly)
- ✅ PDF History Tracking
- ✅ Blog CMS with Categories, Tags, SEO
- ✅ Image Upload with Compression, Resize, WebP
- ✅ Video Support (YouTube, Vimeo, Upload)
- ✅ Admin Dashboard & Analytics
- ✅ Role-based Access Control
- ✅ Rate Limiting & Security
- ✅ Caching & Performance Optimized

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout (auth) |
| GET | `/api/v1/auth/user` | Get current user (auth) |
| POST | `/api/v1/auth/forgot-password` | Send reset link |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile` | Get profile (auth) |
| PUT | `/api/v1/profile` | Update profile (auth) |
| POST | `/api/v1/profile/avatar` | Upload avatar (auth) |
| DELETE | `/api/v1/profile` | Delete account (auth) |

### Subscriptions & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/plans` | Get all plans |
| GET | `/api/v1/subscription` | Current subscription (auth) |
| POST | `/api/v1/subscription/initiate` | Initiate payment (auth) |
| GET | `/api/v1/subscription/history` | Payment history (auth) |
| POST | `/api/v1/subscription/cancel` | Cancel subscription (auth) |

### PDF History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pdf-history` | List history (auth) |
| GET | `/api/v1/pdf-history/stats` | User stats (auth) |
| GET | `/api/v1/pdf-history/{id}` | Show history (auth) |
| DELETE | `/api/v1/pdf-history/{id}` | Delete history (auth) |

### Blog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/blog/posts` | List posts |
| GET | `/api/v1/blog/posts/featured` | Featured posts |
| GET | `/api/v1/blog/posts/{slug}` | Show post by slug |
| GET | `/api/v1/blog/posts/{id}/related` | Related posts |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/tags` | List tags |
| GET | `/api/v1/videos` | List videos |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/images` | List images (auth) |
| POST | `/api/v1/images` | Upload image (auth) |
| DELETE | `/api/v1/images/{id}` | Delete image (auth) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/users` | List users |
| PUT | `/api/v1/admin/users/{id}` | Update user |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/payments` | List payments |
| GET | `/api/v1/admin/analytics` | Analytics data |
| POST | `/api/v1/admin/posts` | Create post |
| PUT | `/api/v1/admin/posts/{id}` | Update post |
| DELETE | `/api/v1/admin/posts/{id}` | Delete post |
| GET/POST/PUT/DELETE | `/api/v1/admin/categories` | CRUD categories |
| GET/POST/PUT/DELETE | `/api/v1/admin/tags` | CRUD tags |
| GET/PUT | `/api/v1/admin/settings` | Manage settings |

## Installation

### Prerequisites
- PHP 8.3+
- Composer
- MySQL 8.0+
- Node.js (for frontend)

### Local Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`:
```
DB_DATABASE=docupdf
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations and seeders:
```bash
php artisan migrate --seed
php artisan storage:link
```

Start development server:
```bash
php artisan serve
```

## cPanel Deployment

1. **Upload Files:**
   - Upload the entire `backend/` directory to your cPanel root (e.g., `api.yourdomain.com`)
   - Or upload to a subdirectory in `public_html/api`

2. **Configure .env:**
   - Copy `.env.example` to `.env`
   - Update database credentials from cPanel MySQL
   - Set `APP_URL`, `FRONTEND_URL`
   - Configure `SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS`

3. **Run Composer:**
   - SSH into cPanel or use Terminal
   ```bash
   cd /path/to/backend
   composer install --optimize-autoloader --no-dev
   php artisan key:generate
   php artisan migrate --seed
   php artisan optimize
   php artisan storage:link
   ```

4. **Set Permissions:**
   ```bash
   chmod -R 755 storage bootstrap/cache
   chmod -R 755 public/uploads
   chmod -R 755 public/storage
   ```

5. **Set up Cron Job:**
   ```
   * * * * * /usr/local/bin/php /path/to/backend/artisan schedule:run >> /dev/null 2>&1
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_URL` | Backend API URL | `https://yourdomain.com/api` |
| `FRONTEND_URL` | Frontend URL (Vercel) | `https://yourfrontend.vercel.app` |
| `DB_DATABASE` | MySQL database name | `docupdf` |
| `SANCTUM_STATEFUL_DOMAINS` | CORS domains | Frontend URL |
| `MAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `SSLCOMMERZ_STORE_ID` | SSLCommerz Store ID | - |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz Store Password | - |

## Next.js Frontend Integration

In your Next.js frontend, create an API client:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yourdomain.com/api';

export async function apiClient(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
```

## Folder Structure

```
backend/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Providers/
│   └── Services/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── public/
│   ├── .htaccess
│   ├── index.php
│   └── uploads/
├── routes/
├── storage/
└── tests/
```
