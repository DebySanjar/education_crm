# Hissa qo'shish uchun yo'riqnoma

Avtomaktab loyihasiga hissa qo'shganingiz uchun rahmat! 😊

## Qanday hissa qo'shish mumkin?

- 🐛 Xatolarni tuzatish
- ✨ Yangi funksiyalar qo'shish
- 📖 Dokumentatsiyani yaxshilash
- 🎨 UI/UXni yaxshilash
- 🧪 Testlar qo'shish

---

## Ish tartibi

### 1. Reponi fork qilish

Birinchi navbatda, repo'ni o'zingizning GitHub profilingizga fork qiling.

### 2. Klonlash

Fork qilgan reponi lokal kompyuteringizga klonlang:

```bash
git clone https://github.com/[SIZNING-NICKNAME]/education_crm.git
cd avtomaktab
```

### 3. Branch yaratish

Yangi branch yarating (ism berishda tavsiya etiladi):

```bash
# Xato uchun
git checkout -b fix/hato-nomi

# Yangi funksiya uchun
git checkout -b feature/yangi-funksiya

# Dokumentatsiya uchun
git checkout -b docs/dokumentatsiya
```

### 4. O'zgarishlarni amalga oshirish

Kerakli o'zgarishlarni amalga oshiring.

### 5. O'zgarishlarni commit qilish

O'zgarishlarni commit qiling:

```bash
git add .
git commit -m "Qisqa va tushunarli xabar"
```

**Commit message qoidalari:**

- `fix:` - Xato tuzatish
- `feat:` - Yangi funksiya
- `docs:` - Dokumentatsiya
- `style:` - Formatlash, nuqtalar, ranglar va h.k.
- `refactor:` - Kodni qayta ishlash
- `test:` - Testlar
- `chore:` - Boshqa vazifalar

**Misol:**

```bash
git commit -m "fix: arizalar badge yo'qolmasligi tuzatildi"
git commit -m "feat: sorovnomani tahrirlash funksiyasi qo'shildi"
git commit -m "docs: README.md yangilandi"
```

### 6. Push qilish

O'zgarishlarni fork qilingan repoga push qiling:

```bash
git push origin [BRANCH-NOMI]
```

### 7. Pull Request ochish

GitHubda Pull Request (PR) oching.

**PR uchun qoidalar:**

- To'liq va tushunarli sarlavha
- O'zgarishlarni tushuntiruvchi tavsif
- (Agar kerak bo'lsa) screenshotlar qo'shish
- Issue raqamini ulash (agar mavjud bo'lsa)

---

## Kod standartlari

### JavaScript/React

- ESLint qoidalariga amal qiling
- Prettier bilan formatlash
- 2 ta bo'sh joy indentatsiya
- Semicolon qo'shish

```javascript
// Yaxshi
const myFunction = () => {
  return true;
};

// Yomon
const myFunction=()=>{
return true
}
```

### Styled Components

- Styled componentlarni filening yuqori qismida e'lon qiling
- O'qiladigan nomlar ishlating
- Odatiy CSS qoidalariga amal qiling

```jsx
// Yaxshi
const Button = styled.button`
  padding: 10px 20px;
  background: blue;
`;

// Yomon
const Btn = styled.button`padding:10px 20px;background:blue;`;
```

---

## Xato hisoblari

Xato topsangiz, GitHub Issues orqali xabar bering!

**Xato xabari uchun shakl:**

```
**Xato tavsifi:**
Qisqa va aniq xato haqida.

**Qayta tiklash:**
1. Sahifaga o'ting
2. Tugmani bosing
3. Xato chiqadi

**Kutilayotgan natija:**
Nima bo'lishi kerak edi?

**Foydalanilgan tizim:**
- OS: Windows 11
- Brauzer: Chrome 125
```

---

## Testlar

Agar mumkin bo'lsa, o'zgarishlaringiz uchun test yozing.

Testlarni ishga tushirish:

```bash
npm test
```

---

## Savollar yoki muammolar?

Savollaringiz bo'lsa, issue oching yoki biz bilan bog'laning!

---

## Hissa qo'shuvchilar

Barcha hissa qo'shuvchilar ro'yxati! 🎉

---

🎉 Hissa qo'shganingiz uchun rahmat!
