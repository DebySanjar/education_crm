# Avtomaktab - To'liq Dokumentatsiya

## Mundarija

1. [Boshlanish](#boshlanish)
2. [Sahifalar](#sahifalar)
3. [Komponentlar](#komponentlar)
4. [Context API](#context-api)
5. [Firebase Servislari](#firebase-servislari)
6. [Style Guide](#style-guide)

---

## Boshlanish

### Loyiha haqida qisqacha

Avtomaktab - o'quv markazlar uchun professional CRM tizimi. U quyidagi funksiyalarni taqdim etadi:

- O'quvchilar boshqaruvi
- Guruhlar boshqaruvi
- Davomat kuzatuvi
- To'lovlar hisobi
- Xarajatlar hisobi
- Sorovnomalar (Ariza formalar)
- Statistika va hisobotlar

### Talablar

- Node.js 16+
- NPM yoki Yarn
- Firebase hisobi
- Modern brauzer (Chrome, Firefox, Safari, Edge)

---

## Sahifalar

### 1. Bosh sahifa (`/`)

Umumiy statistika va ko'rsatkichlarni ko'rsatadi.

**Xususiyatlari:**
- Umumiy o'quvchilar soni
- Bugungi davomat
- Bugungi to'lovlar
- Oxirgi to'lovlar
- Statistik grafiklar (agar mavjud bo'lsa)

### 2. O'quvchilar (`/students`)

O'quvchilar ro'yxatini boshqarish.

**Xususiyatlari:**
- O'quvchi qo'shish
- O'quvchini tahrirlash
- O'quvchini o'chirish
- Guruh bo'yicha filtrlash
- Qidiruv

**O'quvchi ma'lumotlari:**
- Ism va familiya
- Telefon raqami
- Guruhi
- Qo'shilgan sana
- To'langan summasi
- Qo'shimcha ma'lumotlar

### 3. Guruhlar (`/groups`)

Guruhlarni boshqarish.

**Xususiyatlari:**
- Yangi guruh yaratish
- Guruhni tahrirlash
- Guruhni o'chirish
- Guruhdagi o'quvchilar soni

### 4. Davomat (`/attendance`)

Kunlik davomatni olish va kuzatish.

**Xususiyatlari:**
- Har kuni davomat olish
- O'quvchilarni "keldi" / "kelmadi" deb belgilash
- Sana bo'yicha filtrlash
- Davomat tarixini ko'rish

### 5. To'lovlar (`/payments`)

To'lovlarni qayd etish va kuzatish.

**Xususiyatlari:**
- Yangi to'lov qo'shish
- To'lovni tahrirlash
- To'lovni o'chirish
- O'quvchi bo'yicha filtrlash
- Sana bo'yicha filtrlash

### 6. Xarajatlar (`/expenses`)

Xarajatlarni boshqarish.

**Xususiyatlari:**
- Yangi xarajat qo'shish
- Xarajatni tahrirlash
- Xarajatni o'chirish
- Sana bo'yicha filtrlash

### 7. Sorovnomalar (`/surveys`)

Sorovnoma (ariza) formalarini yaratish va boshqarish.

**Xususiyatlari:**
- Yangi sorovnoma yaratish
- Sorovnomani tahrirlash
- Sorovnomani o'chirish
- Sorovnoma linkini nusxalash
- Formani ko'rish (preview)
- Ko'rish va yuborilganlar soni

**Sorovnoma maydonlari:**
- Ism va familiya (majburiy)
- Yosh
- Telefon raqam (majburiy)
- Manzil
- Jins
- Qo'shimcha savollar (textarea)

### 8. Arizachilar (`/surveys/submissions`)

Yuborilgan arizalarni ko'rish va boshqarish.

**Xususiyatlari:**
- Barcha arizalarni ko'rish
- Sorovnoma bo'yicha filtrlash
- Qidiruv
- O'qilmagan arizalar badge
- Arizani o'chirish
- Yangi arizalarni ajratib ko'rsatish

### 9. Statistika (`/statistics`)

Umumiy statistikani ko'rish.

**Xususiyatlari:**
- Grafiklar va diagrammalar
- O'quvchilar statistikasi
- To'lovlar statistikasi
- Davomat statistikasi

### 10. Sozlamalar (`/settings`)

Tizim sozlamalari.

---

## Komponentlar

### Reusable Komponentlar

#### `Checkbox.jsx`

Checkbox input komponenti.

**Props:**
- `checked` (boolean) - Checkbox holati
- `onChange` (function) - O'zgarish hodisasi
- `label` (string) - Label matni

#### `ExcelTicketBtn.jsx`

Excel faylini yuklab olish tugmasi.

**Props:**
- `data` (array) - Excelga yoziladigan ma'lumotlar
- `filename` (string) - Fayl nomi

#### `Skeleton.jsx`

Yuklanayotganda skeleton loader.

**Props:**
- `count` (number) - Skeletonlar soni
- `height` (string) - Balandligi

#### `TicketCards.jsx`

Bilet (ticket) kartalari.

---

## Context API

### 1. AuthContext (`src/context/AuthContext.jsx`)

Autentifikatsiya boshqaruvi.

**Qiymatlar:**
- `user` (object) - Joriy foydalanuvchi
- `login` (function) - Tizimga kirish
- `logout` (function) - Tizimdan chiqish
- `loading` (boolean) - Yuklanish holati

**Foydalanish:**

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  return <div>{user?.email}</div>;
}
```

### 2. DataContext (`src/context/DataContext.jsx`)

Umumiy ma'lumotlar boshqaruvi.

**Qiymatlar:**
- `students` (array) - O'quvchilar ro'yxati
- `surveys` (array) - Sorovnomalar ro'yxati
- `submissions` (array) - Arizalar ro'yxati
- `payments` (array) - To'lovlar ro'yxati
- `expenses` (array) - Xarajatlar ro'yxati
- `groups` (array) - Guruhlar ro'yxati
- `balance` (object) - Balans ma'lumotlari
- `unreadSubmissionsCount` (number) - O'qilmagan arizalar soni
- `loading` (boolean) - Yuklanish holati

**Funksiyalar:**
- `addStudent(studentData)` - Yangi o'quvchi qo'shish
- `updateStudent(id, data)` - O'quvchini yangilash
- `deleteStudent(id)` - O'quvchini o'chirish
- `addPayment(paymentData)` - To'lov qo'shish
- `addExpense(expenseData)` - Xarajat qo'shish
- `addSurvey(surveyData)` - Sorovnoma qo'shish
- `updateSurvey(id, data)` - Sorovnomani yangilash
- `deleteSurvey(id)` - Sorovnomani o'chirish
- `deleteSubmission(id, surveyId)` - Arizani o'chirish
- `markSubmissionsAsRead()` - Barcha arizalarni o'qilgan deb belgilash
- `markAttendance(date, studentId, status)` - Davomatni belgilash
- `saveAttendanceForDate(date, attendanceMap)` - Davomatni saqlash
- `refreshAttendance()` - Davomatni yangilash

**Foydalanish:**

```jsx
import { useData } from '../context/DataContext';

function MyComponent() {
  const { students, addStudent } = useData();
  return <div>{students.length}</div>;
}
```

### 3. ToastContext (`src/context/ToastContext.jsx`)

Toast bildirishnomalarini ko'rsatish.

**Funksiyalar:**
- `success(message)` - Muvaffaqiyatli toast
- `error(message)` - Xato toast
- `info(message)` - Ma'lumot toast

**Foydalanish:**

```jsx
import { useToast } from '../context/ToastContext';

function MyComponent() {
  const { success } = useToast();
  return <button onClick={() => success('Muvaffaqiyatli!')}>Click</button>;
}
```

---

## Firebase Servislari

### `firestoreService.js`

Firestore bilan ishlash uchun barcha servis funksiyalari.

**Import:**

```javascript
import {
  subscribeToStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  subscribeToSurveys,
  subscribeToSubmissions,
  addSurvey,
  updateSurvey,
  deleteSurvey,
  addSubmission,
  deleteSubmission,
  markAllSubmissionsAsRead,
  incrementSurveyViews,
  // ... va boshqalari
} from '../services/firestoreService';
```

**Asosiy funksiyalar:**

#### `subscribeToStudents(callback)`

O'quvchilar real-time eshitish.

```javascript
const unsubscribe = subscribeToStudents((students) => {
  console.log(students);
});

// To'xtatish uchun:
unsubscribe();
```

#### `addStudent(studentData)`

Yangi o'quvchi qo'shish.

```javascript
const result = await addStudent({
  name: 'Ali Valiev',
  phone: '+998901234567',
  group: 'A-1',
  paid: 0,
  joinDate: new Date()
});

if (result.success) {
  console.log('O\'quvchi qo\'shildi! ID:', result.id);
}
```

#### `addSurvey(surveyData)`

Yangi sorovnoma yaratish.

```javascript
const result = await addSurvey({
  name: '2024-yilgi qabul',
  description: 'Yangi o\'quvchilar uchun ariza formasi',
  fields: [
    { id: 'fullName', name: 'fullName', label: 'Ism va familiya', type: 'text', required: true },
    { id: 'phone', name: 'phone', label: 'Telefon raqam', type: 'tel', required: true },
  ],
  views: 0,
  submissions: 0
});
```

#### `markAllSubmissionsAsRead()`

Barcha arizalarni o'qilgan deb belgilash.

```javascript
await markAllSubmissionsAsRead();
```

---

## Style Guide

### Styled Components

Barcha styled-components quyidagi qoida bilan yoziladi:

```jsx
const ComponentName = styled.div`
  // Styles here
`;
```

### Ranglar

```javascript
// Asosiy ranglar
const COLORS = {
  primary: '#00e0ff',
  secondary: '#1a1d2e',
  background: '#0f1117',
  surface: '#13161f',
  textPrimary: '#e2e8f0',
  textSecondary: '#8892b0',
  border: '#1e2235',
  success: '#10b981',
  error: '#ff6b6b'
};
```

### Naming Convention

- Komponentlar: `PascalCase` (e.g., `SurveyPage.jsx`)
- Funksiyalar: `camelCase` (e.g., `handleSubmit`)
- Const: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Hooklar: `use` bilan boshlanadi (e.g., `useAuth`, `useData`)

---

## FAQ

### Q: Firestore qoidalarini qanday sozlashim kerak?

A: `firestore.rules` fayliga qarang. Bu faylda xavfsizlik qoidalari mavjud.

### Q: Yangi sahifa qanday qo'shishim kerak?

A:
1. `src/pages/` papkasiga yangi fayl yarating
2. `App.jsx` ga route qo'shing
3. `DashboardLayout.jsx` ga navigation item qo'shing

### Q: Yangi context qanday qo'shishim kerak?

A:
1. `src/context/` papkasiga yangi fayl yarating
2. Provider yaratish
3. `main.jsx` ga wrapping qo'shing

---

## Yordam

Muammo yoki savollaringiz bo'lsa:

1. GitHub Issues ni tekshiring
2. Yangi issue oching
3. Detail ma'lumot berishni unutmang

---

## Yangilanishlar tarixi

### v1.0.0 (2024-06-25)
- ✨ Barcha asosiy funksiyalar qo'shildi
- 🎨 Professional UI yangilandi
- 📱 Responsive dizayn
- 🔔 Arizalar uchun badge
- ✏️ Sorovnomalarni tahrirlash
