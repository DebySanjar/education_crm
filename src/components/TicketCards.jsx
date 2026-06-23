import styled from 'styled-components'

export const TicketRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

export const TicketCard = styled.div`
  position: relative;
  background: linear-gradient(135deg, ${({ $bg1 }) => $bg1}, ${({ $bg2 }) => $bg2});
  padding: 22px 18px 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 130px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  /* dashed border between cards */
  &:not(:last-child) {
    border-right: 2px dashed rgba(0, 0, 0, 0.18);
  }

  &:hover { 
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
    z-index: 1;
  }

  @media (max-width: 1100px) {
    /* 2-column layout */
    &:nth-child(2) { border-right: none; }
    &:nth-child(3) { border-right: 2px dashed rgba(0,0,0,0.18); }
    &:nth-child(4) { border-right: none; }
    &:nth-child(3),
    &:nth-child(4) {
      border-top: 2px dashed rgba(0, 0, 0, 0.18);
    }
  }

  @media (max-width: 560px) {
    /* 1-column layout */
    border-right: none !important;
    border-top: none !important;
    &:not(:last-child) {
      border-bottom: 2px dashed rgba(0, 0, 0, 0.18);
    }
    min-height: 110px;
    padding: 18px 16px;
  }
`

export const TicketNotch = styled.div`
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0f1117;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side === 'left' ? 'left: -9px;' : 'right: -9px;'}
  z-index: 2;

  [data-theme='light'] & { background: #f5f0e8; }

  @media (max-width: 560px) {
    display: none;
  }
`

export const TicketDashes = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 0;
  border-left: 1px dashed rgba(255, 255, 255, 0.15);
  pointer-events: none;
`

export const TicketContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 1;
  flex: 1;
  min-width: 0;
`

export const TicketLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
`

export const TicketValue = styled.div`
  font-size: 1.7rem;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.72);
  line-height: 1.1;
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1200px) {
    font-size: 1.4rem;
  }
  @media (max-width: 560px) {
    font-size: 1.6rem;
  }
`

export const TicketSub = styled.div`
  font-size: 0.72rem;
  color: rgba(0, 0, 0, 0.42);
  font-weight: 500;
`

export const TicketIllustration = styled.div`
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  opacity: 0.85;
  margin-left: 8px;
  svg { width: 100%; height: 100%; }

  @media (max-width: 1200px) {
    width: 52px;
    height: 52px;
  }
  @media (max-width: 560px) {
    width: 56px;
    height: 56px;
  }
`
