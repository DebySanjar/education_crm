import { createContext, useContext, useState, useCallback, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md'

const ToastContext = createContext(null)

const ICONS = {
  success: <MdCheckCircle />,
  error:   <MdError />,
  warning: <MdWarning />,
  info:    <MdInfo />,
}
const COLORS = {
  success: { bg: '#10b98118', border: '#10b98144', text: '#10b981' },
  error:   { bg: '#ff6b6b18', border: '#ff6b6b44', text: '#ff6b6b' },
  warning: { bg: '#f59e0b18', border: '#f59e0b44', text: '#f59e0b' },
  info:    { bg: '#00e0ff18', border: '#00e0ff44', text: '#00e0ff' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Convenience methods
  toast.success = (msg, d) => toast(msg, 'success', d)
  toast.error   = (msg, d) => toast(msg, 'error',   d ?? 6000)
  toast.warning = (msg, d) => toast(msg, 'warning', d)
  toast.info    = (msg, d) => toast(msg, 'info',    d)

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer>
        {toasts.map(t => (
          <ToastItem key={t.id} $type={t.type}>
            <ToastIcon $type={t.type}>{ICONS[t.type]}</ToastIcon>
            <ToastMsg>{t.message}</ToastMsg>
            <ToastClose onClick={() => remove(t.id)}><MdClose /></ToastClose>
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

/* ── Styles ── */
const slideIn = keyframes`
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`

const ToastContainer = styled.div`
  position: fixed; bottom: 24px; right: 24px;
  z-index: 9999;
  display: flex; flex-direction: column; gap: 10px;
  pointer-events: none;
  max-width: 360px; width: calc(100vw - 48px);
`
const ToastItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  background: ${({ $type }) => COLORS[$type].bg};
  border: 1px solid ${({ $type }) => COLORS[$type].border};
  border-left: 3px solid ${({ $type }) => COLORS[$type].text};
  border-radius: 10px; padding: 12px 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  animation: ${slideIn} 0.3s ease forwards;
  pointer-events: all;
`
const ToastIcon = styled.div`
  font-size: 1.2rem; flex-shrink: 0;
  color: ${({ $type }) => COLORS[$type].text};
  display: flex; align-items: center;
`
const ToastMsg = styled.div`
  flex: 1; font-size: 0.88rem; color: #e2e8f0; line-height: 1.4;
`
const ToastClose = styled.button`
  background: none; border: none; cursor: pointer; padding: 2px;
  color: #4a5568; font-size: 1rem; display: flex; align-items: center; flex-shrink: 0;
  &:hover { color: #e2e8f0; }
`
