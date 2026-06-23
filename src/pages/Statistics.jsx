import React from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TicketRow, TicketCard, TicketNotch, TicketDashes,
  TicketContent, TicketLabel, TicketValue, TicketSub, TicketIllustration,
} from '../components/TicketCards'

const COLORS = ['#00e0ff', '#7c3aed', '#10b981', '#f59e0b', '#ff6b6b']

const formatSum = (val) => {
  if (!val && val !== 0) return '0'
  return Number(val).toLocaleString('ru-RU')
}

export default function Statistics() {
  const { students, payments, expenses } = useData()

  // Haftalik grafik
  // Tushum = students.paid jami (barcha vaqt uchun kumulativ) — har kun o'zgarmaydi
  // Chunki students.paid = boshlang'ich to'lov + keyingi payments hammasi
  // Grafik uchun: har kun uchun shu kunga qadar bo'lgan payments + o'sha kunda qo'shilgan students.paid
  const getChartData = () => {
    const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan']
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysToMonday = (dayOfWeek + 6) % 7

    // Jami tushum = barcha students.paid (payments + boshlang'ich to'lovlar)
    const totalRevenue = students.reduce((s, st) => s + (st.paid || 0), 0)

    const data = []
    const maxDays = daysToMonday + 1

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - daysToMonday + i)
      const dateStr = date.toISOString().split('T')[0]

      // Shu kunga qadar bo'lgan chiqimlar (kumulativ)
      const chiqim = expenses
        .filter(e => e.date <= dateStr)
        .reduce((s, e) => s + e.amount, 0)

      // Tushum: payments collectionidan shu kunga qadar + students.paid dan
      // payments collection da faqat keyingi to'lovlar bor
      // students.paid da esa hammasi (boshlang'ich + keyingi) bor
      // Shuning uchun jami tushum = totalRevenue (o'zgarmaydi hafta ichida)
      // Ammo grafikda o'sishni ko'rsatish uchun: shu kunda qo'shilgan payments ni hisoblaymiz
      const paymentsUpToDate = payments
        .filter(p => p.date <= dateStr)
        .reduce((s, p) => s + p.amount, 0)

      // Boshlang'ich to'lovlar (payments da yo'q, students.paid da bor)
      const initialPaid = totalRevenue - payments.reduce((s, p) => s + p.amount, 0)

      // Shu kunga qadar tushum = boshlang'ich to'lovlar + shu kunga qadar payments
      const tushum = initialPaid + paymentsUpToDate

      data.push({
        kun: dayNames[date.getDay()],
        tushum,
        chiqim,
        foyda: tushum - chiqim,
      })
    }
    return data
  }

  const chartData = getChartData()

  // Group distribution
  const groupCounts = students.reduce((acc, s) => {
    acc[s.group] = (acc[s.group] || 0) + 1
    return acc
  }, {})
  const groupPieData = Object.entries(groupCounts).map(([name, value]) => ({ name, value }))

  // Med status
  const medOk = students.filter(s => s.medStatus === 'Topshirilgan').length
  const medNo = students.filter(s => s.medStatus === 'Topshirilmagan').length
  const medPieData = [
    { name: 'Topshirilgan', value: medOk },
    { name: 'Topshirilmagan', value: medNo },
  ]

  // Payment status
  const fullyPaid = students.filter(s => s.paid >= s.contractSum).length
  const partial = students.filter(s => s.paid > 0 && s.paid < s.contractSum).length
  const notPaid = students.filter(s => s.paid === 0).length
  const payPieData = [
    { name: "To'liq to'lagan", value: fullyPaid },
    { name: 'Qisman', value: partial },
    { name: "To'lamagan", value: notPaid },
  ]

  const totalRevenue = students.reduce((s, st) => s + (st.paid || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalDebt = students.reduce((s, st) => s + (st.contractSum - st.paid), 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <Wrapper>
      <PageHeader>
        <h2>Statistika</h2>
      </PageHeader>

      {/* ── Ticket KPI Row ── */}
      <TicketRow>
        {/* O'quvchilar */}
        <TicketCard $bg1="#00c6ff" $bg2="#0072ff">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Jami o'quvchilar</TicketLabel>
            <TicketValue>{students.length}</TicketValue>
            <TicketSub>Faol o'quvchilar soni</TicketSub>
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

        {/* Tushum */}
        <TicketCard $bg1="#f7971e" $bg2="#ffd200">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Jami tushum</TicketLabel>
            <TicketValue>{formatSum(totalRevenue)} so'm</TicketValue>
            <TicketSub>{students.filter(s => s.paid > 0).length} ta o'quvchi to'lagan</TicketSub>
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

        {/* Chiqimlar */}
        <TicketCard $bg1="#ff6b6b" $bg2="#c92a2a">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Jami chiqim</TicketLabel>
            <TicketValue>{formatSum(totalExpenses)} so'm</TicketValue>
            <TicketSub>{expenses.length} ta chiqim</TicketSub>
          </TicketContent>
          <TicketIllustration>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="26" fill="rgba(255,255,255,0.2)" />
              <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.25)" />
              <path d="M30 40 L50 40 M40 30 L40 50" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round" fill="none"/>
            </svg>
          </TicketIllustration>
        </TicketCard>

        {/* Sof foyda */}
        <TicketCard $bg1="#11998e" $bg2="#38ef7d">
          <TicketNotch $side="left" />
          <TicketNotch $side="right" />
          <TicketDashes />
          <TicketContent>
            <TicketLabel>Sof foyda</TicketLabel>
            <TicketValue>{formatSum(netProfit)} so'm</TicketValue>
            <TicketSub>Tushum - Chiqim</TicketSub>
          </TicketContent>
          <TicketIllustration>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="26" fill="rgba(255,255,255,0.2)" />
              <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.25)" />
              <path d="M28 40 L36 48 L52 32" stroke="rgba(255,255,255,0.85)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </TicketIllustration>
        </TicketCard>
      </TicketRow>

      <ChartsRow>
        <ChartCard>
          <ChartTitle>Tushum vs Chiqim</ChartTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" />
              <XAxis dataKey="kun" stroke="#4a5568" tick={{ fill: '#8892b0', fontSize: 12 }} />
              <YAxis stroke="#4a5568" tick={{ fill: '#8892b0', fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 }}
                formatter={(v) => [`${v.toLocaleString()} so'm`]}
              />
              <Legend />
              <Bar dataKey="tushum" fill="#10b981" radius={[4, 4, 0, 0]} name="Tushum" />
              <Bar dataKey="chiqim" fill="#ff6b6b" radius={[4, 4, 0, 0]} name="Chiqim" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Sof foyda dinamikasi</ChartTitle>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" />
              <XAxis dataKey="kun" stroke="#4a5568" tick={{ fill: '#8892b0', fontSize: 12 }} />
              <YAxis stroke="#4a5568" tick={{ fill: '#8892b0', fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 }}
                formatter={(v) => [`${v.toLocaleString()} so'm`, 'Sof foyda']}
              />
              <Line type="monotone" dataKey="foyda" stroke="#00e0ff" strokeWidth={3} dot={{ fill: '#00e0ff', r: 5 }} name="Sof foyda" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsRow>

      {/* Pie Charts */}
      <PieRow>
        <ChartCard>
          <ChartTitle>Guruhlar bo'yicha</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={groupPieData}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
              >
                {groupPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend
                formatter={(val) => <span style={{ color: '#e2e8f0', fontSize: 12 }}>{val}</span>}
              />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(v, name) => [`${v} ta`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Medspr. holati</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={medPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                <Cell fill="#10b981" />
                <Cell fill="#ff6b6b" />
              </Pie>
              <Legend formatter={(val) => <span style={{ color: '#e2e8f0', fontSize: 13 }}>{val}</span>} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(v, name) => [`${v} ta`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>To'lov holati</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={payPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ff6b6b" />
              </Pie>
              <Legend formatter={(val) => <span style={{ color: '#e2e8f0', fontSize: 13 }}>{val}</span>} />
              <Tooltip
                contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(v, name) => [`${v} ta`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </PieRow>
    </Wrapper>
  )
}

const Wrapper = styled.div`display: flex; flex-direction: column; gap: 24px;`

const PageHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; }
`

const PeriodTabs = styled.div`
  display: flex; background: #13161f; border: 1px solid #2d3748; border-radius: 8px; overflow: hidden;
`

const PeriodTab = styled.button`
  padding: 7px 16px; font-size: 0.85rem; font-weight: 500; cursor: pointer; border: none;
  background: ${({ $active }) => $active ? '#00e0ff18' : 'transparent'};
  color: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'};
  border-right: 1px solid #2d3748;
  &:last-child { border-right: none; }
  &:hover { color: #00e0ff; }
`

const ChartsRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`

const PieRow = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

const ChartCard = styled.div`
  background: #13161f; border: 1px solid #1e2235; border-radius: 12px; padding: 20px;
`

const ChartTitle = styled.div`
  font-size: 0.95rem; font-weight: 600; color: #e2e8f0; margin-bottom: 16px;
`
