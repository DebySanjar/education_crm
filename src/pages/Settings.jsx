import { useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import {
  MdSave,
  MdCheckCircle,
  MdTimer,
  MdDeleteForever,
  MdWarning,
  MdKeyboardArrowRight,
  MdPowerSettingsNew,
  MdDashboard
} from 'react-icons/md'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
`

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0;
  }
  p {
    font-size: 0.9rem;
    color: #8892b0;
    margin: 0;
  }
`

const Section = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #1e2235;
  background: #0f1117;
  svg {
    font-size: 1.3rem;
    color: #00e0ff;
  }
`

const SectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
`

const SectionBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const FormRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #cbd5e1;
  flex: 1;
  min-width: 160px;
`

const Input = styled.input`
  background: #0f1117;
  border: 1px solid #2d3748;
  border-radius: 10px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-size: 0.95rem;
  outline: none;
  width: 140px;
  transition: all 0.15s;
  &:focus {
    border-color: #00e0ff;
    box-shadow: 0 0 0 3px rgba(0, 224, 255, 0.1);
  }
`

const ToggleWrapper = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 24px;
  background: ${props => props.$active ? '#00e0ff22' : '#2d3748'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
`

const ToggleDot = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$active ? '#00e0ff' : '#64748b'};
  transform: translateX(${props => props.$active ? '28px' : '0'});
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 0 12px rgba(0,224,255,0.4)' : 'none'};
`

const ToggleTrack = styled.div`
  width: 56px;
  height: 32px;
  border-radius: 16px;
  background: transparent;
  position: relative;
`

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px;
  svg {
    color: #f59e0b;
    font-size: 1.5rem;
    flex-shrink: 0;
  }
`

const WarningTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 4px;
`

const WarningText = styled.div`
  font-size: 0.85rem;
  color: #8892b0;
  line-height: 1.5;
`

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 107, 0.4);
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: rgba(255, 107, 107, 0.2);
    border-color: #ff6b6b;
  }
  svg {
    font-size: 1.1rem;
  }
`

const SaveRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  border: none;
  background: ${props => props.$success ? '#10b98122' : '#00e0ff22'};
  color: ${props => props.$success ? '#10b981' : '#00e0ff'};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid ${props => props.$success ? '#10b98144' : '#00e0ff44'};
  &:hover:not(:disabled) {
    background: ${props => props.$success ? '#10b98133' : '#00e0ff33'};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  svg {
    font-size: 1.1rem;
  }
`

const DangerZone = styled.div`
  margin-top: 8px;
`

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  color: #ff6b6b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: rgba(255,107,107,0.08);
    border-color: rgba(255,107,107,0.4);
  }
  svg {
    font-size: 1.2rem;
  }
`

export default function Settings() {
  const {
    autoLogoutEnabled,
    setAutoLogoutEnabled,
    autoLogoutMinutes,
    setAutoLogoutMinutes,
    isSuperAdmin,
    logout
  } = useAuth()

  const { clearAllData } = useData()
  const toast = useToast()

  const [tempAutoLogoutMinutes, setTempAutoLogoutMinutes] = useState(autoLogoutMinutes.toString())
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleSave = () => {
    setAutoLogoutMinutes(Number(tempAutoLogoutMinutes))
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    toast.success("Sozlamalar saqlandi!")
  }

  const handleClearData = async () => {
    setClearing(true)
    const result = await clearAllData()
    setClearing(false)
    setShowClearDialog(false)
  }

  const handleLogout = () => {
    setShowLogoutDialog(false)
    logout()
  }

  return (
    <Wrapper>
      <PageHeader>
        <h2>Sozlamalar</h2>
        <p>Tizim sozlamalari va asosiy funktsiyalar</p>
      </PageHeader>

      <Section>
        <SectionHeader>
          <MdTimer />
          <SectionTitle>Avtomatik bloklash</SectionTitle>
        </SectionHeader>
        <SectionBody>
          <FormRow>
            <Label>Faollashtirish</Label>
            <ToggleWrapper
              $active={autoLogoutEnabled}
              onClick={() => setAutoLogoutEnabled(!autoLogoutEnabled)}
            >
              <ToggleTrack>
                <ToggleDot $active={autoLogoutEnabled} />
              </ToggleTrack>
            </ToggleWrapper>
          </FormRow>

          {autoLogoutEnabled && (
            <FormRow>
              <Label>Bloklash vaqti (daqiqa)</Label>
              <Input
                type="number"
                min="1"
                value={tempAutoLogoutMinutes}
                onChange={(e) => setTempAutoLogoutMinutes(e.target.value)}
              />
            </FormRow>
          )}

          <SaveRow>
            <SaveButton
              $success={saveSuccess}
              onClick={handleSave}
            >
              {saveSuccess ? (
                <>
                  <MdCheckCircle />
                  Saqlandi
                </>
              ) : (
                <>
                  <MdSave />
                  Saqlash
                </>
              )}
            </SaveButton>
          </SaveRow>
        </SectionBody>
      </Section>

      {isSuperAdmin() && (
        <Section>
          <SectionHeader>
            <MdDeleteForever style={{ color: '#ff6b6b' }} />
            <SectionTitle>Ma'lumotlarni tozalash</SectionTitle>
          </SectionHeader>
          <SectionBody>
            <WarningBox>
              <MdWarning />
              <div>
                <WarningTitle>Diqqat!</WarningTitle>
                <WarningText>
                  Bu amal barcha ma'lumotlarni (o'quvchilar, to'lovlar, davomat, chiqimlar) 
                  butunlay o'chiradi. Bu amalni qaytarib bo'lmaydi!
                </WarningText>
              </div>
            </WarningBox>

            <DangerZone>
              <DangerButton onClick={() => setShowClearDialog(true)}>
                <MdDeleteForever />
                Barcha ma'lumotlarni tozalash
              </DangerButton>
            </DangerZone>
          </SectionBody>
        </Section>
      )}

      <Section>
        <SectionHeader>
          <MdDashboard />
          <SectionTitle>Hisobdan chiqish</SectionTitle>
        </SectionHeader>
        <SectionBody>
          <LogoutButton onClick={() => setShowLogoutDialog(true)}>
            <MdPowerSettingsNew />
            Tizimdan chiqish
          </LogoutButton>
        </SectionBody>
      </Section>

      {/* Clear Data Confirmation Dialog */}
      {showClearDialog && (
        <DialogOverlay onClick={() => !clearing && setShowClearDialog(false)}>
          <Dialog onClick={e => e.stopPropagation()}>
            <DialogIcon>
              <MdWarning />
            </DialogIcon>
            <DialogTitle>Ma'lumotlarni tozalash</DialogTitle>
            <DialogText>
              Barcha ma'lumotlarni o'chirishni xohlaysizmi? 
              Bu amalni qaytarib bo'lmaydi!
            </DialogText>
            <DialogDivider />
            <DialogButtons>
              <DialogCancel
                onClick={() => setShowClearDialog(false)}
                disabled={clearing}
              >
                Bekor qilish
              </DialogCancel>
              <DialogDividerVertical />
              <DialogConfirm
                onClick={handleClearData}
                disabled={clearing}
              >
                {clearing ? 'Tozalanmoqda' : 'Ha, tozalash'}
              </DialogConfirm>
            </DialogButtons>
          </Dialog>
        </DialogOverlay>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <DialogOverlay onClick={() => setShowLogoutDialog(false)}>
          <Dialog onClick={e => e.stopPropagation()}>
            <DialogTitle>Hisobdan chiqish</DialogTitle>
            <DialogText>
              Tizimdan chiqishni xohlaysizmi?
            </DialogText>
            <DialogDivider />
            <DialogButtons>
              <DialogCancel onClick={() => setShowLogoutDialog(false)}>
                Bekor qilish
              </DialogCancel>
              <DialogDividerVertical />
              <DialogConfirm onClick={handleLogout}>
                Chiqish
              </DialogConfirm>
            </DialogButtons>
          </Dialog>
        </DialogOverlay>
      )}
    </Wrapper>
  )
}

// Reusable dialog components
const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Dialog = styled.div`
  background: #1c1f2e;
  border-radius: 16px;
  width: 100%;
  max-width: 340px;
  overflow: hidden;
`

const DialogIcon = styled.div`
  font-size: 2.5rem;
  color: #ff6b6b;
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.25);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto 12px;
`

const DialogTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  padding: 0 20px 8px;
`

const DialogText = styled.div`
  font-size: 0.9rem;
  color: #8892b0;
  text-align: center;
  padding: 0 20px 16px;
  line-height: 1.5;
`

const DialogDivider = styled.div`
  height: 1px;
  background: #2d3748;
`

const DialogButtons = styled.div`
  display: flex;
  width: 100%;
`

const DialogCancel = styled.button`
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  color: #00e0ff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: rgba(0,224,255,0.08);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const DialogConfirm = styled.button`
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: rgba(255,107,107,0.08);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const DialogDividerVertical = styled.div`
  width: 1px;
  background: #2d3748;
`
