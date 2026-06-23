import styled, { keyframes } from 'styled-components'
import { MdDownload } from 'react-icons/md'

/**
 * ExcelTicketBtn — Excel yuklab olish tugmasi
 * Props:
 *   onClick  — click handler
 *   label    — asosiy matn ("Excel", "15 kunlik" va h.k.)
 *   subLabel — kichik qo'shimcha matn (ixtiyoriy)
 */
export default function ExcelTicketBtn({ onClick, label = 'Excel', subLabel }) {
  return (
    <Btn onClick={onClick}>
      <IconWrap>
        <MdDownload />
      </IconWrap>
      <TextWrap>
        {subLabel && <Sub>{subLabel}</Sub>}
        <Main>{label}</Main>
      </TextWrap>
    </Btn>
  )
}

const pulse = keyframes`
  0%, 100% { box-shadow: 0 2px 0 #0a6640, 0 3px 8px rgba(16,185,129,0.25); }
  50%       { box-shadow: 0 2px 0 #0a6640, 0 3px 14px rgba(16,185,129,0.45); }
`

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px 7px 10px;
  background: #159b6fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 0 #0a6640, 0 3px 8px rgba(16,185,129,0.25);
  animation: ${pulse} 3s ease-in-out infinite;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #1e8b65ff;
    animation: none;
    box-shadow: 0 3px 0 #0a6640, 0 4px 14px rgba(16,185,129,0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 #0a6640, 0 2px 6px rgba(16,185,129,0.2);
  }
`

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(0,0,0,0.15);
  border-radius: 5px;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
`

const TextWrap = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
`

const Sub = styled.span`
  font-size: 0.62rem;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.3px;
`

const Main = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
`
