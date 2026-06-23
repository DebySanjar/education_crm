import React, { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import { MdArrowForward, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import {
  TicketRow, TicketCard, TicketNotch, TicketDashes,
  TicketContent, TicketLabel, TicketValue, TicketIllustration,
} from '../components/TicketCards'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { SkeletonBlock, SkeletonTickets, SkeletonCharts, SkeletonTables } from '../components/Skeleton'

const formatSum = (val) => {
  if (!val && val !== 0) return '0'
  return Number(val).toLocaleString('ru-RU')
}

const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

function MiniCalendar() {
  const today = new Date()
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() })

  const firstDay = new Date(cur.y, cur.m, 1).getDay()
  // Monday-first: shift Sunday(0) to 6
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1)
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) =>
    d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear()

  const prev = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })
  const next = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })

  return (
    <CalendarWrap>
      <CalHeader>
        <CalNavBtn onClick={prev}><MdChevronLeft /></CalNavBtn>
        <CalMonthLabel>{MONTHS_UZ[cur.m]} {cur.y}</CalMonthLabel>
        <CalNavBtn onClick={next}><MdChevronRight /></CalNavBtn>
      </CalHeader>
      <CalGrid>
        {DAYS.map(d => <CalDayName key={d}>{d}</CalDayName>)}
        {cells.map((d, i) =>
          d === null
            ? <CalCell key={`e${i}`} />
            : <CalCell key={d} $today={isToday(d)}>{d}</CalCell>
        )}
      </CalGrid>
    </CalendarWrap>
  )
}

export default function Dashboard() {
  const { students, payments, attendance, loading } = useData()
  const navigate = useNavigate()

  if (loading) {
    return (
      <Wrapper>
        <PageHeader>
          <SkeletonBlock $h="28px" $w="160px" $r="8px" />
          <SkeletonBlock $h="32px" $w="180px" $r="20px" />
        </PageHeader>
        <SkeletonTickets />
        <SkeletonCharts />
        <SkeletonTables />
      </Wrapper>
    )
  }

  const totalStudents = students.length
  const totalContract = students.reduce((s, st) => s + st.contractSum, 0)
  const totalPaid = students.reduce((s, st) => s + st.paid, 0)
  const totalDebt = totalContract - totalPaid

  const today = new Date().toISOString().split('T')[0]
  const todayAtt = attendance[today] || {}
  const presentCount = Object.values(todayAtt).filter(v => v === 1).length

  const debtors = students.filter(s => s.contractSum - s.paid > 0)

  // Grafik: oxirgi 30 kun bo'yicha kunlik tushum
  // payments collection + student qo'shilgandagi boshlang'ich to'lov (joinDate + paid)
  const getChartData = () => {
    const data = []
    const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']

    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // payments collectionidan shu kundagi to'lovlar
      const dayFromPayments = payments
        .filter(p => p.date === dateStr)
        .reduce((s, p) => s + p.amount, 0)

      // students da joinDate === dateStr bo'lgan va paid > 0 bo'lganlar
      // (boshlang'ich to'lov — payments da yo'q, students.paid da saqlangan)
      const dayFromStudents = students
        .filter(s => s.joinDate === dateStr && s.paid > 0)
        .reduce((s, st) => s + st.paid, 0)

      const total = dayFromPayments + dayFromStudents

      data.push({
        label: i % 5 === 0 || i === 0
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : '',
        fullLabel: `${date.getDate()}/${date.getMonth() + 1} (${dayNames[date.getDay()]})`,
        tushum: total,
      })
    }
    return data
  }

  const chartData = getChartData()

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <Wrapper>
      <PageHeader id="dashboard-welcome">
        <h2>Bosh sahifa</h2>
      </PageHeader>

      {/* ── Ticket Stat Cards ── */}
      <TicketRow id="dashboard-kpis">
        {/* Card 1 — O'quvchilar */}
        <TicketCard $bg1="#00c6ff" $bg2="#0072ff">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Jami o'quvchilar</TicketLabel>
            <TicketValue>{totalStudents}</TicketValue>
            <TicketLink onClick={() => navigate('/students')}>
              Ro'yxatni ko'rish <MdArrowForward />
            </TicketLink>
          </TicketContent>
          <TicketIllustration>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="28" r="14" fill="rgba(255,255,255,0.35)" />
              <circle cx="40" cy="28" r="9" fill="rgba(255,255,255,0.6)" />
              <path d="M14 68c0-14.36 11.64-26 26-26h0c14.36 0 26 11.64 26 26" stroke="rgba(255,255,255,0.6)" strokeWidth="5" strokeLinecap="round" fill="none"/>
              <circle cx="22" cy="34" r="7" fill="rgba(255,255,255,0.25)" />
              <path d="M6 60c0-8.84 7.16-16 16-16" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <circle cx="58" cy="34" r="7" fill="rgba(255,255,255,0.25)" />
              <path d="M74 60c0-8.84-7.16-16-16-16" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" fill="none"/>
            </svg>
          </TicketIllustration>
        </TicketCard>

        {/* Card 2 — Daromad */}
        <TicketCard $bg1="#f7971e" $bg2="#ffd200">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Jami daromad</TicketLabel>
            <TicketValue>{formatSum(totalPaid)} so'm</TicketValue>
            <TicketLink onClick={() => navigate('/payments')}>
              To'lovlarni ko'rish <MdArrowForward />
            </TicketLink>
          </TicketContent>
          <TicketIllustration>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="22" width="60" height="40" rx="6" fill="rgba(255,255,255,0.3)" />
              <rect x="10" y="32" width="60" height="8" fill="rgba(255,255,255,0.25)" />
              <rect x="18" y="48" width="20" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
              <rect x="44" y="48" width="12" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
              <circle cx="58" cy="20" r="12" fill="rgba(255,255,255,0.35)" />
              <text x="54" y="25" fontSize="14" fontWeight="bold" fill="rgba(255,255,255,0.8)">$</text>
            </svg>
          </TicketIllustration>
        </TicketCard>

        {/* Card 3 — Qarz */}
        <TicketCard $bg1="#f953c6" $bg2="#b91d73">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Umumiy qarz</TicketLabel>
            <TicketValue>{formatSum(totalDebt)} so'm</TicketValue>
            <TicketLink onClick={() => navigate('/payments')}>
              Qarzdorlarni ko'rish <MdArrowForward />
            </TicketLink>
          </TicketContent>
          <TicketIllustration>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="26" fill="rgba(255,255,255,0.2)" />
              <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.25)" />
              <text x="33" y="46" fontSize="18" fontWeight="bold" fill="rgba(255,255,255,0.75)">!</text>
              <path d="M40 18 L44 30 L56 30 L46 38 L50 50 L40 42 L30 50 L34 38 L24 30 L36 30 Z" fill="rgba(255,255,255,0.15)" />
            </svg>
          </TicketIllustration>
        </TicketCard>

        {/* Card 4 — Davomat */}
        <TicketCard $bg1="#11998e" $bg2="#38ef7d">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Bugungi davomat</TicketLabel>
            <TicketValue>{presentCount} / {totalStudents}</TicketValue>
            <TicketLink onClick={() => navigate('/attendance')}>
              Davomatni ko'rish <MdArrowForward />
            </TicketLink>
          </TicketContent>
          <TicketIllustration>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="14" y="16" width="52" height="52" rx="8" fill="rgba(255,255,255,0.2)" />
              <rect x="14" y="16" width="52" height="16" rx="8" fill="rgba(255,255,255,0.25)" />
              <rect x="26" y="10" width="8" height="14" rx="4" fill="rgba(255,255,255,0.5)" />
              <rect x="46" y="10" width="8" height="14" rx="4" fill="rgba(255,255,255,0.5)" />
              <path d="M26 50 L34 58 L54 38" stroke="rgba(255,255,255,0.8)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </TicketIllustration>
        </TicketCard>
      </TicketRow>

      {/* Charts Row */}
      <ChartsRow>
        <ChartCard>
          <ChartTitle>So'nggi 30 kunlik tushum dinamikasi</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTushum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e0ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" />
              <XAxis dataKey="label" stroke="#4a5568" tick={{ fill: '#8892b0', fontSize: 10 }} />
              <YAxis stroke="#4a5568" tick={{ fill: '#8892b0', fontSize: 10 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
                formatter={(v) => [`${v.toLocaleString()} so'm`, 'Tushum']}
              />
              <Area type="monotone" dataKey="tushum" stroke="#00e0ff" strokeWidth={2} fill="url(#colorTushum)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Kalendar</ChartTitle>
          <MiniCalendar />
        </ChartCard>
      </ChartsRow>

      {/* Bottom Row */}
      <BottomRow>
        {/* Recent Payments */}
        <TableCard>
          <CardHeader>
            <CardTitle>So'nggi to'lovlar</CardTitle>
            <ViewAll onClick={() => navigate('/payments')}>Barchasi <MdArrowForward /></ViewAll>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>O'quvchi</Th>
                <Th>Summa</Th>
                <Th>Sana</Th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(p => (
                <tr key={p.id}>
                  <Td>{p.studentName}</Td>
                  <Td><GreenText>{p.amount.toLocaleString()} so'm</GreenText></Td>
                  <Td><MutedText>{p.date}</MutedText></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableCard>

        {/* Debtors */}
        <TableCard>
          <CardHeader>
            <CardTitle>Qarzdorlar</CardTitle>
            <ViewAll onClick={() => navigate('/payments')}>Barchasi <MdArrowForward /></ViewAll>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>O'quvchi</Th>
                <Th>Qarz</Th>
                <Th>Guruh</Th>
              </tr>
            </thead>
            <tbody>
              {debtors.map(s => (
                <tr key={s.id}>
                  <Td>{s.fullName.split(' ').slice(0, 2).join(' ')}</Td>
                  <Td><RedText>{(s.contractSum - s.paid).toLocaleString()} so'm</RedText></Td>
                  <Td><MutedText>{s.group}</MutedText></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableCard>
      </BottomRow>
    </Wrapper>
  )
}

const Wrapper = styled.div`display: flex; flex-direction: column; gap: 24px;`

const PageHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; }
`
const DateBadge = styled.div`
  background: #1a1d2e; border: 1px solid #2d3748; color: #8892b0;
  padding: 6px 14px; border-radius: 20px; font-size: 0.82rem;
`
const TicketLink = styled.button`
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; color: rgba(0,0,0,0.55);
  font-size: 0.78rem; font-weight: 600; cursor: pointer; padding: 0;
  text-decoration: underline; text-underline-offset: 2px; margin-top: 4px;
  &:hover { color: rgba(0,0,0,0.8); }
  svg { font-size: 0.9rem; }
`

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

const ChartCard = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  padding: 20px;
`

const ChartTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 16px;
`

/* ── Mini Calendar ── */
const CalendarWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const CalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CalMonthLabel = styled.div`
  font-size: 0.88rem;
  font-weight: 600;
  color: #e2e8f0;
`

const CalNavBtn = styled.button`
  background: #1a1d2e;
  border: 1px solid #2d3748;
  color: #8892b0;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  &:hover { color: #00e0ff; border-color: #00e0ff44; }
`

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
`

const CalDayName = styled.div`
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #4a5568;
  padding: 4px 0;
  text-transform: uppercase;
`

const CalCell = styled.div`
  text-align: center;
  font-size: 0.78rem;
  padding: 5px 2px;
  border-radius: 6px;
  color: ${({ $today }) => $today ? '#000' : '#8892b0'};
  background: ${({ $today }) => $today ? '#00e0ff' : 'transparent'};
  font-weight: ${({ $today }) => $today ? '700' : '400'};
  cursor: default;
  &:hover {
    background: ${({ $today }) => $today ? '#00e0ff' : '#1e2235'};
    color: ${({ $today }) => $today ? '#000' : '#e2e8f0'};
  }
`

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`

const TableCard = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  padding: 20px;
  overflow: hidden;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const CardTitle = styled.div`font-size: 0.95rem; font-weight: 600; color: #e2e8f0;`

const ViewAll = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #00e0ff;
  font-size: 0.82rem;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  font-size: 0.78rem;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #1e2235;
`

const Td = styled.td`
  padding: 10px 10px;
  font-size: 0.85rem;
  color: #cbd5e0;
  border-bottom: 1px solid #1a1d2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`

const GreenText = styled.span`color: #10b981; font-weight: 600;`
const RedText = styled.span`color: #ff6b6b; font-weight: 600;`
const MutedText = styled.span`color: #4a5568;`

