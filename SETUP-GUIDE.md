# cPanel + Vercel Backend Setup — Complete Guide

## আপনি কী পাবেন এই গাইড থেকে
- cPanel সার্ভার দিয়ে API-based backend তৈরি
- ইমেজ/ফাইল আপলোড সিস্টেম
- ব্লগ/ডাটা স্টোরেজ (JSON API)
- Next.js ফ্রন্টএন্ড + cPanel ব্যাকএন্ড কানেক্ট
- Admin Panel থেকে সব কাজ করা যাবে

---

## PART 1: প্রয়োজনীয় জিনিস

### যা কিনতে হবে
1. **Vercel Account** (ফ্রি) — ওয়েবসাইট হোস্ট করার জন্য
2. **cPanel Hosting** (যেকোনো প্রোভাইডার) — PHP API + ফাইল স্টোরেজের জন্য
3. **GitHub Account** — কোড স্টোর করার জন্য
4. **Domain** — আপনার সাইটের নাম

### cPanel সার্ভার কিনলে যা পাবেন
- Host, Username, Password, IP Address
- DNS Management
- Subdomain creation capability
- PHP support (version 8+)

---

## PART 2: cPanel Subdomain তৈরি (Backend API এর জন্য)

### Step 1: Subdomain তৈরি করুন
1. cPanel Login → **Subdomains**
2. Create subdomain:
   - Subdomain: `api` (or `img`, `server` — যেটা পছন্দ)
   - Domain: `yourdomain.com`
   - Document Root: `/public_html/api`
3. Save

### Step 2: DNS A Record যোগ করুন
1. cPanel → **Zone Editor** → `yourdomain.com` → **Manage**
2. Add Record:
   - Name: `api.yourdomain.com`
   - Type: `A`
   - Record: `[your server IP]`
   - TTL: 14400
3. Save

### Step 3: Verify Subdomain
- Wait 5-10 minutes
- Visit `https://api.yourdomain.com/phpinfo.php`
- If you see PHP info page → PHP is working ✓

---

## PART 3: PHP API — Image Upload Handler

### File: `/public_html/api/upload.php`

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(0); }
header("Content-Type: application/json");

$dir = __DIR__ . "/images/uploads";
if (!is_dir($dir)) { mkdir($dir, 0755, true); }

$b64 = isset($_POST["base64"]) ? $_POST["base64"] : "";
$ext = isset($_POST["ext"]) ? preg_replace("/[^a-z0-9]/i", "", $_POST["ext"]) : "jpg";

if (!$b64) {
    http_response_code(400);
    echo json_encode(array("error" => "No base64 data"));
    exit;
}

$data = base64_decode($b64);
if ($data === false) {
    http_response_code(400);
    echo json_encode(array("error" => "Invalid base64"));
    exit;
}

$name = bin2hex(random_bytes(12)) . "-" . time() . "." . $ext;
$dest = $dir . "/" . $name;

if (file_put_contents($dest, $data) === false) {
    http_response_code(500);
    echo json_encode(array("error" => "Save failed"));
    exit;
}

$baseUrl = (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off"
    ? "https://" : "http://") . $_SERVER["HTTP_HOST"];

echo json_encode(array(
    "url" => $baseUrl . "/images/uploads/" . $name,
    "success" => true
));
```

### Test Upload
```bash
# Test with curl
curl -X POST https://api.yourdomain.com/upload.php \
  -d "base64=$(echo -n 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' | base64)" \
  -d "ext=png"
```

---

## PART 4: PHP API — Data Storage (Blog/Posts)

### File: `/public_html/api/data-api.php`

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Api-Key");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(0); }
header("Content-Type: application/json");

$API_KEY = "your-secret-api-key-change-this";
$DATA_FILE = __DIR__ . "/data/store.json";
$DATA_DIR = __DIR__ . "/data";

if (!is_dir($DATA_DIR)) { mkdir($DATA_DIR, 0755, true); }
if (!file_exists($DATA_FILE)) { file_put_contents($DATA_FILE, "[]"); }

function readData() {
    global $DATA_FILE;
    $c = file_get_contents($DATA_FILE);
    $d = json_decode($c, true);
    return is_array($d) ? $d : array();
}

function writeData($arr) {
    global $DATA_FILE;
    return file_put_contents($DATA_FILE, json_encode(
        $arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    ));
}

$method = $_SERVER["REQUEST_METHOD"];
$key = isset($_SERVER["HTTP_X_API_KEY"]) ? $_SERVER["HTTP_X_API_KEY"] : "";

// GET — public read
if ($method === "GET") {
    $items = readData();
    $published = isset($_GET["published"]) && $_GET["published"] === "1";
    if ($published) {
        $items = array_values(array_filter($items, function($item) {
            return isset($item["published"]) && $item["published"];
        }));
    }
    echo json_encode(array("items" => $items, "count" => count($items)));
    exit;
}

// Write operations require API key
if ($key !== $API_KEY) {
    http_response_code(401);
    echo json_encode(array("error" => "Unauthorized"));
    exit;
}

$raw = file_get_contents("php://input");
$payload = $raw ? json_decode($raw, true) : array();

// POST — create or update (upsert by id)
if ($method === "POST") {
    $items = readData();
    if (!isset($payload["id"])) {
        http_response_code(400);
        echo json_encode(array("error" => "id required"));
        exit;
    }
    $payload["updatedAt"] = date("c");
    $idx = -1;
    foreach ($items as $i => $item) {
        if ($item["id"] === $payload["id"]) { $idx = $i; break; }
    }
    if ($idx >= 0) {
        $items[$idx] = $payload;
    } else {
        $items[] = $payload;
    }
    writeData($items);
    echo json_encode(array("success" => true, "count" => count($items)));
    exit;
}

// PUT — update by id
if ($method === "PUT") {
    if (!isset($payload["id"])) {
        http_response_code(400);
        echo json_encode(array("error" => "id required"));
        exit;
    }
    $items = readData();
    $found = false;
    foreach ($items as $i => $item) {
        if ($item["id"] === $payload["id"]) {
            $payload["updatedAt"] = date("c");
            $items[$i] = $payload;
            $found = true;
            break;
        }
    }
    if (!$found) {
        http_response_code(404);
        echo json_encode(array("error" => "not found"));
        exit;
    }
    writeData($items);
    echo json_encode(array("success" => true));
    exit;
}

// DELETE — remove by id
if ($method === "DELETE") {
    $id = isset($_GET["id"]) ? $_GET["id"] : (isset($payload["id"]) ? $payload["id"] : "");
    if (!$id) {
        http_response_code(400);
        echo json_encode(array("error" => "id required"));
        exit;
    }
    $items = readData();
    $items = array_values(array_filter($items, function($item) use ($id) {
        return $item["id"] !== $id;
    }));
    writeData($items);
    echo json_encode(array("success" => true, "count" => count($items)));
    exit;
}

http_response_code(405);
echo json_encode(array("error" => "Method not allowed"));
```

---

## PART 5: Next.js API Routes (Vercel ↔ cPanel Bridge)

### 5.1 Config File: `lib/server-config.ts`

```typescript
export const SERVER_API_URL = "https://api.yourdomain.com/data-api.php";
export const SERVER_API_KEY = "your-secret-api-key-change-this";
export const UPLOAD_URL = "https://api.yourdomain.com/upload.php";
```

### 5.2 Upload Route: `app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_URL } from "@/lib/server-config";

export async function POST(req: NextRequest) {
  try {
    const { base64, ext } = await req.json();
    if (!base64) {
      return NextResponse.json({ error: "No image data" }, { status: 400 });
    }

    const form = new URLSearchParams();
    form.set("base64", base64);
    form.set("ext", ext || "jpg");

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: "Upload failed" }, { status: 502 });
    }

    const data = JSON.parse(text);
    if (!data.url) {
      return NextResponse.json({ error: data.error || "No URL" }, { status: 502 });
    }

    return NextResponse.json({ url: data.url, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 5.3 Data Route: `app/api/items/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { SERVER_API_URL, SERVER_API_KEY } from "@/lib/server-config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const published = req.nextUrl.searchParams.get("published");
    const url = published === "1"
      ? `${SERVER_API_URL}?published=1`
      : SERVER_API_URL;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(SERVER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": SERVER_API_KEY
      },
      body,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(SERVER_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": SERVER_API_KEY
      },
      body,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const url = id
      ? `${SERVER_API_URL}?id=${encodeURIComponent(id)}`
      : SERVER_API_URL;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "X-Api-Key": SERVER_API_KEY },
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## PART 6: next.config.ts — Image Domain Allow

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'api.yourdomain.com',  // ← আপনার cPanel subdomain
      port: '',
      pathname: '/**',
    },
  ],
},
```

---

## PART 7: Admin Panel — Upload Button (JavaScript)

```javascript
// Upload image to cPanel server via Next.js API
function uploadImage(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result.split(',')[1] || '';
    const ext = (file.name.split('.').pop() || 'jpg')
      .toLowerCase().replace(/[^a-z0-9]/g, '');

    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64: base64, ext: ext })
    })
    .then(r => r.json())
    .then(function(out) {
      if (out.url) {
        // Set the hosted URL to your form field
        document.getElementById('imageUrl').value = out.url;
        alert('Uploaded: ' + out.url);
      } else {
        alert('Upload failed: ' + (out.error || 'unknown'));
      }
    })
    .catch(function(err) {
      alert('Error: ' + err.message);
    });
  };
  reader.readAsDataURL(file);
}
```

---

## PART 8: Deployment Steps

### Vercel Deploy
1. Push code to GitHub
2. Vercel → Import Project → Select GitHub repo
3. Set Environment Variables (if needed)
4. Deploy

### cPanel Setup
1. Login to cPanel
2. Create subdomain (e.g., `api.yourdomain.com`)
3. Upload PHP files via File Manager or FTP
4. Test: `https://api.yourdomain.com/upload.php`

### DNS Propagation
- Wait 5-10 minutes for DNS changes
- Use https://dnschecker.org to verify

---

## PART 9: Testing Checklist

- [ ] `https://api.yourdomain.com/phpinfo.php` → Shows PHP info
- [ ] `https://api.yourdomain.com/upload.php` (GET) → Returns error JSON (not 404)
- [ ] `https://api.yourdomain.com/data-api.php` (GET) → Returns `{"items":[],"count":0}`
- [ ] Upload test via curl → Returns URL
- [ ] Next.js `/api/upload` → Returns URL
- [ ] Next.js `/api/items` → Returns data
- [ ] Image URL loads in browser

---

## PART 10: File Structure

```
yourdomain.com (Vercel)
├── app/
│   ├── api/
│   │   ├── upload/route.ts      ← bridges to cPanel upload.php
│   │   └── items/route.ts       ← bridges to cPanel data-api.php
│   ├── page.tsx                 ← homepage
│   └── layout.tsx
├── lib/
│   └── server-config.ts         ← cPanel URLs + API key
└── next.config.ts               ← image domains

cPanel (api.yourdomain.com)
├── upload.php                   ← image upload handler
├── data-api.php                 ← JSON data CRUD
├── images/uploads/              ← uploaded images
└── data/store.json              ← stored data (blogs, posts, etc.)
```

---

## PART 11: Security Notes

1. **Change the API key** in `data-api.php` — use a strong random string
2. **HTTPS** — always use HTTPS for both Vercel and cPanel
3. **CORS** — set `Access-Control-Allow-Origin` to your domain in production
4. **File types** — validate file extensions in upload.php
5. **File size** — add size limits in PHP (`upload_max_filesize` in php.ini)
6. **Rate limiting** — add rate limiting to prevent abuse

---

## Quick Copy — Give This to AI Agent

```
Set up a cPanel + Vercel backend:

1. Create subdomain "api" on cPanel hosting (IP: X.X.X.X)
2. Add DNS A record: api.yourdomain.com → X.X.X.X
3. Upload upload.php (base64 image upload, saves to /images/uploads/)
4. Upload data-api.php (JSON CRUD, requires X-Api-Key header for writes)
5. In Next.js: create /api/upload and /api/items routes that proxy to cPanel
6. Add cPanel subdomain to next.config.ts images.remotePatterns
7. Deploy to Vercel

Files needed:
- /public_html/api/upload.php (PHP image upload)
- /public_html/api/data-api.php (PHP JSON data store)
- /app/api/upload/route.ts (Next.js proxy)
- /app/api/items/route.ts (Next.js proxy)
- /lib/server-config.ts (cPanel URLs + API key)

Change: yourdomain.com, server IP, API key, and file paths.
```
