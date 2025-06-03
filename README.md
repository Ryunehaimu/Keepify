# Setup Backend (NestJS) - di dalam folder backend/
1. Masuk ke Direktori Backend:
    cd backend
2. npm install
    Ini akan menginstal semua dependensi yang tercantum di package.json backend, 
    seperti @nestjs/core, typeorm, mysql2, @nestjs/jwt, dll.
3. Buat File Environment (.env):
    copy saja
    #Database
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=root 
    DB_PASSWORD=PASSWORD_DATABASE_ANDA_JIKA_ADA
    DB_DATABASE=keepify_db 

    #JWT
    JWT_SECRET=your-super-secret-jwt-key-keepify-2024 # Gunakan secret yang sama atau yang baru tapi kuat
    JWT_EXPIRES_IN=7d

    #App
    PORT=3001 # Atau port lain jika 3001 sudah digunakan
    NODE_ENV=development

    #File Upload
    UPLOAD_PATH=./uploads
    MAX_FILE_SIZE=10485760

    #Frontend URL (for CORS)
    FRONTEND_URL=http://localhost:3000 # Sesuaikan jika port frontend berbeda
4. Import DB
    ada di file DB-Backup
5. Jalankan Backend Development Server:
    npm run start:dev

# Setup Frontend (Next.js) - di dalam folder frontend/

1. Masuk ke Direktori Frontend:
    cd frontend
2. Install Dependencies:
    npm install
3. Buat File Environment (.env.local):
    copy aja
    NEXT_PUBLIC_API_URL=http://localhost:3001 
4. Jalankan Frontend Development Server:
    npm run dev


START XAMPP JANGAN LUPA


src/
│
├── app/
│   │
│   ├── dashboard/
│   │   └── page.tsx  // (dan komponen lain untuk dashboard jika ada)
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   ├── layout.tsx     // Root Layout untuk /app
│   └── page.tsx       // Halaman utama Anda (misalnya, landing page jika '/')
│
├── contexts/
│   └── AuthContext.tsx
│
├── lib/                 // (Direktori ini ada di panduan untuk apiClient.ts)
│   └── api.ts
│
├── types/               // (Direktori ini ada di panduan untuk definisi tipe)
│   └── index.ts
│
├── components/          // (Direktori ini ada di panduan untuk komponen UI reusable)
│   └── (Contoh: Button.tsx, InputField.tsx, dll.)
│
├── styles/              // (Direktori ini ada di panduan untuk konfigurasi Tailwind)
│   └── globals.css      // (Nama file ini mungkin berbeda, tapi di panduan adalah globals.css)
│
└── favicon.ico          // (File ini ada di contoh Anda, globals.css juga)


backend/
│
├── src/
│   │
│   ├── app.module.ts              // Modul utama aplikasi [cite: 2, 16, 19, 22, 23]
│   ├── main.ts                    // Titik masuk aplikasi NestJS
│   │
│   ├── auth/                      // Modul untuk autentikasi [cite: 2, 15]
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts        // Strategi JWT untuk Passport
│   │   ├── jwt-auth.guard.ts      // Guard untuk melindungi rute dengan JWT [cite: 66]
│   │   └── dto/                   // Data Transfer Objects untuk auth [cite: 24]
│   │       ├── login-user.dto.ts
│   │       └── register-user.dto.ts
│   │
│   ├── users/                     // Modul untuk manajemen pengguna [cite: 2, 15]
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/              // Entitas TypeORM untuk pengguna [cite: 2, 24]
│   │   │   └── user.entity.ts     // [cite: 27, 28, 29, 30]
│   │   └── dto/                   // DTO untuk pengguna [cite: 24]
│   │       ├── create-user.dto.ts // (Contoh, bisa Anda tambahkan)
│   │       └── update-user.dto.ts // (Contoh)
│   │
│   ├── items/                     // Modul untuk penitipan barang [cite: 2, 15]
│   │   ├── items.module.ts
│   │   ├── items.controller.ts
│   │   ├── items.service.ts
│   │   ├── entities/              // Entitas untuk barang titipan [cite: 2, 24]
│   │   │   ├── storage-item.entity.ts // [cite: 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]
│   │   │   └── item-detail.entity.ts  // [cite: 33] (SQL ada di [cite: 6])
│   │   └── dto/                   // DTO untuk item [cite: 24]
│   │
│   ├── monitoring/                // Modul untuk monitoring & foto [cite: 2, 15]
│   │   ├── monitoring.module.ts
│   │   ├── monitoring.controller.ts
│   │   ├── monitoring.service.ts
│   │   └── entities/              // Entitas untuk monitoring [cite: 2, 24]
│   │       ├── monitoring-record.entity.ts // [cite: 33] (SQL ada di [cite: 8, 9])
│   │       └── monitoring-photo.entity.ts  // (SQL ada di [cite: 9])
│   │
│   ├── pickup/                    // Modul untuk manajemen pickup [cite: 2, 15]
│   │   ├── pickup.module.ts
│   │   ├── pickup.controller.ts
│   │   ├── pickup.service.ts
│   │   └── entities/              // [cite: 2, 24] (Jika ada entitas spesifik pickup)
│   │
│   ├── checklist/                 // Modul untuk sistem checklist [cite: 2, 15]
│   │   ├── checklist.module.ts
│   │   ├── checklist.controller.ts
│   │   ├── checklist.service.ts
│   │   └── entities/              // Entitas untuk checklist [cite: 2, 24]
│   │       └── checklist.entity.ts // (SQL untuk tabel 'checklists' ada di [cite: 7])
│   │
│   ├── signature/                 // Modul untuk tanda tangan digital [cite: 2, 15]
│   │   ├── signature.module.ts
│   │   ├── signature.controller.ts
│   │   ├── signature.service.ts
│   │   └── entities/              // Entitas untuk tanda tangan digital [cite: 2, 24]
│   │       └── digital-signature.entity.ts // (SQL untuk tabel 'digital_signatures' ada di [cite: 7, 8])
│   │
│   ├── admin/                     // Modul untuk dashboard admin [cite: 2, 15]
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   └── admin.service.ts
│   │
│   ├── uploads/                   // Modul untuk penanganan file unggah [cite: 2, 15]
│   │   ├── uploads.module.ts
│   │   ├── uploads.controller.ts  // Dibuat terpisah menurut panduan [cite: 66]
│   │   └── uploads.service.ts     // Dibuat terpisah menurut panduan [cite: 66]
│   │
│   └── common/                    // Modul/utilitas bersama [cite: 2]
│       ├── entities/              // Entitas dasar [cite: 2, 24]
│       │   └── base.entity.ts     // [cite: 26]
│       ├── guards/                // Guard bersama [cite: 24]
│       ├── decorators/            // Dekorator kustom [cite: 24]
│       └── interfaces/            // Interface bersama [cite: 24]
│
├── uploads/                     // Direktori fisik untuk menyimpan file yang diunggah [cite: 14, 24]
│
├── .env                         // File konfigurasi environment [cite: 14]
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json                 // [cite: 2]
├── README.md
├── tsconfig.build.json
└── tsconfig.json