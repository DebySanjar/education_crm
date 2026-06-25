# Avtomaktab - O'quv Markaz Boshqaruv Tizimi

Modern va professional o'quv markazi CRM tizimi. React, Firebase va Taro yordamida yaratilgan.

## 🚀 Xususiyatlar

- **O'quvchilar boshqaruvi**: O'quvchilarni qo'shish, tahrirlash, o'chirish
- **Guruhlar**: O'quvchilarni guruhlarga ajratish
- **Davomat**: Har kuni davomatni olish va kuzatish
- **To'lovlar**: To'lovlarni qayd etish va kuzatish
- **Xarajatlar**: Xarajatlarni boshqarish
- **Sorovnomalar**: Ariza formalarini yaratish va boshqarish
- **Arizachilar**: Yuborilgan arizalarni ko'rish va boshqarish
- **Statistika**: Umumiy statistikani ko'rish
- **Real-time**: Firebase real-time database orqali ma'lumotlar darhol yangilanadi

## 🛠️ Texnologiyalar

- **React 18** - UI kutubxonasi
- **Firebase** - Backend va database
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animatsiyalar
- **React Router** - Navigation
- **Taro** - Cross-platform dasturlar uchun (agar kerak bo'lsa)

## 📦 O'rnatish

### 1. Reponi klonlash

```bash
git clone https://github.com/DebySanjar/education_crm.git
cd avtomaktab
```

### 2. Dependencies o'rnatish

```bash
npm install
```

### 3. Firebase sozlash

1. Firebase konsoliga o'ting: https://console.firebase.google.com/
2. Yangi loyiha yarating
3. Firestore Database ni yoqing
4. Authentication ni yoqing (Email/Password)
5. Firebase config faylini oling va `src/config/firebase.js` ga joylashtiring

Misol:

```javascript
// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

### 4. Dasturni ishga tushirish

```bash
npm run dev
```

Dastur http://localhost:5173 da ochiladi.

## 📁 Loyiha tuzilishi

```
avtomaktab/
├── src/
│   ├── components/       # Reusable komponentlar
│   ├── config/           # Firebase konfiguratsiyasi
│   ├── context/          # React Context (Auth, Data, Toast)
│   ├── layouts/          # Layout komponentlar (DashboardLayout)
│   ├── pages/            # Sahifalar
│   ├── services/         # Firebase servislari
│   ├── utils/            # Yordamchi funksiyalar
│   ├── App.jsx           # Asosiy App komponent
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables example
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Foydalanish

### 1. Login

Admin hisobi bilan tizimga kiring.

### 2. O'quvchilarni qo'shish

"O'quvchilar" sahifasiga o'ting va "Yangi o'quvchi" tugmasini bosing.

### 3. Guruhlarni yaratish

"O'quvchilar" → "Guruhlar" sahifasida guruhlarni yarating.

### 4. Davomatni olish

"Davomat" sahifasida har kuni davomatni oling.

### 5. To'lovlarni qo'shish

"To'lovlar" sahifasida to'lovlarni qayd eting.

### 6. Sorovnomalar yaratish

"Sorovnomalar" sahifasida yangi ariza formalarini yarating.

## 🔒 Xavfsizlik

- Firestore rules ni to'g'ri sozlash majburiy
- Admin faqat autentifikatsiyalangan foydalanuvchi bo'lishi kerak
- Ma'lumotlarni zaxiralashni doimiy qiling

## 📊 Firestore Database Strukturasi

```
students/
  - id
  - name
  - phone
  - group
  - joinDate
  - paid
  - ...

groups/
  - id
  - name
  - ...

payments/
  - id
  - studentId
  - amount
  - date
  - ...

expenses/
  - id
  - description
  - amount
  - date
  - ...

surveys/
  - id
  - name
  - description
  - fields
  - views
  - submissions
  - createdAt
  - ...

submissions/
  - id
  - surveyId
  - surveyName
  - ...formData
  - isRead
  - createdAt
  - ...
```

## 🚀 Deploy

### Vercel orqali deploy

1. GitHub repo'sini Vercel bilan ulang
2. Environment variables ni qo'shing
3. Deploy tugmasini bosing!

### Boshqa usullar

- Netlify
- Firebase Hosting
- Heroku

## 🤝 Hissa qo'shish

Iltimos, [CONTRIBUTING.md](./CONTRIBUTING.md) faylini o'qing.

## 📄 Litsenziya

MIT License - [LICENSE](./LICENSE) fayliga qarang.

## 📞 Aloqa

Muammo yoki savollaringiz bo'lsa, issue oching yoki biz bilan bog'laning!

---

⭐️ Agar loyiha sizga yoqsa, yulduzcha qo'yishni unutmang!
