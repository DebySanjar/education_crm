import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { motion, useInView } from 'framer-motion'
import { useData } from '../context/DataContext'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#00e0ff', '#7c3aed', '#10b981', '#f59e0b', '#ff6b6b']

const fmt = (v) => {
  if (!v && v !== 0) return '0'
  return Number(v).toLocaleString('ru-RU')
}

// Animated number component using framer-motion
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    
    const duration = 1500
    const startTime = performance.now()
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(value * eased)
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [inView, value])

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString('ru-RU')}{suffix}
    </span>
  )
}

// Framer variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

const scaleBounce = {
  hidden: { opacity: 0, scale: 0.7 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
}

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
}

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

export default function Statistics() {
  const { students, payments, expenses } = useData()

  const totalRevenue = students.reduce((s, st) => s + (st.paid || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  // KPI cards
  const kpis = [
    { label: "Jami o'quvchilar", value: students.length, suffix: ' ta', color: '#00e0ff', icon: '👥',
      sub: `${students.filter(s => s.paid > 0).length} ta to'lov qilgan` },
    { label: 'Jami tushum', value: totalRevenue, suffix: " so'm", color: '#10b981', icon: '💰',
      sub: `${payments.length} ta to'lov` },
    { label: 'Jami chiqim', value: totalExpenses, suffix: " so'm", color: '#ff6b6b', icon: '📤',
      sub: `${expenses.length} ta chiqim` },
    { label: 'Sof foyda', value: netProfit, suffix: " so'm", color: '#f59e0b', icon: '📈',
      sub: 'Tushum − Chiqim' },
  ]

  // Chart data
  const getChartData = () => {
    const days = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan']
    const today = new Date()
    const dow = today.getDay()
    const toMon = (dow + 6) % 7
    const totalRev = students.reduce((s, st) => s + (st.paid || 0), 0)

    return Array.from({ length: toMon + 1 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - toMon + i)
      const ds = d.toISOString().split('T')[0]
      const paymentsUpTo = payments.filter(p => p.date <= ds).reduce((s, p) => s + p.amount, 0)
      const initialPaid = totalRev - payments.reduce((s, p) => s + p.amount, 0)
      const tushum = initialPaid + paymentsUpTo
      const chiqim = expenses.filter(e => e.date <= ds).reduce((s, e) => s + e.amount, 0)
      return { kun: days[d.getDay()], tushum, chiqim, foyda: tushum - chiqim }
    })
  }
  const chartData = getChartData()

  // Pie data
  const groupCounts = students.reduce((acc, s) => { acc[s.group] = (acc[s.group] || 0) + 1; return acc }, {})
  const groupPie = Object.entries(groupCounts).map(([name, value]) => ({ name, value }))
  const medPie = [
    { name: 'Topshirilgan', value: students.filter(s => s.medStatus === 'Topshirilgan').length },
    { name: 'Topshirilmagan', value: students.filter(s => s.medStatus === 'Topshirilmagan').length },
  ]
  const payPie = [
    { name: "To'liq to'lagan", value: students.filter(s => s.paid >= s.contractSum).length },
    { name: 'Qisman', value: students.filter(s => s.paid > 0 && s.paid < s.contractSum).length },
    { name: "To'lamagan", value: students.filter(s => s.paid === 0).length },
  ]

  const tooltipStyle = {
    contentStyle: { background: '#1a1d2e', border: '1px solid #2d3748', borderRadius: 8 },
    labelStyle: { color: '#e2e8f0' },
    itemStyle: { color: '#e2e8f0' },
  }

  return (
    <Wrapper>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PageHeader>
          <TitleBlock>
            <PageTitle>Statistika</PageTitle>
            <PageSub>Real-time moliyaviy ko'rsatkichlar</PageSub>
          </TitleBlock>
          <LiveBadge>
            <LiveDot />
            <span>Live</span>
          </LiveBadge>
        </PageHeader>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <KpiGrid>
          {kpis.map((k, i) => (
            <motion.div 
              key={k.label} 
              custom={i} 
              variants={scaleBounce}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <KpiCard $color={k.color}>
                <KpiGlow $color={k.color} />
                <KpiTop>
                  <KpiIcon>{k.icon}</KpiIcon>
                  <KpiBadge $color={k.color}>{k.label}</KpiBadge>
                </KpiTop>
                <KpiValue $color={k.color}>
                  <AnimatedNumber value={k.value} suffix={k.suffix} />
                </KpiValue>
                <KpiSub>{k.sub}</KpiSub>
                <KpiBar>
                  <motion.div
                    style={{ background: k.color, height: '100%', borderRadius: 4, originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                  />
                </KpiBar>
              </KpiCard>
            </motion.div>
          ))}
        </KpiGrid>
      </motion.div>

      {/* Charts Grid */}
      <ChartsGrid>
        {/* Area Chart */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Haftalik tendentsiya</ChartTitle>
            </ChartHeader>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTushum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00e0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorChiqim" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="kun" stroke="#8892b0" />
                <YAxis stroke="#8892b0" tickFormatter={(value) => `${Math.round(value/1000000)}M`} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${fmt(value)} so'm`, '']} />
                <Area type="monotone" dataKey="tushum" stroke="#00e0ff" fillOpacity={1} fill="url(#colorTushum)" />
                <Area type="monotone" dataKey="chiqim" stroke="#ff6b6b" fillOpacity={1} fill="url(#colorChiqim)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Sof foyda</ChartTitle>
            </ChartHeader>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="kun" stroke="#8892b0" />
                <YAxis stroke="#8892b0" tickFormatter={(value) => `${Math.round(value/1000000)}M`} />
                <Tooltip {...tooltipStyle} formatter={(value) => [`${fmt(value)} so'm`, '']} />
                <Bar dataKey="foyda" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* Pie Charts */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <ChartCard>
            <ChartsRow>
              <ChartWrapper>
                <ChartHeader>
                  <ChartTitle>Guruhlar bo'yicha</ChartTitle>
                </ChartHeader>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={groupPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {groupPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrapper>
              <ChartWrapper>
                <ChartHeader>
                  <ChartTitle>To'lov holati</ChartTitle>
                </ChartHeader>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={payPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {payPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrapper>
            </ChartsRow>
          </ChartCard>
        </motion.div>


      </ChartsGrid>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 0 24px 0;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PageTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #e2e8f0;
  margin: 0;
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const PageSub = styled.p`
  font-size: 0.95rem;
  color: #8892b0;
  margin: 0;
`

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #10b98115;
  border: 1px solid #10b98144;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
`

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: ${pulse} 2s ease-in-out infinite;
`

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`

const KpiCard = styled.div`
  position: relative;
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    border-color: ${props => props.$color}44;
    box-shadow: 0 0 30px ${props => props.$color}22;
  }
`

const KpiGlow = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, ${props => props.$color}15 0%, transparent 70%);
  pointer-events: none;
`

const KpiTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`

const KpiIcon = styled.div`
  font-size: 2rem;
`

const KpiBadge = styled.div`
  padding: 4px 12px;
  background: ${props => props.$color}15;
  border: 1px solid ${props => props.$color}44;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${props => props.$color};
`

const KpiValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${props => props.$color};
  margin-bottom: 4px;
  line-height: 1.2;
`

const KpiSub = styled.div`
  font-size: 0.85rem;
  color: #8892b0;
  margin-bottom: 16px;
`

const KpiBar = styled.div`
  height: 4px;
  background: #1e2235;
  border-radius: 4px;
  overflow: hidden;
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ChartWrapper = styled.div`
  flex: 1;
`

const ChartCard = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  &:hover {
    border-color: #2d3748;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  }
`

const ChartHeader = styled.div`
  margin-bottom: 20px;
`

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`
