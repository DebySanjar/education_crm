import { useState, useRef, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { SkeletonPayments } from '../components/Skeleton'
import { saveAs } from 'file-saver'
import ExcelTicketBtn from '../components/ExcelTicketBtn'
import {
  MdAdd, MdDownload, MdSearch, MdClose, MdPayment,
  MdPerson, MdCheckCircle, MdWarning,
} from 'react-icons/md'

// Raqamni formatlash: 1500000 → "1.500.000"
const formatNum = (val) => {
  if (!val && val !== 0) return ''
  return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Bugungi sana va hozirgi vaqtni qaytaradi
const getNow = () => {
  const now = new Date()
  const date = now.toISOString().split('T')[0]
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return { date, time: `${hh}:${mm}` }
}

// Foydalanuvchi kiritgan formatli stringdan toza raqam olish
const parseNum = (str) => {
  const clean = String(str).replace(/\./g, '').replace(/[^0-9]/g, '')
  return clean === '' ? '' : Number(clean)
}

export default function Payments() {
  const { students, payments, addPayment, groups, loading } = useData()

  const [histSearch, setHistSearch] = useState('')
  const [histDate, setHistDate] = useState('')
  const [histMinAmount, setHistMinAmount] = useState('')
  const [histMaxAmount, setHistMaxAmount] = useState('')
  const [debtSearch, setDebtSearch] = useState('')
  const [debtGroupFilter, setDebtGroupFilter] = useState('Barchasi')
  const [debtPage, setDebtPage] = useState(1)
  const DEBT_PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    amountDisplay: '',
    date: getNow().date,
    note: '',
    paymentType: 'naqd',
  })
  const [errors, setErrors] = useState({})
  const [stuSearch, setStuSearch] = useState('')
  const [stuDropOpen, setStuDropOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [groupFilter, setGroupFilter] = useState('Barchasi')
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setStuDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Firestoredan kelgan real guruhlar + "Barchasi"
  const groupTabs = ['Barchasi', ...groups.map(g => g.name)]

  const filteredStudents = students.filter(s => {
    const matchSearch =
      s.fullName.toLowerCase().includes(stuSearch.toLowerCase()) ||
      (s.phone || '').includes(stuSearch)
    const matchGroup = groupFilter === 'Barchasi' || s.group === groupFilter
    return matchSearch && matchGroup
  })

  const selectStudent = (s) => {
    setSelectedStudent(s)
    setForm(f => ({ ...f, studentId: s.id }))
    setErrors(e => ({ ...e, student: '' }))
    setStuDropOpen(false)
    setStuSearch('')
  }

  const openModal = () => {
    const { date } = getNow()
    setForm({
      studentId: '', amount: '', amountDisplay: '',
      date,
      note: '', paymentType: 'naqd',
    })
    setSelectedStudent(null)
    setStuSearch('')
    setErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
    setStuSearch('')
    setErrors({})
  }

  // Summa input handler — har 3 xonadan keyin "." qo'yadi
  const handleAmountChange = (e) => {
    const raw = e.target.value
    const num = parseNum(raw)
    setForm(f => ({
      ...f,
      amount: num,
      amountDisplay: num === '' ? '' : formatNum(num),
    }))
    if (errors.amount) setErrors(er => ({ ...er, amount: '' }))
  }


  const validate = () => {
    const errs = {}
    if (!selectedStudent) errs.student = "O'quvchini tanlang"
    if (!form.amount || form.amount <= 0) {
      errs.amount = "To'g'ri summa kiriting"
    } else if (form.amount > 999_999_999) {
      errs.amount = "Summa juda katta"
    }
    if (!form.date) errs.date = "Sanani kiriting"
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const debt = selectedStudent.contractSum - selectedStudent.paid
    addPayment({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      amount: Number(form.amount),
      date: form.date,
      time: getNow().time,
      note: form.note,
      paymentType: form.paymentType,
    })
    closeModal()
  }

  const handleDebtSearch = (val) => { setDebtSearch(val); setDebtPage(1) }

  // ── Memoized hisob-kitoblar ──

  // Summary kartalar — students/payments o'zgarganda qayta hisoblanadi
  const { totalPaid, totalDebt, fullyPaidCount } = useMemo(() => ({
    totalPaid:       payments.reduce((s, p) => s + p.amount, 0),
    totalDebt:       students.reduce((s, st) => s + (st.contractSum - st.paid), 0),
    fullyPaidCount:  students.filter(s => s.paid >= s.contractSum).length,
  }), [students, payments])

  // Qarzdorlar — faqat students o'zgarganda
  const allDebtors = useMemo(
    () => students.filter(s => s.contractSum - s.paid > 0),
    [students]
  )

  const filteredDebtors = useMemo(
    () => allDebtors.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(debtSearch.toLowerCase()) ||
        s.group.toLowerCase().includes(debtSearch.toLowerCase())
      const matchesGroup = debtGroupFilter === 'Barchasi' || s.group === debtGroupFilter
      return matchesSearch && matchesGroup
    }),
    [allDebtors, debtSearch, debtGroupFilter]
  )

  const totalDebtPages = Math.ceil(filteredDebtors.length / DEBT_PER_PAGE)
  const pagedDebtors = useMemo(
    () => filteredDebtors.slice((debtPage - 1) * DEBT_PER_PAGE, debtPage * DEBT_PER_PAGE),
    [filteredDebtors, debtPage]
  )

  // To'lovlar tarixi — students + payments + histSearch o'zgarganda
  const studentPaymentRows = useMemo(() => {
    const search = histSearch.toLowerCase()
    return students
      .filter(s => s.fullName.toLowerCase().includes(search))
      .map(s => {
        let stuPayments = payments
          .filter(p => p.studentId === s.id)
        
        // Filter by single date
        if (histDate) {
          stuPayments = stuPayments.filter(p => p.date === histDate)
        }
        
        // Filter by amount range
        if (histMinAmount) {
          const minAmt = Number(histMinAmount)
          stuPayments = stuPayments.filter(p => p.amount >= minAmt)
        }
        if (histMaxAmount) {
          const maxAmt = Number(histMaxAmount)
          stuPayments = stuPayments.filter(p => p.amount <= maxAmt)
        }

        stuPayments = stuPayments.sort((a, b) => new Date(a.date) - new Date(b.date))
        return { student: s, payments: stuPayments }
      })
      .filter(row => row.payments.length > 0)
  }, [students, payments, histSearch, histDate, histMinAmount, histMaxAmount])

  const maxPayments = useMemo(
    () => studentPaymentRows.reduce((m, r) => Math.max(m, r.payments.length), 0),
    [studentPaymentRows]
  )

  const exportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("To'lovlar")

    sheet.columns = [
      { key: 'name',   width: 26 },
      { key: 'amount', width: 18 },
      { key: 'date',   width: 14 },
      { key: 'note',   width: 24 },
    ]

    const headerRow = sheet.addRow(["O'quvchi", "Summa (so'm)", "Sana", "Izoh"])
    headerRow.height = 22
    headerRow.eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FF374151' }, size: 11 }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border    = { bottom: { style: 'thin', color: { argb: 'FFB0B7C3' } } }
    })

    payments.forEach((p, idx) => {
      const isEven = idx % 2 === 0
      const row = sheet.addRow([p.studentName, p.amount, p.date, p.note || ''])
      row.height = 20
      row.eachCell((cell, col) => {
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF0F9FF' : 'FFE8F4FD' } }
        cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' }
        cell.font      = { size: 10, color: { argb: 'FF1E293B' } }
        cell.border    = { bottom: { style: 'hair', color: { argb: 'FFCBD5E1' } } }
        if (col === 2) {
          cell.font   = { size: 10, bold: true, color: { argb: 'FF065F46' } }
          cell.numFmt = '#,##0'
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), "tolovlar.xlsx")
  }

  // Qarz va to'lov hisob-kitobi
  const debt = selectedStudent ? selectedStudent.contractSum - selectedStudent.paid : 0
  const remaining = selectedStudent && form.amount
    ? Math.max(0, debt - Number(form.amount))
    : null
  const overpay = selectedStudent && form.amount && Number(form.amount) > debt

  if (loading) return <Wrapper><SkeletonPayments /></Wrapper>

  return (
    <Wrapper>
      <PageHeader id="payments-header">
        <h2>To'lovlar (Kassa)</h2>
        <HeaderActions>
          <ExcelTicketBtn onClick={exportExcel} label="Excel" subLabel="To'lovlar" />
          <AddBtn id="add-payment-btn" onClick={openModal}><MdAdd /> To'lov kiritish</AddBtn>
        </HeaderActions>
      </PageHeader>

      {/* Summary */}
      <SummaryGrid>
        <SumCard $color="#10b981">
          <div className="icon"><MdPerson /></div>
          <div>
            <div className="val">{fullyPaidCount} ta</div>
            <div className="lbl">To'liq to'lov qilgan o'quvchilar</div>
          </div>
        </SumCard>
        <SumCard $color="#ff6b6b">
          <div className="icon"><MdPayment /></div>
          <div>
            <div className="val">{formatNum(totalDebt)} so'm</div>
            <div className="lbl">Umumiy qarz</div>
          </div>
        </SumCard>
        <SumCard $color="#00e0ff">
          <div className="icon"><MdPayment /></div>
          <div>
            <div className="val">{payments.length} ta</div>
            <div className="lbl">Jami to'lovlar</div>
          </div>
        </SumCard>
      </SummaryGrid>

      {/* Debtors */}
      <Section>
        <SectionHeader>
          <SectionTitle>Qarzdorlar ro'yxati ({filteredDebtors.length} ta)</SectionTitle>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <SearchBox>
              <MdSearch />
              <input placeholder="Ism yoki guruh..." value={debtSearch} onChange={e => handleDebtSearch(e.target.value)} />
            </SearchBox>
            <select
              value={debtGroupFilter}
              onChange={e => setDebtGroupFilter(e.target.value)}
              style={{
                background: '#13161f',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '7px 12px',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.88rem'
              }}
            >
              <option value="Barchasi">Barcha guruhlar</option>
              {groups.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
        </SectionHeader>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>#</Th><Th>Ism-Sharif</Th><Th>Guruh</Th>
                <Th>Shartnoma</Th><Th>To'langan</Th><Th>Qarz</Th><Th>Foiz</Th>
              </tr>
            </thead>
            <tbody>
              {pagedDebtors.length === 0 && (
                <>
                  <tr><td colSpan={7}><EmptyRow>Qarzdor topilmadi</EmptyRow></td></tr>
                  {Array.from({ length: DEBT_PER_PAGE - 1 }).map((_, i) => (
                    <GhostRow key={`ghost-empty-${i}`}>
                      <Td colSpan={7}>&nbsp;</Td>
                    </GhostRow>
                  ))}
                </>
              )}
              {pagedDebtors.map((s, i) => {
                const d = s.contractSum - s.paid
                const pct = Math.round((s.paid / s.contractSum) * 100)
                return (
                  <tr key={s.id}>
                    <Td>{(debtPage - 1) * DEBT_PER_PAGE + i + 1}</Td>
                    <Td>{s.fullName}</Td><Td>{s.group}</Td>
                    <Td>{formatNum(s.contractSum)}</Td>
                    <Td><GreenText>{formatNum(s.paid)}</GreenText></Td>
                    <Td><RedText>{formatNum(d)}</RedText></Td>
                    <Td>
                      <ProgressWrap>
                        <ProgressBar $pct={pct} />
                        <span>{pct}%</span>
                      </ProgressWrap>
                    </Td>
                  </tr>
                )
              })}
              {/* Bo'sh ghost qatorlar — balandlik o'zgarmasin */}
              {pagedDebtors.length > 0 && pagedDebtors.length < DEBT_PER_PAGE &&
                Array.from({ length: DEBT_PER_PAGE - pagedDebtors.length }).map((_, i) => (
                  <GhostRow key={`ghost-${i}`}>
                    <Td colSpan={7}>&nbsp;</Td>
                  </GhostRow>
                ))
              }
            </tbody>
          </Table>
        </TableWrapper>
        {totalDebtPages > 1 && (
          <Pagination>
            <PageBtn disabled={debtPage === 1} onClick={() => setDebtPage(p => p - 1)}>‹</PageBtn>
            {Array.from({ length: totalDebtPages }, (_, i) => i + 1).map(p => (
              <PageBtn key={p} $active={p === debtPage} onClick={() => setDebtPage(p)}>{p}</PageBtn>
            ))}
            <PageBtn disabled={debtPage === totalDebtPages} onClick={() => setDebtPage(p => p + 1)}>›</PageBtn>
            <PageInfo>{(debtPage - 1) * DEBT_PER_PAGE + 1}–{Math.min(debtPage * DEBT_PER_PAGE, filteredDebtors.length)} / {filteredDebtors.length}</PageInfo>
          </Pagination>
        )}
      </Section>

      {/* History — o'quvchi bo'yicha guruhlangan */}
      <Section>
        <SectionHeader>
          <SectionTitle>To'lovlar jadvali ({studentPaymentRows.length} ta o'quvchi)</SectionTitle>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <SearchBox>
              <MdSearch />
              <input placeholder="O'quvchi nomi..." value={histSearch} onChange={e => setHistSearch(e.target.value)} />
            </SearchBox>
            <input
              type="date"
              value={histDate}
              onChange={e => setHistDate(e.target.value)}
              style={{
                background: '#13161f',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '7px 12px',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.88rem'
              }}
            />
            <input
              type="number"
              placeholder="Min summa"
              value={histMinAmount}
              onChange={e => setHistMinAmount(e.target.value)}
              style={{
                background: '#13161f',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '7px 12px',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.88rem',
                width: '120px'
              }}
            />
            <input
              type="number"
              placeholder="Max summa"
              value={histMaxAmount}
              onChange={e => setHistMaxAmount(e.target.value)}
              style={{
                background: '#13161f',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '7px 12px',
                color: '#e2e8f0',
                outline: 'none',
                fontSize: '0.88rem',
                width: '120px'
              }}
            />
          </div>
        </SectionHeader>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: 40 }}>#</Th>
                <Th>Ism-Familya</Th>
                <Th style={{ textAlign: 'center' }}>Vaqt</Th>
                {Array.from({ length: maxPayments }, (_, i) => (
                  <Th key={i} style={{ textAlign: 'center' }}>{i + 1}-to'lov</Th>
                ))}
                <Th style={{ textAlign: 'center' }}>Jami to'langan</Th>
                <Th style={{ textAlign: 'center' }}>Qarz</Th>
              </tr>
            </thead>
            <tbody>
              {studentPaymentRows.length === 0 && (
                <tr><td colSpan={4 + maxPayments}><EmptyRow>To'lov topilmadi</EmptyRow></td></tr>
              )}
              {studentPaymentRows.map(({ student: s, payments: sp }, idx) => {
                const isEven = idx % 2 === 0
                const totalPaidByStudent = sp.reduce((sum, p) => sum + p.amount, 0)
                // Qarz: students.paid ishlatamiz (boshlang'ich + keyingi to'lovlar hammasi)
                // payments collection da faqat keyingi to'lovlar bo'ladi
                const studentDebt = s.contractSum - s.paid
                return (
                  <PayRow key={s.id} $even={isEven}>
                    <Td>{idx + 1}</Td>
                    <Td>
                      <StudentCell>
                        <Avatar>{s.fullName.charAt(0)}</Avatar>
                        <div>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#4a5568' }}>{s.group}</div>
                        </div>
                      </StudentCell>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <TimeBadge>{sp[sp.length - 1]?.time || '—'}</TimeBadge>
                    </Td>
                    {Array.from({ length: maxPayments }, (_, i) => {
                      const p = sp[i]
                      return (
                        <Td key={i} style={{ textAlign: 'center' }}>
                          {p ? (
                            <PaymentCell>
                              <PayAmount>{formatNum(p.amount)} so'm</PayAmount>
                              <PayMeta>
                                <span>{p.date}</span>
                                <PayTypeDot $type={p.paymentType || 'naqd'}>
                                  {p.paymentType === 'karta' ? '💳' : '💵'}
                                </PayTypeDot>
                              </PayMeta>
                            </PaymentCell>
                          ) : (
                            <EmptyCell>—</EmptyCell>
                          )}
                        </Td>
                      )
                    })}
                    <Td style={{ textAlign: 'center' }}>
                      <GreenText>{formatNum(s.paid)} so'm</GreenText>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      {studentDebt > 0
                        ? <RedText>{formatNum(studentDebt)} so'm</RedText>
                        : <PaidBadge>✓ To'liq</PaidBadge>
                      }
                    </Td>
                  </PayRow>
                )
              })}
            </tbody>
          </Table>
        </TableWrapper>
      </Section>

      {/* ── Modal ── */}
      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>To'lov kiritish</h3>
              <CloseBtn onClick={closeModal}><MdClose /></CloseBtn>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormBody>

                {/* O'quvchi tanlash */}
                <FormGroup>
                  <label>O'quvchi *</label>
                  {selectedStudent ? (
                    <SelectedChip>
                      <MdCheckCircle style={{ color: '#10b981', fontSize: '1.2rem', flexShrink: 0 }} />
                      <ChipInfo>
                        <span className="name">{selectedStudent.fullName}</span>
                        <span className="meta">
                          {selectedStudent.group} &nbsp;·&nbsp;
                          Qarz: <b style={{ color: debt > 0 ? '#ff6b6b' : '#10b981' }}>
                            {formatNum(debt)} so'm
                          </b>
                        </span>
                      </ChipInfo>
                      <ChipRemove onClick={() => {
                        setSelectedStudent(null)
                        setForm(f => ({ ...f, studentId: '', amount: '', amountDisplay: '' }))
                        setErrors({})
                      }}>
                        <MdClose />
                      </ChipRemove>
                    </SelectedChip>
                  ) : (
                    <PickerWrap ref={dropRef}>
                      <PickerInput
                        placeholder="Ism yoki telefon bo'yicha qidiring..."
                        value={stuSearch}
                        onChange={e => { setStuSearch(e.target.value); setStuDropOpen(true) }}
                        onFocus={() => setStuDropOpen(true)}
                        $hasError={!!errors.student}
                      />
                      {/* Firestoredan kelgan real guruhlar */}
                      <PickerGroupRow>
                        {groupTabs.map(g => (
                          <PickerGroupTab
                            key={g} type="button"
                            $active={groupFilter === g}
                            onClick={() => setGroupFilter(g)}
                          >
                            {g}
                          </PickerGroupTab>
                        ))}
                      </PickerGroupRow>
                      {stuDropOpen && (
                        <DropList>
                          {filteredStudents.length === 0
                            ? <DropEmpty>O'quvchi topilmadi</DropEmpty>
                            : filteredStudents.map(s => {
                                const d = s.contractSum - s.paid
                                return (
                                  <DropItem key={s.id} onClick={() => selectStudent(s)}>
                                    <DropAvatar>{s.fullName.charAt(0)}</DropAvatar>
                                    <DropInfo>
                                      <span className="name">{s.fullName}</span>
                                      <span className="meta">{s.group} · {s.phone}</span>
                                    </DropInfo>
                                    <DropDebt $zero={d <= 0}>
                                      {d <= 0 ? "✓ To'liq" : `${formatNum(d)} so'm`}
                                    </DropDebt>
                                  </DropItem>
                                )
                              })
                          }
                        </DropList>
                      )}
                    </PickerWrap>
                  )}
                  {errors.student && <FieldError><MdWarning /> {errors.student}</FieldError>}
                </FormGroup>

                {/* Summa */}
                <FormGroup>
                  <label>Summa (so'm) *</label>
                  <AmountInputWrap $hasError={!!errors.amount}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.amountDisplay}
                      onChange={handleAmountChange}
                      placeholder="0"
                    />
                    <AmountSuffix>so'm</AmountSuffix>
                  </AmountInputWrap>
                  {errors.amount && <FieldError><MdWarning /> {errors.amount}</FieldError>}
                  {/* Qolgan qarz hisob-kitobi */}
                  {selectedStudent && form.amount !== '' && (
                    overpay
                      ? <AmountHint $warn>
                          <MdWarning /> Kiritilgan summa qarzdan {formatNum(Number(form.amount) - debt)} so'm ko'p
                        </AmountHint>
                      : <AmountHint>
                          To'lovdan keyin qoladi: <b>{formatNum(remaining)} so'm</b>
                        </AmountHint>
                  )}
                  {/* Tez tanlash tugmalari */}
                  {selectedStudent && debt > 0 && (
                    <QuickAmounts>
                      {[debt, Math.round(debt / 2), 500_000, 300_000, 100_000]
                        .filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)
                        .slice(0, 4)
                        .map(v => (
                          <QuickBtn key={v} type="button" onClick={() =>
                            setForm(f => ({ ...f, amount: v, amountDisplay: formatNum(v) }))
                          }>
                            {v === debt ? 'To\'liq' : formatNum(v)}
                          </QuickBtn>
                        ))
                      }
                    </QuickAmounts>
                  )}
                </FormGroup>

                {/* Sana va Vaqt */}
                <FormGroup>
                  <label>Sana *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ colorScheme: 'dark' }}
                  />
                  {errors.date && <FieldError><MdWarning /> {errors.date}</FieldError>}
                </FormGroup>

                {/* To'lov turi */}
                <FormGroup>
                  <label>To'lov turi *</label>
                  <PaymentTypeRow>
                    <PaymentTypeOption type="button" $active={form.paymentType === 'naqd'}
                      onClick={() => setForm(f => ({ ...f, paymentType: 'naqd' }))}>
                      <span className="icon">💵</span>
                      <span className="label">Naqd pul</span>
                    </PaymentTypeOption>
                    <PaymentTypeOption type="button" $active={form.paymentType === 'karta'}
                      onClick={() => setForm(f => ({ ...f, paymentType: 'karta' }))}>
                      <span className="icon">💳</span>
                      <span className="label">Karta orqali</span>
                    </PaymentTypeOption>
                  </PaymentTypeRow>
                </FormGroup>

                {/* Izoh */}
                <FormGroup>
                  <label>Izoh</label>
                  <input
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="1-oylik to'lov..."
                  />
                </FormGroup>

              </FormBody>

              <ModalFooter>
                <CancelBtn type="button" onClick={closeModal}>Bekor qilish</CancelBtn>
                <SubmitBtn type="submit">Saqlash</SubmitBtn>
              </ModalFooter>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </Wrapper>
  )
}

/* ─── Styles ─── */
const Wrapper = styled.div`display: flex; flex-direction: column; gap: 24px;`

const PageHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; }
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; }
`
const HeaderActions = styled.div`
  display: flex; gap: 10px;
  @media (max-width: 768px) { width: 100%; > * { flex: 1; } }
`
const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: #1a1d2e; border: 1px solid #2d3748; color: #10b981;
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
  &:hover { background: #10b98118; }
`
const AddBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: #00e0ff18; border: 1px solid #00e0ff44; color: #00e0ff;
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
  &:hover { background: #00e0ff28; }
`
const SummaryGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`
const SumCard = styled.div`
  background: #13161f; border: 1px solid ${({ $color }) => $color}33;
  border-left: 3px solid ${({ $color }) => $color};
  border-radius: 12px; padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  .icon { font-size: 1.6rem; color: ${({ $color }) => $color}; }
  .val { font-size: 1.1rem; font-weight: 700; color: #e2e8f0; }
  .lbl { font-size: 0.78rem; color: #8892b0; margin-top: 2px; }
`
const Section = styled.div`display: flex; flex-direction: column; gap: 12px;`
const SectionHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
  @media (max-width: 768px) { flex-direction: column; align-items: stretch; }
`
const SectionTitle = styled.div`font-size: 1rem; font-weight: 600; color: #e2e8f0;`
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #13161f; border: 1px solid #2d3748; border-radius: 8px; padding: 7px 12px;
  svg { color: #4a5568; }
  input { background: none; border: none; outline: none; color: #e2e8f0; font-size: 0.88rem; width: 180px; }
  input::placeholder { color: #4a5568; }
`
const TableWrapper = styled.div`
  background: #13161f; border: 1px solid #1e2235; border-radius: 12px; overflow-x: auto;
`
const Table = styled.table`width: 100%; border-collapse: collapse;`
const Th = styled.th`
  text-align: left; padding: 12px 14px; font-size: 0.78rem; color: #4a5568;
  text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e2235; white-space: nowrap;
`
const Td = styled.td`
  padding: 12px 14px; font-size: 0.88rem; color: #cbd5e0;
  border-bottom: 1px solid #1a1d2e; white-space: nowrap;
`
const GreenText = styled.span`color: #10b981; font-weight: 600;`
const RedText = styled.span`color: #ff6b6b; font-weight: 600;`
const MutedText = styled.span`color: #4a5568;`
const ProgressWrap = styled.div`
  display: flex; align-items: center; gap: 8px;
  span { font-size: 0.8rem; color: #8892b0; min-width: 32px; }
`
const ProgressBar = styled.div`
  width: 80px; height: 6px; background: #1e2235; border-radius: 3px; overflow: hidden;
  &::after {
    content: ''; display: block; height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ $pct }) => $pct >= 80 ? '#10b981' : $pct >= 40 ? '#f59e0b' : '#ff6b6b'};
    border-radius: 3px;
  }
`
const EmptyRow = styled.div`text-align: center; padding: 40px; color: #4a5568; font-size: 0.9rem;`

// Jadval balandligini sabit ushlab turuvchi bo'sh qator (DEBT_PER_PAGE dan kam bo'lganda)
const GhostRow = styled.tr`
  &:last-child td { border-bottom: none; }
`
const Pagination = styled.div`display: flex; align-items: center; gap: 4px; padding: 12px 4px 4px; flex-wrap: wrap;`
const PageBtn = styled.button`
  min-width: 32px; height: 32px; padding: 0 8px; border-radius: 6px;
  border: 1px solid ${({ $active }) => $active ? '#00e0ff' : '#2d3748'};
  background: ${({ $active }) => $active ? '#00e0ff18' : '#1a1d2e'};
  color: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'};
  font-size: 0.85rem; font-weight: ${({ $active }) => $active ? '700' : '400'};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.4 : 1};
  &:hover:not(:disabled) { border-color: #00e0ff44; color: #00e0ff; }
`
const PageInfo = styled.div`margin-left: 8px; font-size: 0.78rem; color: #4a5568;`

/* Modal styles */
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 16px;
`
const Modal = styled.div`
  background: #13161f; border: 1px solid #2d3748; border-radius: 16px;
  width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
`
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #1e2235;
  h3 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; }
`
const CloseBtn = styled.button`
  background: none; border: none; color: #4a5568; font-size: 1.3rem; cursor: pointer;
  display: flex; align-items: center;
  &:hover { color: #e2e8f0; }
`
const FormBody = styled.div`display: flex; flex-direction: column; gap: 18px; padding: 24px;`
const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 7px;
  label { font-size: 0.82rem; color: #8892b0; font-weight: 500; }
  input {
    background: #0f1117; border: 1px solid #2d3748; border-radius: 8px;
    padding: 10px 12px; color: #e2e8f0; font-size: 0.9rem; outline: none;
    &:focus { border-color: #00e0ff; }
    &::placeholder { color: #4a5568; }
  }
`
const FieldError = styled.div`
  display: flex; align-items: center; gap: 5px;
  color: #ff6b6b; font-size: 0.78rem;
  svg { font-size: 0.9rem; flex-shrink: 0; }
`

/* Summa input */
const AmountInputWrap = styled.div`
  display: flex; align-items: center;
  background: #0f1117;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ff6b6b' : '#2d3748'};
  border-radius: 8px; overflow: hidden;
  transition: border-color 0.15s;
  &:focus-within { border-color: ${({ $hasError }) => $hasError ? '#ff6b6b' : '#00e0ff'}; }
  input {
    flex: 1; background: none; border: none !important; outline: none;
    padding: 10px 12px; color: #e2e8f0; font-size: 1rem; font-weight: 600;
    letter-spacing: 0.5px;
    &::placeholder { color: #4a5568; font-weight: 400; }
  }
`
const AmountSuffix = styled.span`
  padding: 0 14px; color: #4a5568; font-size: 0.85rem;
  border-left: 1px solid #2d3748; white-space: nowrap;
`
const AmountHint = styled.div`
  font-size: 0.78rem;
  color: ${({ $warn }) => $warn ? '#f59e0b' : '#8892b0'};
  display: flex; align-items: center; gap: 4px;
  b { color: ${({ $warn }) => $warn ? '#f59e0b' : '#00e0ff'}; }
  svg { font-size: 0.9rem; }
`
const QuickAmounts = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;`
const QuickBtn = styled.button`
  padding: 4px 12px; border-radius: 14px; font-size: 0.78rem; font-weight: 600; cursor: pointer;
  border: 1px solid #00e0ff33; background: #00e0ff0d; color: #00e0ff;
  transition: all 0.15s;
  &:hover { background: #00e0ff22; border-color: #00e0ff66; }
`

/* Student picker */
const PickerWrap = styled.div`position: relative;`
const PickerInput = styled.input`
  width: 100%;
  background: #0f1117 !important;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ff6b6b' : '#2d3748'} !important;
  border-radius: 8px 8px 0 0 !important;
  padding: 10px 12px !important;
  color: #e2e8f0 !important; font-size: 0.9rem !important; outline: none !important;
  &:focus { border-color: #00e0ff !important; }
  &::placeholder { color: #4a5568 !important; }
`
const PickerGroupRow = styled.div`
  display: flex; gap: 6px; flex-wrap: wrap;
  background: #0f1117; border: 1px solid #2d3748; border-top: none;
  padding: 8px 10px;
`
const PickerGroupTab = styled.button`
  padding: 4px 12px; border-radius: 14px; font-size: 0.78rem; font-weight: 500; cursor: pointer;
  border: 1px solid ${({ $active }) => $active ? '#00e0ff' : '#2d3748'};
  background: ${({ $active }) => $active ? '#00e0ff18' : 'transparent'};
  color: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'};
  transition: all 0.15s;
  &:hover { border-color: #00e0ff; color: #00e0ff; }
`
const DropList = styled.div`
  position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
  background: #1a1d2e; border: 1px solid #2d3748; border-top: none;
  border-radius: 0 0 10px 10px; max-height: 220px; overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
`
const DropItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #1e2235;
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(0,224,255,0.06); }
`
const DropAvatar = styled.div`
  width: 30px; height: 30px; border-radius: 50%; background: #2d3748;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; color: #00e0ff; flex-shrink: 0;
`
const DropInfo = styled.div`
  flex: 1; min-width: 0;
  .name { display: block; font-size: 0.88rem; color: #e2e8f0; font-weight: 500; }
  .meta { display: block; font-size: 0.75rem; color: #4a5568; margin-top: 1px; }
`
const DropDebt = styled.div`
  font-size: 0.78rem; font-weight: 600; flex-shrink: 0;
  color: ${({ $zero }) => $zero ? '#10b981' : '#ff6b6b'};
`
const DropEmpty = styled.div`padding: 20px; text-align: center; color: #4a5568; font-size: 0.85rem;`
const SelectedChip = styled.div`
  display: flex; align-items: center; gap: 10px;
  background: #10b98112; border: 1px solid #10b98133; border-radius: 10px; padding: 10px 14px;
`
const ChipInfo = styled.div`
  flex: 1; min-width: 0;
  .name { display: block; font-size: 0.9rem; color: #e2e8f0; font-weight: 600; }
  .meta { display: block; font-size: 0.78rem; color: #8892b0; margin-top: 2px; }
`
const ChipRemove = styled.button`
  background: none; border: none; color: #4a5568; cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; padding: 2px;
  &:hover { color: #ff6b6b; }
`
const PaymentTypeRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 10px;`
const PaymentTypeOption = styled.button`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 12px;
  background: ${({ $active }) => $active ? '#00e0ff18' : '#0f1117'};
  border: 2px solid ${({ $active }) => $active ? '#00e0ff' : '#2d3748'};
  border-radius: 10px; cursor: pointer; transition: all 0.2s;
  .icon { font-size: 1.8rem; }
  .label { font-size: 0.85rem; font-weight: 600; color: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'}; }
  &:hover { border-color: #00e0ff; background: #00e0ff12; .label { color: #00e0ff; } }
`
const PaymentTypeBadge = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;
  background: ${({ $type }) => $type === 'karta' ? '#7c3aed18' : '#10b98118'};
  color: ${({ $type }) => $type === 'karta' ? '#7c3aed' : '#10b981'};
  border: 1px solid ${({ $type }) => $type === 'karta' ? '#7c3aed33' : '#10b98133'};
`

/* Payment table row styles */
const PayRow = styled.tr`
  background: ${({ $even }) => $even ? 'rgba(240,249,255,0.03)' : 'rgba(232,244,253,0.05)'};
  transition: background 0.15s;
  &:hover { background: rgba(0,224,255,0.04); }
  &:last-child td { border-bottom: none; }
`
const StudentCell = styled.div`display: flex; align-items: center; gap: 10px;`
const Avatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: #00e0ff18; color: #00e0ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
`
const ContractBadge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  background: #1e2235; color: #8892b0; font-size: 0.82rem; font-weight: 600;
`
const TimeBadge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  background: #00e0ff12; color: #00e0ff; font-size: 0.82rem; font-weight: 600;
  border: 1px solid #00e0ff22; letter-spacing: 0.5px;
`
const PaymentCell = styled.div`display: flex; flex-direction: column; align-items: center; gap: 2px;`
const PayAmount = styled.div`font-size: 0.88rem; font-weight: 700; color: #10b981;`
const PayMeta = styled.div`display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #4a5568;`
const PayTypeDot = styled.span`font-size: 0.8rem;`
const EmptyCell = styled.span`color: #2d3748; font-size: 0.85rem;`
const PaidBadge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 12px;
  background: #10b98118; color: #10b981; font-size: 0.78rem; font-weight: 600;
  border: 1px solid #10b98133;
`
const ModalFooter = styled.div`
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1px solid #1e2235;
`
const CancelBtn = styled.button`
  background: #1a1d2e; border: 1px solid #2d3748; color: #8892b0;
  padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem;
  &:hover { color: #e2e8f0; }
`
const SubmitBtn = styled.button`
  background: #00e0ff18; border: 1px solid #00e0ff44; color: #00e0ff;
  padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;
  &:hover { background: #00e0ff28; }
`
