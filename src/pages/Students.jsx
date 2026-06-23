import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { saveAs } from 'file-saver'
import { generateContract } from '../utils/generateContract'
import ExcelTicketBtn from '../components/ExcelTicketBtn'
import { fetchStudentsByGroup, addStudent as addStudentFS, updateStudent as updateStudentFS, deleteStudent as deleteStudentFS } from '../services/firestoreService'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdPerson, MdDescription, MdRefresh } from 'react-icons/md'

const MED_STATUSES = ['Topshirilgan', 'Topshirilmagan']

const emptyForm = {
  fullName: '', phone: '+998', passport: '', medStatus: 'Topshirilmagan',
  group: '', contractSum: '1500000', paid: '0',
  joinDate: new Date().toISOString().split('T')[0], status: 'Faol',
}

export default function Students() {
  const { groups } = useData()
  const { isSuperAdmin } = useAuth()
  const toast = useToast()

  // Guruh tanlash — birinchi guruh default
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  // Cache: { [groupName]: [...students] }
  const cache = useRef({})

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [contractDialog, setContractDialog] = useState(null)
  const [errors, setErrors] = useState({})

  // Guruhlar yuklanganda birinchisini tanlash
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].name)
    }
  }, [groups]) // eslint-disable-line

  // Guruh o'zgarganda Firestore dan yuklash (cache bilan)
  useEffect(() => {
    if (!selectedGroup) return
    if (cache.current[selectedGroup]) {
      setStudents(cache.current[selectedGroup])
      return
    }
    setLoadingStudents(true)
    fetchStudentsByGroup(selectedGroup).then(res => {
      const data = res.success ? res.data : []
      cache.current[selectedGroup] = data
      setStudents(data)
      setLoadingStudents(false)
    })
  }, [selectedGroup])

  // Local CRUD — state + cache yangilash
  const localAdd = (student) => {
    const updated = [student, ...(cache.current[selectedGroup] || [])]
    cache.current[selectedGroup] = updated
    setStudents(updated)
  }
  const localUpdate = (id, data) => {
    const updated = (cache.current[selectedGroup] || []).map(s => s.id === id ? { ...s, ...data } : s)
    cache.current[selectedGroup] = updated
    setStudents(updated)
  }
  const localDelete = (id) => {
    const updated = (cache.current[selectedGroup] || []).filter(s => s.id !== id)
    cache.current[selectedGroup] = updated
    setStudents(updated)
  }

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  )

  const formatNumberInput = (v) => v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const parseNum = (v) => parseInt(String(v).replace(/\./g, '') || '0', 10)

  const handlePhoneChange = (value) => {
    if (!value.startsWith('+998')) value = '+998' + value.replace(/^\+998/, '')
    const cleaned = value.replace(/[^\d+]/g, '')
    if (cleaned.length > 13) return
    setForm(f => ({ ...f, phone: cleaned }))
    if (cleaned.length === 13) setErrors(e => ({ ...e, phone: '' }))
    else if (cleaned.length > 4) setErrors(e => ({ ...e, phone: "Telefon 9 ta raqamdan iborat bo'lishi kerak" }))
  }

  const openAdd = () => {
    setForm({ ...emptyForm, group: selectedGroup || (groups[0]?.name || ''), joinDate: new Date().toISOString().split('T')[0] })
    setEditId(null); setErrors({}); setShowModal(true)
  }
  const openEdit = (s) => {
    setForm({ ...s, contractSum: s.contractSum.toString(), paid: s.paid.toString() })
    setEditId(s.id); setErrors({}); setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Ism-sharifni kiriting'
    if (form.phone.length !== 13) newErrors.phone = 'Telefon raqami to\'liq emas'
    const contractNum = parseNum(form.contractSum)
    if (contractNum < 100000) newErrors.contractSum = 'Minimal summa: 100.000 so\'m'
    const paidNum = parseNum(form.paid)
    if (paidNum > contractNum) newErrors.paid = 'Shartnoma summasidan oshmasligi kerak'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const saved = { ...form, contractSum: contractNum, paid: paidNum }

    if (editId) {
      const res = await updateStudentFS(editId, saved)
      if (res.success) { localUpdate(editId, saved); toast.success("O'quvchi ma'lumotlari saqlandi.") }
      else toast.error("Saqlanmadi. Internetni tekshiring.")
      setShowModal(false)
    } else {
      const res = await addStudentFS(saved)
      if (res.success) {
        const newStudent = { ...saved, id: res.id }
        localAdd(newStudent)
        toast.success("O'quvchi qo'shildi.")
        setShowModal(false)
        setContractDialog(newStudent)
      } else {
        toast.error("Qo'shilmadi. Internetni tekshiring.")
      }
    }
  }

  const handleDelete = async (id) => {
    const res = await deleteStudentFS(id)
    if (res.success) { localDelete(id); toast.success("O'quvchi o'chirildi.") }
    else toast.error("O'chirilmadi.")
    setDeleteConfirm(null)
  }

  const handleDownloadContract = async (student) => {
    try { await generateContract(student) }
    catch (err) { toast.error('Shartnoma yaratishda xato: ' + err.message) }
    setContractDialog(null)
  }

  const handleGroupChange = (groupName) => {
    setSelectedGroup(groupName)
    setSearch('')
  }

  const handleRefresh = () => {
    if (!selectedGroup) return
    delete cache.current[selectedGroup]
    setLoadingStudents(true)
    fetchStudentsByGroup(selectedGroup).then(res => {
      const data = res.success ? res.data : []
      cache.current[selectedGroup] = data
      setStudents(data)
      setLoadingStudents(false)
    })
  }

  const exportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(selectedGroup || "O'quvchilar")
    sheet.columns = [
      { key: 'name', width: 28 }, { key: 'phone', width: 16 }, { key: 'passport', width: 12 },
      { key: 'med', width: 14 }, { key: 'group', width: 14 }, { key: 'contract', width: 18 },
      { key: 'paid', width: 18 }, { key: 'debt', width: 18 }, { key: 'joinDate', width: 14 }, { key: 'status', width: 10 },
    ]
    const headerRow = sheet.addRow(["Ism-Sharif","Telefon","Pasport","Medspr.","Guruh","Shartnoma (so'm)","To'langan (so'm)","Qarz (so'm)","Qo'shilgan sana","Holat"])
    headerRow.height = 22
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FF374151' }, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFB0B7C3' } } }
    })
    students.forEach((s, idx) => {
      const row = sheet.addRow([s.fullName,s.phone,s.passport,s.medStatus,s.group,s.contractSum,s.paid,s.contractSum-s.paid,s.joinDate,s.status])
      row.height = 20
      row.eachCell((cell, col) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx%2===0?'FFF0F9FF':'FFE8F4FD' } }
        cell.alignment = { vertical: 'middle', horizontal: col===1?'left':'center' }
        cell.font = { size: 10, color: { argb: 'FF1E293B' } }
        cell.border = { bottom: { style: 'hair', color: { argb: 'FFCBD5E1' } } }
        if (col===8 && s.contractSum-s.paid>0) cell.font = { size:10, bold:true, color:{ argb:'FF991B1B' } }
      })
    })
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `${selectedGroup || 'oquvchilar'}.xlsx`)
  }

  // Guruhlar yuklanmagan
  if (groups.length === 0) return (
    <Wrapper>
      <PageHeader><h2>O'quvchilar ro'yxati</h2></PageHeader>
      <EmptyState>Avval "Guruhlar" bo'limidan guruh qo'shing</EmptyState>
    </Wrapper>
  )

  return (
    <Wrapper>
      <PageHeader>
        <h2>O'quvchilar ro'yxati</h2>
        <HeaderActions>
          <ExcelTicketBtn onClick={exportExcel} label="Excel" subLabel={selectedGroup || ''} />
          <RefreshBtn onClick={handleRefresh} title="Yangilash"><MdRefresh /></RefreshBtn>
          <AddBtn onClick={openAdd}><MdAdd /> O'quvchi qo'shish</AddBtn>
        </HeaderActions>
      </PageHeader>

      {/* Guruh tablari */}
      <GroupTabs>
        {groups.map(g => (
          <GroupTab key={g.id} $active={selectedGroup === g.name} onClick={() => handleGroupChange(g.name)}>
            {g.name}
            {cache.current[g.name] !== undefined && (
              <span>{cache.current[g.name].length}</span>
            )}
          </GroupTab>
        ))}
      </GroupTabs>

      {/* Qidiruv */}
      <SearchBox>
        <MdSearch />
        <input placeholder="Ism yoki telefon..." value={search} onChange={e => setSearch(e.target.value)} />
      </SearchBox>

      {/* Jadval */}
      <TableWrapper>
        {loadingStudents ? (
          <LoadingRow>
            <Spinner /><span>Yuklanmoqda...</span>
          </LoadingRow>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>#</Th><Th>Ism-Sharif</Th><Th>Telefon</Th>
                <Th>Medspr.</Th><Th>Shartnoma</Th><Th>To'langan</Th><Th>Qarz</Th><Th>Amallar</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8}><EmptyRow>O'quvchi topilmadi</EmptyRow></td></tr>
              )}
              {filtered.map((s, i) => {
                const debt = s.contractSum - s.paid
                return (
                  <tr key={s.id}>
                    <Td>{i + 1}</Td>
                    <Td><StudentName><Avatar><MdPerson /></Avatar>{s.fullName}</StudentName></Td>
                    <Td>{s.phone}</Td>
                    <Td><MedBadge $ok={s.medStatus === 'Topshirilgan'}>{s.medStatus}</MedBadge></Td>
                    <Td>{s.contractSum.toLocaleString()}</Td>
                    <Td><GreenText>{s.paid.toLocaleString()}</GreenText></Td>
                    <Td><RedText>{debt > 0 ? debt.toLocaleString() : '—'}</RedText></Td>
                    <Td>
                      <ActionBtns>
                        {isSuperAdmin() && <IconBtn $color="#00e0ff" onClick={() => openEdit(s)}><MdEdit /></IconBtn>}
                        <IconBtn $color="#a78bfa" onClick={() => setContractDialog(s)}><MdDescription /></IconBtn>
                        {isSuperAdmin() && <IconBtn $color="#ff6b6b" onClick={() => setDeleteConfirm(s.id)}><MdDelete /></IconBtn>}
                      </ActionBtns>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </TableWrapper>
      <CountBadge>Jami: {filtered.length} ta o'quvchi</CountBadge>

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editId ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}</h3>
              <CloseBtn onClick={() => setShowModal(false)}><MdClose /></CloseBtn>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <label>Ism-Sharif *</label>
                  <input required value={form.fullName}
                    onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); if (e.target.value.trim()) setErrors(er => ({ ...er, fullName: '' })) }}
                    placeholder="To'liq ism-sharif" />
                  {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <label>Telefon *</label>
                  <input required value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="+998 XX XXX XX XX" />
                  {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                  <HintText>Format: +998 + 9 ta raqam</HintText>
                </FormGroup>
                <FormGroup>
                  <label>Pasport seriyasi</label>
                  <input value={form.passport} onChange={e => setForm(f => ({ ...f, passport: e.target.value }))} placeholder="AA1234567" />
                </FormGroup>
                <FormGroup>
                  <label>Medspr. holati</label>
                  <select value={form.medStatus} onChange={e => setForm(f => ({ ...f, medStatus: e.target.value }))}>
                    {MED_STATUSES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>Guruh *</label>
                  <select required value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                    <option value="">Guruhni tanlang</option>
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>Shartnoma summasi (so'm) *</label>
                  <input type="text" value={form.contractSum}
                    onChange={e => { const f = e.target.value.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.'); setForm(p => ({ ...p, contractSum: f })); const n = parseInt(f.replace(/\./g,'')||'0',10); setErrors(er => ({ ...er, contractSum: n < 100000 ? "Minimal summa: 100.000 so'm" : '' })) }}
                    placeholder="1.500.000" />
                  {errors.contractSum && <ErrorText>{errors.contractSum}</ErrorText>}
                  <HintText>Default: 1.500.000 so'm</HintText>
                </FormGroup>
                <FormGroup>
                  <label>To'langan summa (so'm)</label>
                  <input type="text" value={form.paid}
                    onChange={e => { const f = e.target.value.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.'); setForm(p => ({ ...p, paid: f })); const n = parseInt(f.replace(/\./g,'')||'0',10); const c = parseInt(String(form.contractSum).replace(/\./g,'')||'0',10); setErrors(er => ({ ...er, paid: n > c ? 'Shartnoma summasidan oshmasligi kerak' : '' })) }}
                    placeholder="0" />
                  {errors.paid && <ErrorText>{errors.paid}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <label>Qo'shilgan sana</label>
                  <input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} />
                </FormGroup>
              </FormGrid>
              <ModalFooter>
                <CancelBtn type="button" onClick={() => setShowModal(false)}>Bekor qilish</CancelBtn>
                <SaveBtn type="submit">{editId ? 'Saqlash' : "Qo'shish"}</SaveBtn>
              </ModalFooter>
            </form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ModalOverlay onClick={() => setDeleteConfirm(null)}>
          <ConfirmModal onClick={e => e.stopPropagation()}>
            <h3>O'chirishni tasdiqlang</h3>
            <p>Bu o'quvchini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <ConfirmBtns>
              <CancelBtn onClick={() => setDeleteConfirm(null)}>Bekor qilish</CancelBtn>
              <DeleteBtn onClick={() => handleDelete(deleteConfirm)}>O'chirish</DeleteBtn>
            </ConfirmBtns>
          </ConfirmModal>
        </ModalOverlay>
      )}

      {/* Contract Dialog */}
      {contractDialog && (
        <ModalOverlay onClick={() => setContractDialog(null)}>
          <ContractDialogBox onClick={e => e.stopPropagation()}>
            <ContractCard>
              <CardTop>
                <CardTitle>Shartnoma</CardTitle>
                <CardDesc>{contractDialog.fullName}</CardDesc>
                <CardMeta>{contractDialog.group} · {contractDialog.phone}</CardMeta>
                <CardSum>{Number(contractDialog.contractSum).toLocaleString()} so'm</CardSum>
              </CardTop>
              <DownloadBtn onClick={() => handleDownloadContract(contractDialog)}>
                Yuklash
                <svg height={100} preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100" width={100} xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.1,77.9a4,4,0,0,1,4-4H73.9a4,4,0,0,1,0,8H26.1A4,4,0,0,1,22.1,77.9ZM35.2,47.2a4,4,0,0,1,5.7,0L46,52.3V22.1a4,4,0,1,1,8,0V52.3l5.1-5.1a4,4,0,0,1,5.7,0,4,4,0,0,1,0,5.6l-12,12a3.9,3.9,0,0,1-5.6,0l-12-12A4,4,0,0,1,35.2,47.2Z" fillRule="evenodd" />
                </svg>
              </DownloadBtn>
              <CardSvg1 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path d="M 50.4 51 C 40.5 49.1 40 46 40 44 v -1.2 a 18.9 18.9 0 0 0 5.7 -8.8 h 0.1 c 3 0 3.8 -6.3 3.8 -7.3 s 0.1 -4.7 -3 -4.7 C 53 4 30 0 22.3 6 c -5.4 0 -5.9 8 -3.9 16 c -3.1 0 -3 3.8 -3 4.7 s 0.7 7.3 3.8 7.3 c 1 3.6 2.3 6.9 4.7 9 v 1.2 c 0 2 0.5 5 -9.5 6.8 S 2 62 2 62 h 60 a 14.6 14.6 0 0 0 -11.6 -11 z" strokeMiterlimit={10} strokeWidth={5} />
              </CardSvg1>
              <CardSvg2 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <path d="M 50.4 51 C 40.5 49.1 40 46 40 44 v -1.2 a 18.9 18.9 0 0 0 5.7 -8.8 h 0.1 c 3 0 3.8 -6.3 3.8 -7.3 s 0.1 -4.7 -3 -4.7 C 53 4 30 0 22.3 6 c -5.4 0 -5.9 8 -3.9 16 c -3.1 0 -3 3.8 -3 4.7 s 0.7 7.3 3.8 7.3 c 1 3.6 2.3 6.9 4.7 9 v 1.2 c 0 2 0.5 5 -9.5 6.8 S 2 62 2 62 h 60 a 14.6 14.6 0 0 0 -11.6 -11 z" strokeMiterlimit={10} strokeWidth={2} />
              </CardSvg2>
            </ContractCard>
            <CloseContractBtn onClick={() => setContractDialog(null)}><MdClose /> Yopish</CloseContractBtn>
          </ContractDialogBox>
        </ModalOverlay>
      )}
    </Wrapper>
  )
}

/* ─── Styles ─── */
const Wrapper = styled.div`display: flex; flex-direction: column; gap: 20px;`
const PageHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; }
`
const HeaderActions = styled.div`display: flex; gap: 8px; align-items: center;`
const AddBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: #00e0ff18; border: 1px solid #00e0ff44; color: #00e0ff;
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500;
  &:hover { background: #00e0ff28; }
`
const RefreshBtn = styled.button`
  display: flex; align-items: center; justify-content: center;
  background: #1a1d2e; border: 1px solid #2d3748; color: #8892b0;
  width: 36px; height: 36px; border-radius: 8px; cursor: pointer; font-size: 1.1rem;
  &:hover { color: #00e0ff; border-color: #00e0ff44; }
`
const GroupTabs = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`
const GroupTab = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 500; cursor: pointer;
  border: 1px solid ${({ $active }) => $active ? '#00e0ff' : '#2d3748'};
  background: ${({ $active }) => $active ? '#00e0ff18' : '#13161f'};
  color: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'};
  transition: all 0.15s;
  &:hover { border-color: #00e0ff; color: #00e0ff; }
  span {
    background: ${({ $active }) => $active ? '#00e0ff' : '#2d3748'};
    color: ${({ $active }) => $active ? '#000' : '#8892b0'};
    padding: 1px 7px; border-radius: 10px; font-size: 0.75rem; font-weight: 700;
  }
`
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #13161f; border: 1px solid #2d3748; border-radius: 8px;
  padding: 10px 16px; max-width: 400px;
  svg { color: #4a5568; font-size: 1.2rem; }
  input { background: none; border: none; outline: none; color: #e2e8f0; font-size: 0.95rem; width: 100%; }
  input::placeholder { color: #4a5568; }
`
const TableWrapper = styled.div`
  background: #13161f; border: 1px solid #1e2235; border-radius: 12px;
  overflow-x: auto; overflow-y: auto; max-height: 600px;
`
const LoadingRow = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 60px; color: #8892b0; font-size: 0.9rem;
`
const Spinner = styled.div`
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid #2d3748; border-top-color: #00e0ff;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`
const Table = styled.table`width: 100%; border-collapse: collapse;`
const Th = styled.th`
  text-align: left; padding: 12px 14px; font-size: 0.78rem; color: #4a5568;
  text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e2235;
  white-space: nowrap; background: #0f1117; position: sticky; top: 0; z-index: 2;
`
const Td = styled.td`padding: 12px 14px; font-size: 0.88rem; color: #cbd5e0; border-bottom: 1px solid #1a1d2e; white-space: nowrap;`
const StudentName = styled.div`display: flex; align-items: center; gap: 8px;`
const Avatar = styled.div`
  width: 30px; height: 30px; border-radius: 50%; background: #1e2235;
  display: flex; align-items: center; justify-content: center; color: #4a5568; font-size: 1rem; flex-shrink: 0;
`
const MedBadge = styled.span`
  padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;
  background: ${({ $ok }) => $ok ? '#10b98118' : '#ff6b6b18'};
  color: ${({ $ok }) => $ok ? '#10b981' : '#ff6b6b'};
  border: 1px solid ${({ $ok }) => $ok ? '#10b98144' : '#ff6b6b44'};
`
const GreenText = styled.span`color: #10b981; font-weight: 600;`
const RedText = styled.span`color: #ff6b6b; font-weight: 600;`
const ActionBtns = styled.div`display: flex; gap: 6px;`
const IconBtn = styled.button`
  background: ${({ $color }) => $color}18; border: 1px solid ${({ $color }) => $color}44;
  color: ${({ $color }) => $color}; padding: 5px; border-radius: 6px; cursor: pointer;
  font-size: 1rem; display: flex; align-items: center;
  &:hover { background: ${({ $color }) => $color}30; }
`
const EmptyRow = styled.div`text-align: center; padding: 40px; color: #4a5568; font-size: 0.9rem;`
const EmptyState = styled.div`text-align: center; padding: 60px; color: #4a5568; font-size: 0.9rem; background: #13161f; border: 1px solid #1e2235; border-radius: 12px;`
const CountBadge = styled.div`color: #4a5568; font-size: 0.82rem; text-align: right;`
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 16px;
`
const Modal = styled.div`background: #13161f; border: 1px solid #2d3748; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;`
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #1e2235;
  h3 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; }
`
const CloseBtn = styled.button`background: none; border: none; color: #4a5568; font-size: 1.3rem; cursor: pointer; &:hover { color: #e2e8f0; }`
const FormGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px; @media (max-width: 480px) { grid-template-columns: 1fr; }`
const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  label { font-size: 0.82rem; color: #8892b0; font-weight: 500; }
  input, select { background: #0f1117; border: 1px solid #2d3748; border-radius: 8px; padding: 10px 12px; color: #e2e8f0; font-size: 0.9rem; outline: none; &:focus { border-color: #00e0ff; } }
  select option { background: #13161f; }
`
const ErrorText = styled.div`font-size: 0.75rem; color: #ff6b6b; margin-top: -2px;`
const HintText = styled.div`font-size: 0.75rem; color: #4a5568; margin-top: -2px;`
const ModalFooter = styled.div`display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #1e2235;`
const CancelBtn = styled.button`background: #1a1d2e; border: 1px solid #2d3748; color: #8892b0; padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; &:hover { color: #e2e8f0; }`
const SaveBtn = styled.button`background: #00e0ff18; border: 1px solid #00e0ff44; color: #00e0ff; padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; &:hover { background: #00e0ff28; }`
const ConfirmModal = styled.div`background: #13161f; border: 1px solid #2d3748; border-radius: 16px; padding: 28px; max-width: 400px; width: 100%; h3 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-bottom: 10px; } p { color: #8892b0; font-size: 0.9rem; line-height: 1.5; }`
const ConfirmBtns = styled.div`display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;`
const DeleteBtn = styled.button`background: #ff6b6b18; border: 1px solid #ff6b6b44; color: #ff6b6b; padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; &:hover { background: #ff6b6b28; }`
const ContractDialogBox = styled.div`display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 32px 24px; max-width: 360px; width: 100%;`
const ContractCard = styled.div`
  position: relative; border: 4px solid #1e3a5f; overflow: hidden; border-radius: 16px;
  height: 208px; width: 288px; background: #0e4272; padding: 20px;
  display: flex; flex-direction: column; align-items: flex-start; gap: 16px;
  transition: transform 0.3s; transform: rotate(-8deg);
  &:hover { transform: rotate(0deg); }
`
const CardTop = styled.div`color: #f9fafb; z-index: 10; position: relative;`
const CardTitle = styled.div`font-weight: 700; font-size: 1.6rem; line-height: 1; margin-bottom: 6px;`
const CardDesc = styled.div`font-size: 0.82rem; font-weight: 600; color: #bfdbfe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;`
const CardMeta = styled.div`font-size: 0.72rem; color: #93c5fd; margin-top: 2px;`
const CardSum = styled.div`font-size: 0.78rem; color: #7dd3fc; font-weight: 700; margin-top: 4px;`
const DownloadBtn = styled.button`
  position: relative; z-index: 10; transition: all 0.3s;
  border: 1px solid #1e3a5f; background: #f9fafb; color: #0e4272;
  font-weight: 600; padding: 8px 12px; display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 0.9rem; border-radius: 4px;
  &:hover { background: #1e3a5f; color: #f9fafb; }
  svg { width: 20px; height: 20px; fill: currentColor; }
`
const CardSvg1 = styled.svg`
  position: absolute; bottom: -2px; right: -80px; width: 192px; height: 192px; z-index: 10; margin: -8px;
  fill: #f9fafb; stroke: #1e3a5f; transition: transform 0.5s;
  ${ContractCard}:hover & { transform: scale(1.25); }
`
const CardSvg2 = styled.svg`
  position: absolute; bottom: -2px; right: -80px; width: 192px; height: 192px; z-index: 10; margin: -8px;
  fill: #f9fafb; stroke: #1e6090; transition: transform 0.2s;
  ${ContractCard}:hover & { transform: scale(1.25); }
`
const CloseContractBtn = styled.button`display: flex; align-items: center; gap: 6px; background: #1a1d2e; border: 1px solid #2d3748; color: #8892b0; padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; &:hover { color: #e2e8f0; }`
