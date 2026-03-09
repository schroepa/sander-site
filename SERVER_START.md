# Server Start Instructions

This project is a monorepo: **Grav CMS** (backend) + **Astro** (frontend).

## Prerequisites

- PHP 8.3+ (currently using 8.5.1)
- Node.js 18+ (currently using 22.18.0)

## 1. Backend — Grav CMS (port 8000)

```bash
cd cms
php -d error_reporting=E_ALL\&~E_DEPRECATED -d max_execution_time=300 -d upload_max_filesize=500M -d post_max_size=500M -S 0.0.0.0:8000 system/router.php
```

- Homepage: http://127.0.0.1:8000
- Admin panel: http://127.0.0.1:8000/admin

> **Note**: The `-d error_reporting` flag suppresses PHP 8.5 deprecation warnings in Grav 1.7.x.

## 2. Frontend — Astro (port 3000)

From the project root:

```bash
npm run dev
```

- Homepage: http://localhost:3000

## Both Servers at Once

```bash
# Terminal 1: Backend
cd cms && php -d error_reporting=E_ALL\&~E_DEPRECATED -d max_execution_time=300 -S 0.0.0.0:8000 system/router.php

# Terminal 2: Frontend (from project root)
npm run dev
```
