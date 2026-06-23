import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoImg from '../img/logoga.png'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      navigate('/')
    } else {
      const msgs = {
        'auth/invalid-credential': "Email yoki parol noto'g'ri!",
        'auth/user-not-found': "Bunday foydalanuvchi topilmadi!",
        'auth/wrong-password': "Parol noto'g'ri!",
        'auth/too-many-requests': "Ko'p urinish! Keyinroq qayta urinib ko'ring.",
      }
      setError(msgs[result.error] || "Xatolik yuz berdi. Qayta urinib ko'ring.")
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      {/* Animated background */}
      <BgCanvas>
        {Array.from({ length: 18 }).map((_, i) => (
          <Particle key={i} $i={i} />
        ))}
        <GridLines />
      </BgCanvas>

      <Card>
        {/* Logo */}
        <LogoRow>
          <LogoImage src={logoImg} alt="EXPRESS TEST Logo" />
        </LogoRow>

        <Subtitle>Tizimga kirish</Subtitle>

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <FieldLabel>EMAIL</FieldLabel>
          <InputContainer>
            <ShadowInput />
            <InputButton type="button" tabIndex={-1}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="20px" height="20px">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </InputButton>
            <InputSearch
              type="email"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </InputContainer>

          {/* Password input */}
          <FieldLabel style={{ marginTop: 28 }}>PASSWORD</FieldLabel>
          <InputContainer>
            <ShadowInput />
            <InputButton type="button" tabIndex={-1}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="20px" height="20px">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </InputButton>
            <InputSearch
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <EyeButton
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              title={showPassword ? 'Yashirish' : 'Ko\'rsatish'}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </EyeButton>
          </InputContainer>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <LoginBtn type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'KIRISH'}
          </LoginBtn>
        </form>
      </Card>
    </PageWrapper>
  )
}


const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
`

const gridMove = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(60px); }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 10px 10px 0 #000, 0 0 0 0 rgba(0,224,255,0.4); }
  50% { box-shadow: 10px 10px 0 #000, 0 0 0 8px rgba(0,224,255,0); }
`

/* ── Page ── */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0d14;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
`

const BgCanvas = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const GridLines = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,224,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,224,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: ${gridMove} 4s linear infinite;
`

const Particle = styled.div`
  position: absolute;
  width: ${({ $i }) => 4 + ($i % 5) * 3}px;
  height: ${({ $i }) => 4 + ($i % 5) * 3}px;
  border-radius: 50%;
  background: ${({ $i }) =>
    $i % 3 === 0 ? 'rgba(0,224,255,0.5)' :
    $i % 3 === 1 ? 'rgba(124,58,237,0.5)' :
    'rgba(16,185,129,0.4)'};
  left: ${({ $i }) => ($i * 37 + 5) % 95}%;
  top: ${({ $i }) => ($i * 53 + 10) % 90}%;
  animation: ${float} ${({ $i }) => 4 + ($i % 4) * 1.5}s ease-in-out infinite;
  animation-delay: ${({ $i }) => ($i * 0.4) % 3}s;
  filter: blur(1px);
`

/* ── Card ── */
const Card = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 20px;
  padding: 40px 36px 32px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 10;
  animation: ${fadeIn} 0.5s ease;
  box-shadow: 0 0 60px rgba(0,224,255,0.06), 0 24px 48px rgba(0,0,0,0.4);

  @media (max-width: 480px) { padding: 28px 20px 24px; }
`

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`

const LogoImage = styled.img`
  height: 80px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 224, 255, 0.3));
`

const Subtitle = styled.div`
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
`

/* ── Input component styles ── */
const FieldLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #00e0ff;
  letter-spacing: 2px;
  margin-bottom: 8px;
`

const InputContainer = styled.div`
  position: relative;
  background: #f0f0f0;
  padding: 14px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  border: 3px solid #000;
  width: 100%;
  transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
  transform: rotateX(8deg) rotateY(-6deg);
  perspective: 1000px;
  box-shadow: 8px 8px 0 #000;
  animation: ${pulse} 3s ease-in-out infinite;

  &:focus-within {
    transform: rotateX(4deg) rotateY(1deg) scale(1.03);
    box-shadow: 20px 20px 0 -4px #00e0ff, 20px 20px 0 0 #000;
    animation: none;
  }

  &::before {
    content: attr(data-label);
    display: none;
  }
`

const ShadowInput = styled.div`
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
  transform: translateZ(-50px);
  background: linear-gradient(45deg, rgba(0,224,255,0.3) 0%, rgba(124,58,237,0.15) 100%);
  filter: blur(20px);
`

const InputButton = styled.button`
  cursor: default;
  border: 2px solid #000;
  background: #00e0ff;
  transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  transform: translateZ(20px);
  position: relative;
  z-index: 3;
  flex-shrink: 0;

  svg { fill: #000; width: 20px; height: 20px; }
`

const EyeButton = styled.button`
  cursor: pointer;
  border: 2px solid #000;
  background: #f0f0f0;
  transition: all 200ms ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  transform: translateZ(20px);
  position: relative;
  z-index: 3;
  flex-shrink: 0;
  margin-left: auto;

  svg { fill: #000; width: 20px; height: 20px; }

  &:hover {
    background: #00e0ff;
    transform: translateZ(20px) scale(1.08);
  }
  &:active { transform: translateZ(20px) scale(0.95); }
`

const InputSearch = styled.input`
  width: 100%;
  outline: none;
  border: 2px solid #000;
  padding: 10px 12px;
  font-size: 15px;
  background: #fff;
  color: #000;
  transform: translateZ(10px);
  transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  z-index: 3;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  letter-spacing: -0.5px;

  &::placeholder {
    color: #666;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
  }

  &:hover, &:focus {
    background: #f0f8ff;
    transform: translateZ(20px) translateX(-3px) translateY(-3px);
    box-shadow: 4px 4px 0 0 #000;
  }
`

const ErrorMsg = styled.div`
  margin-top: 16px;
  color: #ff6b6b;
  font-size: 0.82rem;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.3);
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
`

const LoginBtn = styled.button`
  margin-top: 28px;
  width: 100%;
  padding: 14px;
  background: #00e0ff;
  color: #000;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 3px;
  border: 3px solid #000;
  cursor: pointer;
  box-shadow: 6px 6px 0 #000;
  transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateX(-3px) translateY(-3px);
    box-shadow: 10px 10px 0 #000;
    background: #00c8e8;
  }

  &:active:not(:disabled) {
    transform: translateX(2px) translateY(2px);
    box-shadow: 3px 3px 0 #000;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 3px solid rgba(0,0,0,0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`

