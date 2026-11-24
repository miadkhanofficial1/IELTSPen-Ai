# IELTSPen Ai — Workspace Rules & Behavioral Guidelines

## 1. Automatic GitHub Sync
Whenever you modify, add, or delete files in this repository in any response or task:
- Automatically stage all changes: `git add .`
- Automatically commit with a meaningful message (or fallback to `"update"`): `git commit -m "update"`
- Automatically push directly to remote: `git push origin main`

## 2. Architecture & Design System Integrity
- **Database Layer**: TiDB Serverless Cloud (MySQL 8.0) via `mysql2/promise` with SSL enabled (`minVersion: 'TLSv1.2'`, `rejectUnauthorized: true`).
- **Auth Layer**: Edge-compatible JWT cookies (`jose`) with `bcryptjs` password hashing. Admin is strictly `miadkhan.official1@gmail.com`.
- **UI Design System**: Ultra-minimalist iOS Liquid Glass (`backdrop-filter: blur(20px) saturate(180%)`), Crimson Red (`#E31837`), and Plus Jakarta Sans typography.
