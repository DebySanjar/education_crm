import { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { saveAs } from 'file-saver'
import ExcelTicketBtn from '../components/ExcelTicketBtn'
import {
  MdAdd, MdDownload, MdSearch, MdClose, MdAttachMoney,
  MdCalendarToday, MdWarning, MdEdit,
} from 'react-icons/md'

const ITEMS_PER_PAGE = 15

// Raqam formatlash
const fmt = (val) => {
  if (!val && val !== 0) return '0'
  return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Oxirgi N kun sanalarini qaytaradi (bugundan orqaga)
const getLastNDates = (fromDate, n) => {
  const dates = []
  const base = new Date(fromDate + 'T00:00:00')
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const emptyForm = {
  amount: '',
  amountDisplay: '',
  reason: '',
  date: new Date().toISOString().split('T')[0],
}

export default function Expenses() {
  const { expenses, addExpense, updateExpense } = useData()
  const { isSuperAdmin } = useAuth()
  const superAdmin = isSuperAdmin()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const today = new Date().toISOString().split('T')[0]

  // Filter + pagination
  const filtered = expenses.filter(e =>
    e.reason.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const paged = filtered.slice(start, start + ITEMS_PER_PAGE)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  // Summa input handler
  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
    const num = raw === '' ? '' : Number(raw)
    setForm(f => ({
      ...f,
      amount: num,
      amountDisplay: num === '' ? '' : fmt(num),
    }))
    if (errors.amount) setErrors(er => ({ ...er, amount: '' }))
  }

  const openAdd = () => {
    if (!isSuperAdmin()) return;
    setForm({ ...emptyForm, date: today })
    setEditId(null)
    setErrors({})
    setShowModal(true)
  }

  
  const openEdit = (expense) => {
    if (!isSuperAdmin()) return;
    setForm({
      amount: expense.amount,
      amountDisplay: fmt(expense.amount),
      reason: expense.reason,
      date: expense.date,
    })
    setEditId(expense.id)
    setErrors({})
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setErrors({}); setEditId(null) }

  const validate = () => {
    const errs = {}
    if (!form.amount || form.amount <= 0) errs.amount = "To'g'ri summa kiriting"
    if (!form.reason.trim()) errs.reason = "Sabab kiriting"
    if (!form.date) errs.date = "Sanani kiriting"
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isSuperAdmin()) return;
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const data = {
      amount: Number(form.amount),
      reason: form.reason.trim(),
      date: form.date,
    }

    if (editId) {
      updateExpense(editId, data)
    } else {
      addExpense(data)
    }
    closeModal()
  }

  // ── ExcelJS export (davomat styli) ──
  const exportExcel = async (days) => {
    const ExcelJS = (await import('exceljs')).default
    const dates = getLastNDates(today, days)
    const fromDate = dates[0]
    const toDate = dates[dates.length - 1]

    const rangeExpenses = expenses
      .filter(e => e.date >= fromDate && e.date <= toDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const totalAmt = rangeExpenses.reduce((s, e) => s + e.amount, 0)

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(`Chiqimlar_${days}kun`)

    sheet.columns = [
      { key: 'num',    width: 5  },
      { key: 'date',   width: 14 },
      { key: 'reason', width: 36 },
      { key: 'amount', width: 18 },
    ]

    const headerRow = sheet.addRow(['#', 'Sana', 'Sabab', "Summa (so'm)"])
    headerRow.height = 22
    headerRow.eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FF374151' }, size: 11 }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border    = { bottom: { style: 'thin', color: { argb: 'FFB0B7C3' } } }
    })

    rangeExpenses.forEach((e, idx) => {
      const row = sheet.addRow([idx + 1, e.date, e.reason, e.amount])
      row.height = 20
      const isEven = idx % 2 === 0

      row.eachCell((cell, col) => {
        cell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: isEven ? 'FFF0F9FF' : 'FFE8F4FD' },
        }
        cell.alignment = { vertical: 'middle', horizontal: col === 3 ? 'left' : 'center' }
        cell.font  = { size: 10, color: { argb: 'FF1E293B' } }
        cell.border = { bottom: { style: 'hair', color: { argb: 'FFCBD5E1' } } }

        if (col === 4) {
          cell.font = { size: 10, bold: true, color: { argb: 'FF991B1B' } }
          cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: isEven ? 'FFFFF0F0' : 'FFFEE2E2' },
          }
          cell.numFmt = '#,##0'
        }
      })
    })

    const totalRow = sheet.addRow(['', '', 'JAMI:', totalAmt])
    totalRow.height = 22
    totalRow.eachCell((cell, col) => {
      cell.font = { bold: true, size: 11, color: { argb: col === 4 ? 'FF991B1B' : 'FF374151' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD7D7' } }
      cell.alignment = { vertical: 'middle', horizontal: col === 3 ? 'right' : 'center' }
      cell.border = { top: { style: 'thin', color: { argb: 'FFFF6B6B' } } }
      if (col === 4) cell.numFmt = '#,##0'
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `chiqimlar_${days}kun_${fromDate}_${toDate}.xlsx`)
  }

  return (
    <Wrapper>
      <PageHeader>
        <h2>Chiqimlar</h2>
        <HeaderActions>
          <ExportGroup>
            <ExcelTicketBtn onClick={() => exportExcel(15)} label="15 kunlik" subLabel="Chiqimlar" />
            <ExcelTicketBtn onClick={() => exportExcel(30)} label="30 kunlik" subLabel="Chiqimlar" />
          </ExportGroup>
          {superAdmin && <AddBtn onClick={openAdd}><MdAdd /> Chiqim qo'shish</AddBtn>}
        </HeaderActions>
      </PageHeader>

      {/* Summary */}
      <SummaryCard>
        <SummaryContent>
          <SummaryIcon><MdAttachMoney /></SummaryIcon>
          <SummaryInfo>
            <SummaryLabel>Umumiy chiqim</SummaryLabel>
            <SummaryValue>{fmt(totalExpenses)} so'm</SummaryValue>
            <SummaryMeta>{expenses.length} ta chiqim yozuvi</SummaryMeta>
          </SummaryInfo>
          <ExportHint>
            <span>📥</span>
            <div>
              <div>15 yoki 30 kunlik</div>
              <div>hisobotni yuklab oling</div>
            </div>
          </ExportHint>
        </SummaryContent>
      </SummaryCard>

      {/* Search */}
      <SearchRow>
        <SearchBox>
          <MdSearch />
          <input
            placeholder="Sabab bo'yicha qidirish..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </SearchBox>
        <ResultCount>{filtered.length} ta natija</ResultCount>
      </SearchRow>

      {/* Table */}
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: 44 }}>#</Th>
              <Th style={{ textAlign: 'center' }}>Summa</Th>
              <Th>Sabab</Th>
              <Th style={{ textAlign: 'center' }}>Sana</Th>
              {superAdmin && <Th style={{ textAlign: 'center', width: 60 }}>Amal</Th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={superAdmin ? 5 : 4}><EmptyRow>Chiqim topilmadi</EmptyRow></td></tr>
            )}
            {paged.map((expense, i) => (
              <ExpenseRow key={expense.id} $even={i % 2 === 0}>
                <Td>{start + i + 1}</Td>
                <Td style={{ textAlign: 'center' }}>
                  <AmountBadge>{fmt(expense.amount)} so'm</AmountBadge>
                </Td>
                <Td>{expense.reason}</Td>
                <Td style={{ textAlign: 'center' }}>
                  <DateBadge>{expense.date}</DateBadge>
                </Td>
                {superAdmin && (
                  <Td style={{ textAlign: 'center' }}>
                    <EditBtn onClick={() => openEdit(expense)} title="Tahrirlash">
                      <MdEdit />
                    </EditBtn>
                  </Td>
                )}
              </ExpenseRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</PageBtn>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <PageBtn key={p} $active={p === currentPage} onClick={() => setCurrentPage(p)}>{p}</PageBtn>
          ))}
          <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</PageBtn>
          <PageInfo>{start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} / {filtered.length}</PageInfo>
        </Pagination>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editId ? "Chiqimni tahrirlash" : "Chiqim qo'shish"}</h3>
              <CloseBtn onClick={closeModal}><MdClose /></CloseBtn>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <FormBody>

                {/* Summa */}
                <FormGroup>
                  <label>Summa (so'm) *</label>
                  <AmountWrap $hasError={!!errors.amount}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.amountDisplay}
                      onChange={handleAmountChange}
                      placeholder="0"
                    />
                    <Suffix>so'm</Suffix>
                  </AmountWrap>
                  {errors.amount && <FieldError><MdWarning /> {errors.amount}</FieldError>}
                </FormGroup>

                {/* Sabab */}
                <FormGroup>
                  <label>Sabab *</label>
                  <textarea
                    value={form.reason}
                    onChange={e => {
                      setForm(f => ({ ...f, reason: e.target.value }))
                      if (errors.reason) setErrors(er => ({ ...er, reason: '' }))
                    }}
                    placeholder="Masalan: Ofis ijarasi, Kommunal to'lovlar..."
                    rows={3}
                    style={{ borderColor: errors.reason ? '#ff6b6b' : undefined }}
                  />
                  {errors.reason && <FieldError><MdWarning /> {errors.reason}</FieldError>}
                </FormGroup>

                {/* Sana */}
                <FormGroup>
                  <label>Sana *</label>
                  <DateInput>
                    <MdCalendarToday />
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </DateInput>
                  {errors.date && <FieldError><MdWarning /> {errors.date}</FieldError>}
                </FormGroup>

              </FormBody>
              <ModalFooter>
                <CancelBtn type="button" onClick={closeModal}>Bekor qilish</CancelBtn>
                <SaveBtn type="submit">{editId ? 'Saqlash' : "Qo'shish"}</SaveBtn>
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
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; }
`
const HeaderActions = styled.div`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`

const ExportGroup = styled.div`display: flex; gap: 6px;`

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: ${({ $month }) => $month ? '#7c3aed18' : '#1a1d2e'};
  border: 1px solid ${({ $month }) => $month ? '#7c3aed44' : '#2d3748'};
  color: ${({ $month }) => $month ? '#a78bfa' : '#10b981'};
  padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 500;
  white-space: nowrap;
  &:hover { background: ${({ $month }) => $month ? '#7c3aed28' : '#10b98118'}; }
`
const AddBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: #ff6b6b18; border: 1px solid #ff6b6b44; color: #ff6b6b;
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
  &:hover { background: #ff6b6b28; }
`

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #ff6b6b22 0%, #c92a2a22 100%);
  border: 1px solid #ff6b6b44; border-radius: 12px; padding: 20px;
  position: relative; overflow: hidden;
  &::before {
    content: ''; position: absolute; top: -50%; right: -20%;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
`
const SummaryContent = styled.div`
  display: flex; align-items: center; gap: 16px; position: relative; z-index: 1; flex-wrap: wrap;
`
const SummaryIcon = styled.div`
  width: 56px; height: 56px; background: #ff6b6b; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; color: #fff; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255,107,107,0.3);
`
const SummaryInfo = styled.div`flex: 1;`
const SummaryLabel = styled.div`font-size: 0.82rem; color: #8892b0; font-weight: 500; margin-bottom: 4px;`
const SummaryValue = styled.div`font-size: 1.6rem; font-weight: 700; color: #ff6b6b; margin-bottom: 4px;`
const SummaryMeta = styled.div`font-size: 0.78rem; color: #4a5568;`

const ExportHint = styled.div`
  display: flex; align-items: center; gap: 10px;
  background: #ff6b6b12; border: 1px solid #ff6b6b22; border-radius: 10px;
  padding: 10px 14px; font-size: 0.78rem; color: #8892b0;
  span { font-size: 1.4rem; }
  div > div:first-child { font-weight: 600; color: #e2e8f0; margin-bottom: 2px; }
`

const SearchRow = styled.div`display: flex; align-items: center; gap: 12px;`
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #13161f; border: 1px solid #2d3748; border-radius: 8px;
  padding: 8px 14px; flex: 1; max-width: 400px;
  svg { color: #4a5568; font-size: 1.1rem; }
  input {
    background: none; border: none; outline: none; color: #e2e8f0; font-size: 0.9rem; width: 100%;
    &::placeholder { color: #4a5568; }
  }
`
const ResultCount = styled.div`font-size: 0.82rem; color: #4a5568;`

const TableWrapper = styled.div`
  background: #13161f; border: 1px solid #1e2235; border-radius: 12px; overflow-x: auto;
`
const Table = styled.table`width: 100%; border-collapse: collapse;`
const Th = styled.th`
  text-align: left; padding: 12px 16px; font-size: 0.75rem; color: #4a5568;
  text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #1e2235;
  white-space: nowrap; background: #0f1117;
`
const ExpenseRow = styled.tr`
  background: ${({ $even }) => $even ? 'rgba(255,107,107,0.02)' : 'rgba(255,107,107,0.04)'};
  transition: background 0.15s;
  &:hover { background: rgba(255,107,107,0.07); }
  &:last-child td { border-bottom: none; }
`
const Td = styled.td`
  padding: 12px 16px; font-size: 0.88rem; color: #cbd5e0;
  border-bottom: 1px solid #1a1d2e;
`
const AmountBadge = styled.span`
  display: inline-block; padding: 4px 12px; border-radius: 8px;
  background: #ff6b6b18; color: #ff6b6b; font-weight: 700; font-size: 0.88rem;
  border: 1px solid #ff6b6b33;
`
const DateBadge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  background: #1e2235; color: #8892b0; font-size: 0.8rem;
`
const EditBtn = styled.button`
  background: #00e0ff18; border: 1px solid #00e0ff44; color: #00e0ff;
  padding: 5px; border-radius: 6px; cursor: pointer; font-size: 1rem;
  display: inline-flex; align-items: center; justify-content: center;
  &:hover { background: #00e0ff30; }
`
const EmptyRow = styled.div`text-align: center; padding: 48px; color: #4a5568; font-size: 0.9rem;`

const Pagination = styled.div`display: flex; align-items: center; gap: 4px; flex-wrap: wrap;`
const PageBtn = styled.button`
  min-width: 32px; height: 32px; padding: 0 8px; border-radius: 6px;
  border: 1px solid ${({ $active }) => $active ? '#ff6b6b' : '#2d3748'};
  background: ${({ $active }) => $active ? '#ff6b6b18' : '#1a1d2e'};
  color: ${({ $active }) => $active ? '#ff6b6b' : '#8892b0'};
  font-size: 0.85rem; font-weight: ${({ $active }) => $active ? '700' : '400'};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.4 : 1};
  &:hover:not(:disabled) { border-color: #ff6b6b44; color: #ff6b6b; }
`
const PageInfo = styled.div`margin-left: 8px; font-size: 0.78rem; color: #4a5568;`

/* Modal */
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 16px;
`
const Modal = styled.div`
  background: #13161f; border: 1px solid #2d3748; border-radius: 16px;
  width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
`
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #1e2235;
  h3 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; }
`
const CloseBtn = styled.button`
  background: none; border: none; color: #4a5568; font-size: 1.3rem;
  cursor: pointer; display: flex; align-items: center;
  &:hover { color: #e2e8f0; }
`
const FormBody = styled.div`display: flex; flex-direction: column; gap: 18px; padding: 24px;`
const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 7px;
  label { font-size: 0.82rem; color: #8892b0; font-weight: 500; }
  textarea {
    background: #0f1117; border: 1px solid #2d3748; border-radius: 8px;
    padding: 10px 12px; color: #e2e8f0; font-size: 0.9rem; outline: none;
    font-family: inherit; resize: vertical; min-height: 80px;
    &:focus { border-color: #ff6b6b; }
    &::placeholder { color: #4a5568; }
  }
`
const AmountWrap = styled.div`
  display: flex; align-items: center;
  background: #0f1117;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ff6b6b' : '#2d3748'};
  border-radius: 8px; overflow: hidden;
  &:focus-within { border-color: ${({ $hasError }) => $hasError ? '#ff6b6b' : '#ff6b6b88'}; }
  input {
    flex: 1; background: none; border: none; outline: none;
    padding: 10px 12px; color: #e2e8f0; font-size: 1rem; font-weight: 600;
    &::placeholder { color: #4a5568; font-weight: 400; }
  }
`
const Suffix = styled.span`
  padding: 0 14px; color: #4a5568; font-size: 0.85rem;
  border-left: 1px solid #2d3748; white-space: nowrap;
`
const DateInput = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #0f1117; border: 1px solid #2d3748; border-radius: 8px; padding: 10px 12px;
  svg { color: #ff6b6b; font-size: 1rem; flex-shrink: 0; }
  input {
    background: none; border: none; outline: none; color: #e2e8f0;
    font-size: 0.9rem; width: 100%; padding: 0; color-scheme: dark;
  }
`
const FieldError = styled.div`
  display: flex; align-items: center; gap: 5px;
  color: #ff6b6b; font-size: 0.78rem;
  svg { font-size: 0.9rem; flex-shrink: 0; }
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
const SaveBtn = styled.button`
  background: #ff6b6b18; border: 1px solid #ff6b6b44; color: #ff6b6b;
  padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;
  &:hover { background: #ff6b6b28; }
`
