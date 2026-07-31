# AuraGold Durian — Monorepo

ระบบฟาร์มทุเรียนและแปรรูป: **Next.js (เว็บสาธารณะ + Admin)** + **Laravel (API)**

## โครงสร้าง

| โฟลเดอร์ | คำอธิบาย |
|----------|----------|
| `backend/` | Laravel 12 API + Sanctum + CRUD ทุกโมดูล |
| `apps/web/` | Next.js 16 — เว็บลูกค้า + `/admin` |

## เริ่มต้นใช้งาน

### 1) Backend (พอร์ต 8000)

```bash
cd backend
php artisan migrate:fresh --seed
php artisan serve
```

### 2) Frontend (พอร์ต 3000)

```bash
cd apps/web
npm run dev
```

ตั้งค่า Google Maps (สำหรับหน้า **ดูแปลงปลูก** โหมด Google):

```env
# apps/web/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_real_key
```

เปิด **Maps JavaScript API** ใน Google Cloud Console แล้วรีสตาร์ท `npm run dev`

- เว็บลูกค้า: http://localhost:3000  
  (แต่ละ section บนหน้าแรกดึงจาก API — แก้ได้ด้วย CRUD)
- **Admin Dashboard:** http://localhost:3000/admin
- **CRUD หน้าแรก:** http://localhost:3000/admin/website
- Login: `admin@auragold.test` / `password`

## Admin CRUD ที่มีแล้ว

| เมนู | API |
|------|-----|
| Dashboard | `GET /api/v1/admin/dashboard` |
| หน้าแรก Sections | `/site-sections` + public `GET /home` |
| ฟาร์ม / แปลง / ต้น / กิจกรรม | `/farms` `/plots` `/trees` `/farm-activities` |
| เก็บเกี่ยว (+ สร้าง LOT อัตโนมัติ) | `/harvests` |
| LOT | `/lots` |
| รับวัตถุดิบ | `/receivings` |
| QC & คัดเกรด | `/quality-inspections` |
| แปรรูป (Yield อัตโนมัติ) | `/production-batches` |
| คลัง + เคลื่อนไหวสต็อก | `/inventory-items` |
| ลูกค้า / ออเดอร์ | `/customers` `/orders` |
| สินค้าเว็บ | `/products` |
| Trace | `/trace?code=` |
| ตั้งค่า / อัปโหลดไฟล์ | `/settings` `/media` |
| ข้อความติดต่อ | `/contact-inquiries` |

## Storage

- Dev: disk `public` (`storage/app/public`)
- Prod: ตั้ง `FILESYSTEM_DISK=s3` ใน `.env` ได้เลย
- อัปโหลด: `POST /api/v1/admin/media` (ต้อง login)

## Public API

- `GET /api/v1/public/products`
- `GET /api/v1/public/trace?code=LOT-2026-0001`
- `POST /api/v1/public/contact`

## Deploy

### Frontend (Vercel)

- Live: https://auragold-durian.vercel.app  
- Repo: https://github.com/Thanitasjc/Durian  
- Set env `API_URL` = public Laravel API base URL (no trailing slash)

### Backend database (Supabase)

- Project: **auragold-durian** (org AuraGold Durian)  
- Dashboard: https://supabase.com/dashboard/project/anefnlhwarioumxdyrpa  
- Region: Southeast Asia (Singapore)  
- Local `.env` uses **Session pooler** (IPv4):  
  `aws-0-ap-southeast-1.pooler.supabase.com:5432`  
  user `postgres.<project-ref>` + `DB_SSLMODE=require`  
  (Direct `db.<ref>.supabase.co` is IPv6-only — often fails on Windows.)

Migrations + seed already applied against this project.

To recreate / re-link via CLI:

```powershell
cd backend
$env:SUPABASE_ACCESS_TOKEN = "sbp_YOUR_TOKEN"   # https://supabase.com/dashboard/account/tokens
.\scripts\setup_supabase.ps1
php artisan migrate:fresh --seed
```

### Laravel API (Render)

- Live API: https://auragold-durian-api.onrender.com  
- Health: `GET /up`  
- Free instance may cold-start after idle (first request can take ~30–60s)  
- Vercel env: `API_URL=https://auragold-durian-api.onrender.com`  
- DB: same Supabase Postgres as local `backend/.env`
