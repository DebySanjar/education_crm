import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
`

// Asosiy skeleton blok — istalgan o'lcham berish mumkin
export const SkeletonBlock = styled.div`
  width: ${({ $w }) => $w || '100%'};
  height: ${({ $h }) => $h || '16px'};
  border-radius: ${({ $r }) => $r || '6px'};
  background: linear-gradient(
    90deg,
    #1e2235 25%,
    #2a2f45 50%,
    #1e2235 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;
  flex-shrink: 0;
`

// ── Dashboard uchun skeleton komponentlar ──

// 4 ta ticket karta
export function SkeletonTickets() {
  return (
    <TicketRow>
      {[1, 2, 3, 4].map(i => (
        <TicketCard key={i}>
          <SkeletonBlock $h="13px" $w="60%" $r="4px" />
          <SkeletonBlock $h="28px" $w="80%" $r="6px" />
          <SkeletonBlock $h="11px" $w="40%" $r="4px" />
        </TicketCard>
      ))}
    </TicketRow>
  )
}

// 2 ta chart karta (grafik + kalend)
export function SkeletonCharts() {
  return (
    <ChartsRow>
      <ChartCard>
        <SkeletonBlock $h="18px" $w="55%" $r="6px" />
        <SkeletonBlock $h="220px" $r="8px" style={{ marginTop: 16 }} />
      </ChartCard>
      <ChartCard $small>
        <SkeletonBlock $h="18px" $w="50%" $r="6px" />
        <SkeletonBlock $h="220px" $r="8px" style={{ marginTop: 16 }} />
      </ChartCard>
    </ChartsRow>
  )
}

// 2 ta jadval (so'nggi to'lovlar + qarzdorlar)
export function SkeletonTables() {
  return (
    <BottomRow>
      {[1, 2].map(t => (
        <TableCard key={t}>
          <RowBetween>
            <SkeletonBlock $h="16px" $w="45%" $r="6px" />
            <SkeletonBlock $h="14px" $w="20%" $r="4px" />
          </RowBetween>
          <TableHead>
            {[40, 35, 25].map((w, i) => (
              <SkeletonBlock key={i} $h="11px" $w={`${w}%`} $r="3px" />
            ))}
          </TableHead>
          {[1, 2, 3, 4, 5].map(r => (
            <TableBodyRow key={r}>
              <SkeletonBlock $h="13px" $w="40%" $r="4px" />
              <SkeletonBlock $h="13px" $w="30%" $r="4px" />
              <SkeletonBlock $h="13px" $w="20%" $r="4px" />
            </TableBodyRow>
          ))}
        </TableCard>
      ))}
    </BottomRow>
  )
}

// ── Students sahifasi uchun skeleton ──
export function SkeletonStudents() {
  return (
    <SkelWrapper>
      {/* Search bar */}
      <SkeletonBlock $h="44px" $r="10px" />

      {/* Groups card */}
      <SkelCard style={{ marginTop: 16 }}>
        <SkeletonBlock $h="14px" $w="30%" $r="4px" style={{ marginBottom: 12 }} />
        <SkelChipRow>
          {[80, 100, 90, 70].map((w, i) => (
            <SkeletonBlock key={i} $h="32px" $w={`${w}px`} $r="20px" />
          ))}
        </SkelChipRow>
      </SkelCard>

      {/* Table */}
      <SkelCard style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        {/* Sticky header */}
        <SkelTableHead>
          {[30, 120, 90, 80, 70, 80, 80, 80, 70, 60].map((w, i) => (
            <SkeletonBlock key={i} $h="12px" $w={`${w}px`} $r="3px" />
          ))}
        </SkelTableHead>
        {/* 8 rows */}
        {Array.from({ length: 8 }).map((_, r) => (
          <SkelTableRow key={r}>
            {[30, 120, 90, 80, 70, 80, 80, 80, 70, 60].map((w, i) => (
              <SkeletonBlock key={i} $h="13px" $w={`${w}px`} $r="4px" />
            ))}
          </SkelTableRow>
        ))}
      </SkelCard>
    </SkelWrapper>
  )
}

// ── Payments sahifasi uchun skeleton ──
export function SkeletonPayments() {
  return (
    <SkelWrapper>
      {/* 3 summary cards */}
      <SkelSummaryGrid>
        {[1, 2, 3].map(i => (
          <SkelCard key={i}>
            <SkeletonBlock $h="13px" $w="55%" $r="4px" />
            <SkeletonBlock $h="28px" $w="70%" $r="6px" style={{ marginTop: 10 }} />
            <SkeletonBlock $h="11px" $w="40%" $r="4px" style={{ marginTop: 8 }} />
          </SkelCard>
        ))}
      </SkelSummaryGrid>

      {/* Debt section: title + search */}
      <SkelCard style={{ marginTop: 16 }}>
        <SkelRowBetween>
          <SkeletonBlock $h="16px" $w="35%" $r="5px" />
          <SkeletonBlock $h="38px" $w="220px" $r="8px" />
        </SkelRowBetween>

        {/* Table header */}
        <SkelTableHead style={{ marginTop: 14 }}>
          {[30, 140, 90, 80, 80, 90, 80].map((w, i) => (
            <SkeletonBlock key={i} $h="12px" $w={`${w}px`} $r="3px" />
          ))}
        </SkelTableHead>
        {/* 5 rows */}
        {Array.from({ length: 5 }).map((_, r) => (
          <SkelTableRow key={r}>
            {[30, 140, 90, 80, 80, 90, 80].map((w, i) => (
              <SkeletonBlock key={i} $h="13px" $w={`${w}px`} $r="4px" />
            ))}
          </SkelTableRow>
        ))}
      </SkelCard>

      {/* History section */}
      <SkelCard style={{ marginTop: 16 }}>
        <SkelRowBetween>
          <SkeletonBlock $h="16px" $w="30%" $r="5px" />
          <SkeletonBlock $h="38px" $w="200px" $r="8px" />
        </SkelRowBetween>
        <SkelTableHead style={{ marginTop: 14 }}>
          {[30, 140, 100, 90, 80, 80, 80].map((w, i) => (
            <SkeletonBlock key={i} $h="12px" $w={`${w}px`} $r="3px" />
          ))}
        </SkelTableHead>
        {Array.from({ length: 4 }).map((_, r) => (
          <SkelTableRow key={r}>
            {[30, 140, 100, 90, 80, 80, 80].map((w, i) => (
              <SkeletonBlock key={i} $h="13px" $w={`${w}px`} $r="4px" />
            ))}
          </SkelTableRow>
        ))}
      </SkelCard>
    </SkelWrapper>
  )
}

// ── Styles ──
const TicketRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px)  { grid-template-columns: 1fr; }
`
const TicketCard = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 14px;
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  display: flex;
  flex-direction: column;
  gap: 0;
`
const RowBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`
const TableHead = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #1e2235;
  margin-bottom: 4px;
`
const TableBodyRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #1a1d2e;
  &:last-child { border-bottom: none; }
`

// ── Students & Payments shared skeleton styles ──
const SkelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
`
const SkelCard = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  padding: 20px;
`
const SkelChipRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
const SkelTableHead = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #1e2235;
  background: #13161f;
`
const SkelTableRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #1a1d2e;
  &:last-child { border-bottom: none; }
`
const SkelSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`
const SkelRowBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`
