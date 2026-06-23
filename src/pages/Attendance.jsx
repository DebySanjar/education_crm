import { useState, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { useData } from '../context/DataContext'
import { saveAs } from 'file-saver'
import ExcelTicketBtn from '../components/ExcelTicketBtn'
import {
  MdCheckCircle, MdCancel, MdDownload, MdCalendarToday,
  MdPeople, MdSearch, MdSave, MdLock,
} from 'react-icons/md'

const TOTAL_DAYS = 15

// Guruh nomi asosida ruxsat etilgan vaqt oralig'ini qaytaradi
// { start: 'HH:MM', end: 'HH:MM' } yoki null (cheklovsiz)
const GROUP_SCHEDULE = {
  'Ertalabki': { start: '08:00', end: '09:30' },
  'Abetki':    { start: '09:31', end: '13:30' },
  'Kechki':    { start: '13:31', end: '18:30' },
}


// Hozirgi vaqt HH:MM formatda
const getCurrentTime = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// Guruh uchun davomat qilish mumkinmi? (faqat bugun + vaqt oralig'i)
const canEditGroup = (groupName, selectedDate) => {
  const today = new Date().toISOString().split('T')[0]
  if (selectedDate !== today) return false
  const schedule = Object.entries(GROUP_SCHEDULE).find(([key]) => groupName?.includes(key))
  if (!schedule) return true // noma'lum guruh — cheklov yo'q
  const now = getCurrentTime()
  return now >= schedule[1].start && now <= schedule[1].end
}

// Guruh jadval matnini qaytaradi: "08:00 – 09:30"
const getScheduleLabel = (groupName) => {
  const entry = Object.entries(GROUP_SCHEDULE).find(([key]) => groupName?.includes(key))
  if (!entry) return null
  return `${entry[1].start} – ${entry[1].end}`
  
}

export default function Attendance() {
  const { students, attendance, saveAttendanceForDate, groups, refreshAttendance } = useData()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [search, setSearch] = useState('')
  const [localAtt, setLocalAtt] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [, tick] = useState(0) 

  // Har 30 soniyada vaqtni yangilash — canEdit ni qayta hisoblash uchun
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    refreshAttendance()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Birinchi guruhni default tanlash
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].name)
    }
  }, [groups]) // eslint-disable-line react-hooks/exhaustive-deps

  // Default holat: HAMMA kelmagan (0)
  useEffect(() => {
    const dayAtt = attendance[selectedDate] || {}
    const init = {}
    students.forEach(s => {
      const val = dayAtt[s.id]
      init[s.id] = val === 1 ? 1 : 0   // faqat saqlangan 1 lar keldi, qolgan hammasi 0
    })
    setLocalAtt(init)
    setSaved(false)
  }, [selectedDate, students, attendance])

  const filtered = useMemo(() => students.filter(s => {
    const matchGroup = !selectedGroup || s.group === selectedGroup
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  }), [students, selectedGroup, search])

  const presentCount = filtered.filter(s => localAtt[s.id] === 1).length
  const absentCount  = filtered.filter(s => localAtt[s.id] !== 1).length

  // Joriy guruh uchun tahrirlash mumkinmi
  const canEdit = canEditGroup(selectedGroup, selectedDate)
  const scheduleLabel = getScheduleLabel(selectedGroup)

  const handleToggle = (studentId) => {
    if (!canEdit) return
    setLocalAtt(prev => ({ ...prev, [studentId]: prev[studentId] === 1 ? 0 : 1 }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!canEdit) return
    setSaving(true)
    const result = await saveAttendanceForDate(selectedDate, localAtt)
    setSaving(false)
    if (result?.success !== false) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const export15DaysExcel = async () => {
    const ExcelJS = (await import('exceljs')).default
    const todayStr = new Date().toISOString().split('T')[0]
    const dates = []
    const baseMs = new Date(todayStr + 'T00:00:00').getTime()
    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const d = new Date(baseMs - i * 24 * 60 * 60 * 1000)
      dates.push(d.toISOString().split('T')[0])
    }

    const groupStudents = students.filter(s => !selectedGroup || s.group === selectedGroup)
    const groupName = selectedGroup || 'Barcha_guruhlar'
    const fromDate = dates[0]
    const toDate   = dates[dates.length - 1]

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet(groupName.replace(/\s+/g, '_'))

    sheet.columns = [
      { key: 'num',     width: 5  },
      { key: 'name',    width: 30 },
      { key: 'total',   width: 18 },
      { key: 'present', width: 18 },
      { key: 'absent',  width: 20 },
    ]

    const headerRow = sheet.addRow(['#', 'Ism-Familya', 'Jami dars kuni', 'Kelgan kunlari', 'Kelmagan kunlari'])
    headerRow.height = 22
    headerRow.eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FF374151' }, size: 11 }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1D5DB' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border    = { bottom: { style: 'thin', color: { argb: 'FFB0B7C3' } } }
    })

    groupStudents.forEach((s, idx) => {
      let kelganKun = 0
      dates.forEach(date => {
        const val = (attendance[date] || {})[s.id]
        if (val === 1 || val === true) kelganKun++
      })
      const isEven = (idx + 1) % 2 === 0
      const row = sheet.addRow([idx + 1, s.fullName, TOTAL_DAYS, kelganKun, TOTAL_DAYS - kelganKun])
      row.height = 20
      row.eachCell((cell, col) => {
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFE8F4FD' : 'FFF0F9FF' } }
        cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : 'center' }
        cell.font      = { size: 10, color: { argb: 'FF1E293B' } }
        cell.border    = { bottom: { style: 'hair', color: { argb: 'FFCBD5E1' } } }
        if (col === 4) {
          cell.font = { size: 10, bold: true, color: { argb: 'FF065F46' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFD1FAE5' : 'FFE6FFF5' } }
        }
        if (col === 5) {
          cell.font = { size: 10, bold: true, color: { argb: 'FF991B1B' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFFEE2E2' : 'FFFFF0F0' } }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `davomat_${groupName.replace(/\s+/g, '_')}_${fromDate}_${toDate}.xlsx`)
  }

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('uz-UZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const isToday = selectedDate === today

  return (
    <Wrapper>
      {/* Header */}
      <PageHeader>
        <div>
          <h2>Davomat</h2>
          <DateLabel>{displayDate}</DateLabel>
        </div>
        <HeaderActions>
          <ExcelTicketBtn onClick={export15DaysExcel} label="15 kunlik" subLabel="Davomat Excel" />
          {isToday && (
            <SaveBtn $saved={saved} onClick={handleSave} disabled={saving || !canEdit}>
              <MdSave />
              {saving ? 'Saqlanmoqda...' : saved ? 'Saqlandi ✓' : 'Saqlash'}
            </SaveBtn>
          )}
        </HeaderActions>
      </PageHeader>

      {/* Controls */}
      <ControlsCard>
        <ControlsRow>
          <DatePickerWrap $readonly={!isToday}>
            <MdCalendarToday />
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={e => {
                if (e.target.value <= today) setSelectedDate(e.target.value)
              }}
            />
          </DatePickerWrap>
          <SearchWrap>
            <MdSearch />
            <input
              placeholder="O'quvchi qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchWrap>
        </ControlsRow>

        {/* Guruh tablari — vaqt tartibida: Ertalabki → Abetki → Kechgi */}
        <GroupTabsRow>
          {[...groups].sort((a, b) => {
            const order = ['Ertalabki', 'Abetki', 'Kechgi']
            const ai = order.findIndex(k => a.name?.includes(k))
            const bi = order.findIndex(k => b.name?.includes(k))
            const av = ai === -1 ? 99 : ai
            const bv = bi === -1 ? 99 : bi
            return av - bv
          }).map(g => {
            const cnt = students.filter(s => s.group === g.name).length
            const schedule = getScheduleLabel(g.name)
            return (
              <GroupTab
                key={g.id}
                $active={selectedGroup === g.name}
                onClick={() => setSelectedGroup(g.name)}
              >
                <span className="name">{g.name}</span>
                {schedule && <span className="time">{schedule}</span>}
                <GroupCount $active={selectedGroup === g.name}>{cnt}</GroupCount>
              </GroupTab>
            )
          })}
        </GroupTabsRow>
      </ControlsCard>

      {/* Vaqt cheklovi banneri olib tashlandi */}
      {!isToday && (
        <ViewBanner>
          <MdCalendarToday />
          <span>O'tgan kun ko'rinmoqda — faqat ko'rish rejimi</span>
        </ViewBanner>
      )}

      {/* Stats */}
      <StatsRow>
        <StatPill $color="#10b981">
          <MdCheckCircle />
          <span className="num">{presentCount}</span>
          <span className="lbl">Keldi</span>
        </StatPill>
        <StatPill $color="#ff6b6b">
          <MdCancel />
          <span className="num">{absentCount}</span>
          <span className="lbl">Kelmadi</span>
        </StatPill>
        <StatPill $color="#8892b0">
          <MdPeople />
          <span className="num">{filtered.length}</span>
          <span className="lbl">Jami</span>
        </StatPill>
      </StatsRow>

      {/* Table */}
      <TableCard>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: 44 }}>#</Th>
              <Th>Ism-Sharif</Th>
              <Th>Guruh</Th>
              <Th>Telefon</Th>
              <Th style={{ textAlign: 'center' }}>Holat</Th>
              <Th style={{ textAlign: 'center', width: 80 }}>Belgilash</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}><EmptyRow>
                  {groups.length === 0 ? "Avval guruh qo'shing" : "O'quvchi topilmadi"}
                </EmptyRow></td>
              </tr>
            )}
            {filtered.map((s, i) => {
              const isKeldi = localAtt[s.id] === 1
              const editable = canEdit && isToday
              return (
                <TableRow key={s.id} $isKeldi={isKeldi}>
                  <Td>{i + 1}</Td>
                  <Td>
                    <StudentCell>
                      <AvatarCircle $isKeldi={isKeldi}>{s.fullName.charAt(0)}</AvatarCircle>
                      <span>{s.fullName}</span>
                    </StudentCell>
                  </Td>
                  <Td><GroupBadge>{s.group}</GroupBadge></Td>
                  <Td style={{ color: '#8892b0' }}>{s.phone}</Td>
                  <Td style={{ textAlign: 'center' }}>
                    <StatusBadge $isKeldi={isKeldi}>
                      {isKeldi ? '✓ Keldi' : '✗ Kelmadi'}
                    </StatusBadge>
                  </Td>
                  <Td style={{ textAlign: 'center' }}>
                    {editable ? (
                      <CheckboxLabel $isKeldi={isKeldi}>
                        <input type="checkbox" checked={isKeldi} onChange={() => handleToggle(s.id)} />
                        <Checkmark $isKeldi={isKeldi} />
                      </CheckboxLabel>
                    ) : (
                      <LockIcon title="O'zgartirish mumkin emas"><MdLock /></LockIcon>
                    )}
                  </Td>
                </TableRow>
              )
            })}
          </tbody>
        </Table>
      </TableCard>
    </Wrapper>
  )
}

/* ── Animations ── */
const splash = keyframes`
  0%   { transform: scale(0) rotate(40deg); opacity: 0; }
  70%  { transform: scale(1.2) rotate(40deg); }
  100% { transform: scale(1) rotate(40deg); opacity: 1; }
`

/* ── Styles ── */
const Wrapper = styled.div`display: flex; flex-direction: column; gap: 18px;`

const PageHeader = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; margin-bottom: 2px; }
`
const DateLabel = styled.div`font-size: 0.82rem; color: #4a5568; text-transform: capitalize;`
const HeaderActions = styled.div`display: flex; align-items: center; gap: 10px;`

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: #1a1d2e; border: 1px solid #2d3748; color: #10b981;
  padding: 9px 18px; border-radius: 8px; cursor: pointer; font-size: 0.88rem; font-weight: 500;
  white-space: nowrap;
  &:hover { background: #10b98118; }
`
const SaveBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: ${({ $saved }) => $saved ? '#10b98118' : '#00e0ff18'};
  border: 1px solid ${({ $saved }) => $saved ? '#10b98144' : '#00e0ff44'};
  color: ${({ $saved }) => $saved ? '#10b981' : '#00e0ff'};
  padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600;
  white-space: nowrap; transition: all 0.2s;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:hover:not(:disabled) { background: ${({ $saved }) => $saved ? '#10b98128' : '#00e0ff28'}; }
`

const ControlsCard = styled.div`
  background: #13161f; border: 1px solid #1e2235; border-radius: 12px; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 14px;
`
const ControlsRow = styled.div`
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  @media (max-width: 768px) { flex-direction: column; align-items: stretch; }
`
const DatePickerWrap = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #0f1117; border: 1px solid #2d3748; border-radius: 8px; padding: 8px 14px;
  svg { color: #00e0ff; font-size: 1rem; flex-shrink: 0; }
  input { background: none; border: none; outline: none; color: #e2e8f0; font-size: 0.9rem; color-scheme: dark; }
`
const SearchWrap = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: #0f1117; border: 1px solid #2d3748; border-radius: 8px;
  padding: 8px 14px; flex: 1; min-width: 180px;
  svg { color: #4a5568; font-size: 1rem; flex-shrink: 0; }
  input {
    background: none; border: none; outline: none; color: #e2e8f0; font-size: 0.9rem; width: 100%;
    &::placeholder { color: #4a5568; }
  }
`

const GroupTabsRow = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap;
  padding-top: 4px; border-top: 1px solid #1e2235;
`
const GroupTab = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: 10px;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  white-space: nowrap;

  /* 3D effekt — active emas */
  border: none;
  background: ${({ $active }) => $active ? '#00e0ff' : '#1a1d2e'};
  color: ${({ $active }) => $active ? '#000' : '#8892b0'};
  box-shadow: ${({ $active }) => $active
    ? '0 1px 0 #0098b0, 0 2px 0 #007a8f, 0 3px 6px rgba(0,0,0,0.4)'
    : '0 1px 0 #111318, 0 2px 0 #0d0f15, 0 3px 6px rgba(0,0,0,0.3)'
  };
  transform: ${({ $active }) => $active ? 'translateY(0)' : 'translateY(-2px)'};
  transition: all 0.12s ease;

  .name { font-weight: 700; letter-spacing: 0.2px; }
  .time {
    font-size: 0.7rem;
    opacity: ${({ $active }) => $active ? '0.7' : '0.45'};
    letter-spacing: 0.3px;
  }

  &:hover {
    background: ${({ $active }) => $active ? '#00e0ff' : '#242838'};
    color: ${({ $active }) => $active ? '#000' : '#00e0ff'};
    transform: translateY(-2px);
    box-shadow: 0 1px 0 #0098b0, 0 2px 0 #007a8f, 0 4px 10px rgba(0,224,255,0.2);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 0px 0 #0098b0, 0 1px 0 #007a8f, 0 1px 4px rgba(0,0,0,0.3);
  }
`
const GroupCount = styled.span`
  background: ${({ $active }) => $active ? 'rgba(0,0,0,0.2)' : '#2d3748'};
  color: ${({ $active }) => $active ? '#000' : '#94a3b8'};
  padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
`

const LockBanner = styled.div`
  display: flex; align-items: center; gap: 10px;
  background: #ff6b6b12; border: 1px solid #ff6b6b33; border-radius: 10px;
  padding: 10px 16px; color: #ff6b6b; font-size: 0.85rem;
  svg { font-size: 1.1rem; flex-shrink: 0; }
  b { color: #fca5a5; }
`
const ViewBanner = styled.div`
  display: flex; align-items: center; gap: 10px;
  background: #f59e0b12; border: 1px solid #f59e0b33; border-radius: 10px;
  padding: 10px 16px; color: #f59e0b; font-size: 0.85rem;
  svg { font-size: 1.1rem; flex-shrink: 0; }
`

const StatsRow = styled.div`display: flex; align-items: center; gap: 10px; flex-wrap: wrap;`
const StatPill = styled.div`
  display: flex; align-items: center; gap: 6px;
  background: #13161f; border: 1px solid ${({ $color }) => $color}33;
  border-radius: 10px; padding: 8px 14px;
  svg { color: ${({ $color }) => $color}; font-size: 1.1rem; }
  .num { font-size: 1.1rem; font-weight: 700; color: ${({ $color }) => $color}; }
  .lbl { font-size: 0.78rem; color: #8892b0; }
`

const TableCard = styled.div`
  background: #13161f; border: 1px solid #1e2235; border-radius: 12px; overflow-x: auto;
`
const Table = styled.table`width: 100%; border-collapse: collapse;`
const Th = styled.th`
  text-align: left; padding: 12px 16px; font-size: 0.75rem; color: #4a5568;
  text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #1e2235;
  white-space: nowrap; background: #0f1117;
`
const TableRow = styled.tr`
  background: ${({ $isKeldi }) => $isKeldi ? 'rgba(16,185,129,0.03)' : 'rgba(255,107,107,0.03)'};
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.02); }
  &:last-child td { border-bottom: none; }
`
const Td = styled.td`
  padding: 12px 16px; font-size: 0.88rem; color: #cbd5e0;
  border-bottom: 1px solid #1a1d2e; white-space: nowrap;
`
const StudentCell = styled.div`display: flex; align-items: center; gap: 10px;`
const AvatarCircle = styled.div`
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
  background: ${({ $isKeldi }) => $isKeldi ? '#10b98122' : '#ff6b6b22'};
  color: ${({ $isKeldi }) => $isKeldi ? '#10b981' : '#ff6b6b'};
`
const GroupBadge = styled.span`
  padding: 3px 8px; border-radius: 6px; font-size: 0.78rem; font-weight: 600;
  background: #00e0ff12; color: #00e0ff; border: 1px solid #00e0ff33;
`
const StatusBadge = styled.span`
  display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600;
  background: ${({ $isKeldi }) => $isKeldi ? '#10b98118' : '#ff6b6b18'};
  color: ${({ $isKeldi }) => $isKeldi ? '#10b981' : '#ff6b6b'};
  border: 1px solid ${({ $isKeldi }) => $isKeldi ? '#10b98133' : '#ff6b6b33'};
`
const LockIcon = styled.span`
  color: #374151; font-size: 1rem; display: inline-flex; align-items: center;
`
const EmptyRow = styled.div`text-align: center; padding: 48px; color: #4a5568; font-size: 0.9rem;`

/* ── Custom Checkbox ── */
const CheckboxLabel = styled.label`
  display: inline-block; position: relative; cursor: pointer;
  font-size: 22px; user-select: none;
  width: 1.5em; height: 1.5em; margin: 0 auto;
  input { position: absolute; opacity: 0; cursor: pointer; width: 0; height: 0; }
`
const Checkmark = styled.div`
  position: absolute; top: 0; left: 0;
  height: 1.5em; width: 1.5em;
  background-color: ${({ $isKeldi }) => $isKeldi ? '#10b981' : '#ff5722'};
  border: 4px solid #1a1a1a;
  border-radius: ${({ $isKeldi }) => $isKeldi
    ? '8% 92% 12% 88% / 87% 11% 89% 13%'
    : '92% 8% 88% 12% / 11% 87% 13% 89%'};
  box-shadow: 3px 3px 0px #1a1a1a;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s, border-radius 0.2s;
  transform: ${({ $isKeldi }) => $isKeldi ? 'scale(1.1) rotate(-2deg)' : 'scale(1.05) rotate(2deg)'};

  ${CheckboxLabel}:hover & { transform: scale(1.08) rotate(2deg); }
  ${CheckboxLabel}:active & { transform: scale(0.9) translateY(3px); box-shadow: 0px 0px 0px #1a1a1a; }

  &::after {
    content: "";
    position: absolute;
    display: ${({ $isKeldi }) => $isKeldi ? 'block' : 'none'};
    left: 0.36em; top: 0.09em;
    width: 0.3em; height: 0.7em;
    border: solid #1a1a1a; border-width: 0 0.25em 0.25em 0;
    border-radius: 2px; transform: rotate(40deg);
    animation: ${({ $isKeldi }) => $isKeldi ? splash : 'none'} 0.3s forwards;
  }
  &::before {
    content: "✕";
    position: absolute;
    display: ${({ $isKeldi }) => !$isKeldi ? 'flex' : 'none'};
    inset: 0; align-items: center; justify-content: center;
    font-size: 0.65em; font-weight: 900; color: #1a1a1a;
  }
`
