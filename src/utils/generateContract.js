export async function generateContract(student) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const m = 20
  const BOTTOM = 270 // kontent uchun pastki chegara (footer tepasi)

  const contractNum = student.id ? String(student.id).slice(-5).padStart(5, '0') : '00001'
  const today = new Date()
  const dateStr = today.toLocaleDateString('uz-UZ')
  const debt = Number(student.contractSum) - Number(student.paid)
  const pct = student.contractSum > 0 ? Math.round((student.paid / student.contractSum) * 100) : 0

  const fullNameVal = (student.fullName || '').trim()

  // ─── Helpers ─────────────────────────────────────────────────
  function drawTopStripe() {
    doc.setFillColor(0, 80, 160)
    doc.rect(0, 0, W, 6, 'F')
    doc.setFillColor(0, 160, 220)
    doc.rect(0, 6, W, 2, 'F')
  }

  // Bob sarlavhasi — faqat qalin matn (fon/ramka yo'q)
  function sectionHeader(text, y) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(20, 20, 20)
    doc.text(text, m, y)
    return y + 7
  }

  function infoRow(label, value, y) {
    const safeVal = (value === null || value === undefined) ? '' : String(value)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(60, 60, 60)
    doc.text(label, m + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(20, 20, 20)
    doc.text(safeVal, m + 72, y)
    doc.setDrawColor(225, 225, 225)
    doc.setLineWidth(0.2)
    doc.line(m, y + 2, W - m, y + 2)
    return y + 8
  }

  const CW = W - m * 2 // kontent kengligi

  function footer(pageLabel) {
    doc.setFillColor(0, 80, 160)
    doc.rect(0, 285, W, 4, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text('Shartnoma #' + contractNum + ' | ' + dateStr + ' | ' + pageLabel, W / 2, 283, { align: 'center' })
  }

  // Yangi sahifa ochish (kerak bo'lganda)
  let pageNo = 1
  function ensureSpace(y, needed) {
    if (y + needed > BOTTOM) {
      footer(pageNo + '-sahifa')
      doc.addPage()
      pageNo++
      drawTopStripe()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(0, 80, 160)
      doc.text('EXPRESS TEST — Shartnoma #' + contractNum + ' (davomi)', m, 16)
      doc.setDrawColor(0, 80, 160)
      doc.setLineWidth(0.4)
      doc.line(m, 18, W - m, 18)
      return 26
    }
    return y
  }

  // Oddiy paragraf (avtomatik qatorlarga bo'linadi)
  function paragraph(text, y, opts) {
    opts = opts || {}
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setFontSize(opts.size || 9)
    doc.setTextColor(opts.r ?? 40, opts.g ?? 40, opts.b ?? 40)
    const lines = doc.splitTextToSize(text, CW)
    lines.forEach(function (line) {
      y = ensureSpace(y, 6)
      doc.text(line, m, y)
      y += 5.5
    })
    return y + 1.5
  }

  // Raqamli band (1. matn) — osma chekinish bilan
  function listItem(num, text, y) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(0, 80, 160)
    const indent = 7
    const lines = doc.splitTextToSize(text, CW - indent)
    y = ensureSpace(y, lines.length * 5.5 + 1)
    doc.text(num + '.', m, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 40, 40)
    lines.forEach(function (line, i) {
      doc.text(line, m + indent, y + i * 5.5)
    })
    return y + lines.length * 5.5 + 2.5
  }

  // ─── PAGE 1 ───────────────────────────────────────────────────
  drawTopStripe()

  // Logo / nom qismi
  doc.setFillColor(248, 250, 255)
  doc.rect(0, 8, W, 30, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(0, 80, 160)
  doc.text('EXPRESS TEST', m, 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Haydovchilik guvohnomasi uchun nazariy tayyorlov kurslari", m, 29)

  // Sarlavha: SHARTNOMA (markazda)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(20, 20, 20)
  doc.text('SHARTNOMA', W / 2, 47, { align: 'center' })

  doc.setDrawColor(0, 80, 160)
  doc.setLineWidth(0.6)
  doc.line(m, 51, W - m, 51)

  // Kirish matni
  let y = 59
  y = paragraph(
    "Ushbu shartnoma Express test haydovchilik guvohnomasiga nazariy tayyorlov markazi va o'quvchi o'rtasida tuzilgan. Shartnoma amal qilish muddati 15 kun hisoblanadi.",
    y, { size: 9 }
  )
  y += 3

  // ── 1-BOB. SHARTNOMA TOMONLARI ──
  y = sectionHeader('1-BOB. SHARTNOMA TOMONLARI', y)
  y += 1
  y = infoRow("Markaz nomi:", "Express Test", y)
  y = infoRow("Markaz manzili:", "Farg'ona viloyati", y)
  y = infoRow("O'quvchi F.I.Sh.:", student.fullName || '', y)
  y = infoRow("Telefon raqami:", student.phone || '', y)
  y = infoRow("Pasport seriyasi:", student.passport || "Ko'rsatilmagan", y)
  y = infoRow("Tibbiy ma'lumotnoma:", student.medStatus || "Ko'rsatilmagan", y)
  y = infoRow("O'quv guruhi:", student.group || '', y)
  y += 5

  // ── 3-BOB. TO'LOV SHARTLARI ──
  y = sectionHeader("3-BOB. TO'LOV SHARTLARI", y)
  y += 1

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(0, 80, 160)
  y = infoRow("Shartnoma summasi:", Number(student.contractSum).toLocaleString() + " so'm", y)
  doc.setTextColor(16, 120, 80)
  y = infoRow("To'langan summa:", Number(student.paid).toLocaleString() + " so'm", y)
  doc.setTextColor(debt > 0 ? 180 : 16, debt > 0 ? 30 : 120, debt > 0 ? 30 : 80)
  y = infoRow("Qolgan qarz:", debt.toLocaleString() + " so'm", y)
  doc.setTextColor(40, 40, 40)
  y = infoRow("To'lov holati:", pct + "% to'langan", y)
  y += 3

  y = listItem('1', "To'lov har oyning 1-sanasigacha amalga oshirilishi shart.", y)
  y = listItem('2', "To'lov naqd pul yoki bank o'tkazmasi orqali qabul qilinadi.", y)
  y = listItem('3', "To'lov 7 kundan ortiq kechiktirilsa, Markaz o'quvchini guruhdan chiqarish huquqiga ega.", y)
  y += 4

  // ── O'QITUVCHINING MAJBURIYATLARI ──
  y = sectionHeader("O'qituvchining majburiyatlari:", y)
  y += 1
  y = listItem('1', "Nazariy o'quv kursi mashg'ulotlarini tashkil etish.", y)
  y = listItem('2', "O'quv kursi uchun kerakli darsliklar va testlarni taqdim etish.", y)
  y = listItem('3', "Uyda bajarish uchun topshiriqlar berish va tekshirib olish.", y)
  y += 4

  // ── O'QUVCHINING MAJBURIYATLARI ──
  y = sectionHeader("O'quvchining majburiyatlari:", y)
  y += 1
  y = listItem('1', "O'quv kursi davomida dars qoldirmaslik va kech qolmaslik.", y)
  y = listItem('2', "Uyga berilgan topshiriqlarni 100% to'g'ri va to'liq bajarishi.", y)
  y = listItem('3', "8-kun ichida olinadigan ichki imtihon 20 ta savoldan 18 tasiga to'g'ri javob berishi.", y)
  y = listItem('4', "Dars jarayonida o'quvchilarga halaqit bermaslik va ichki tartib qoidalariga amal qilish.", y)
  y += 1
  y = paragraph(
    "Yuqoridagi majburiyatlarni to'liq bajargan o'quvchi IMTIHON MARKAZI TEST sinovidan o'ta olmasa, ikkinchi imtihon to'lovi MUASSASA tomonidan to'lab beriladi.",
    y, { size: 9 }
  )
  y += 4

  // ── QO'SHIMCHA SHARTLAR ──
  y = sectionHeader("Qo'shimcha shartlar:", y)
  y += 1
  y = listItem('1', "Ichki imtihondan yiqilgan o'quvchi 15 kun ichida qayta imtihondan o'tishi shart.", y)
  y = listItem('2', "Kurs davomiyligi o'quvchi hohishiga ko'ra 15 kundan ortadigan bo'lsa, qayta tayyorlov kursini sotib olishi kerak.", y)
  y = paragraph("Qayta tayyorlov kursi narxi: 800.000 so'm.", y, { size: 9, bold: true })
  y = listItem('3', "Tomonlar o'rtasida nizolar kelib chiqsa, o'zaro muzokara yo'li bilan hal etiladi yoki qonunchilik tartibida ko'rib chiqiladi.", y)
  y = listItem('4', "O'quv kursi uchun to'langan to'lov istisnolarsiz qaytarib berilmaydi.", y)
  y += 3

  // ── Shartnoma muddati ──
  y = ensureSpace(y, 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
  doc.text("Ushbu shartnoma muddati 15 kun.", m, y)
  y += 10

  // ── IMZO QISMI ──
  y = ensureSpace(y, 70)
  y += 2

  const colR = W / 2 + 6 // o'ng ustun boshlanishi

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 30, 30)

  // 1-qator: Ism-Familya ___ | telefon ___
  doc.text("Ism-Familya:", m, y)
  doc.text(fullNameVal, m + 28, y - 0.5)
  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.3)
  doc.line(m + 27, y + 1, m + 78, y + 1)

  doc.text("telefon:", colR, y)
  doc.text(student.phone || '', colR + 18, y - 0.5)
  y += 12

  // 2-qator: Sana ___ | imzo ___
  doc.text("Sana:", m, y)
  doc.text(dateStr, m + 14, y - 0.5)

  doc.text("imzo:", colR + 56, y)
  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.3)
  doc.line(colR + 70, y + 1, W - m, y + 1)
  y += 18

  // Muassasa rahbari | imzo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(20, 20, 20)
  doc.text("Muassasa Rahbari: Tavakkalov Ilhomjon", m, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 30, 30)
  doc.text("imzo:", colR + 56, y)
  doc.setDrawColor(120, 120, 120)
  doc.line(colR + 70, y + 1, W - m, y + 1)
  y += 14

  // ZAKLAD
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 30, 30)
  doc.text("ZAKLAD:", m, y)
  doc.line(m + 20, y + 1, m + 78, y + 1)
  y += 12

  // Shartnoma sanasi (imzo pastida)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(110, 110, 110)
  doc.text("Shartnoma sanasi: " + dateStr, m, y)

  // Footer (oxirgi sahifa)
  footer(pageNo + '-sahifa')

  doc.save('shartnoma_' + (student.fullName || 'oquvchi').replace(/\s+/g, '_') + '_' + contractNum + '.pdf')
}
