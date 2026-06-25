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
  MdPowerSettingsNew,
  MdDashboard
} from 'react-icons/md'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  h2 {
    font-size: 1.4rem;
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
  border-radius: 12px;
  overflow: hidden;
`

const SectionHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #1e2235;
  display: flex;
  align-items: center;
  gap: 10px;
  svg {
    color: #00e0ff;
    font-size: 1.2rem;
  }
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }
`

const SectionBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  label {
    font-size: 0.9rem;
    color: #cbd5e1;
    font-weight: 500;
  }
`

const Input = styled.input`
  background: #0f1117;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-size: 0.9rem;
  outline: none;
  width: 140px;
  &:focus {
    border-color: #00e0ff;
  }
`

const ToggleButton = styled.button`
  width: 56px;
  height: 32px;
  border-radius: 16px;
  background: ${props => props.$active ? '#00e0ff' : '#2d3748'};
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  &::after {
    content: '';
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #fff;
    top: 3px;
    left: ${props => props.$active ? '27px' : '3px'};
    transition: left 0.2s;
  }
`

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid ${props => props.$success ? '#10b981' : '#00e0ff'};
  background: transparent;
  color: ${props => props.$success ? '#10b981' : '#00e0ff'};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-end;
  &:hover {
    background: ${props => props.$success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 224, 255, 0.08)'};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  svg {
    font-size: 1.1rem;
  }
`

const DangerButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #ff6b6b;
  background: transparent;
  color: #ff6b6b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover {
    background: rgba(255, 107, 107, 0.08);
  }
  svg {
    font-size: 1.1rem;
  }
`

const WarningBox = styled.div`
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  svg {
    color: #f59e0b;
    font-size: 1.3rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .title {
    font-size: 0.88rem;
    font-weight: 600;
    color: #f59e0b;
    margin-bottom: 4px;
  }
  .text {
    font-size: 0.85rem;
    color: #8892b0;
    line-height: 1.5;
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
    await clearAllData()
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
          <h3>Avtomatik bloklash</h3>
        </SectionHeader>
        <SectionBody>
          <SettingRow>
            <label>Faollashtirish</label>
            <ToggleButton
              $active={autoLogoutEnabled}
              onClick={() => setAutoLogoutEnabled(!autoLogoutEnabled)}
            />
          </SettingRow>

          {autoLogoutEnabled && (
            <SettingRow>
              <label>Bloklash vaqti (daqiqa)</label>
              <Input
                type="number"
                min="1"
                value={tempAutoLogoutMinutes}
                onChange={(e) => setTempAutoLogoutMinutes(e.target.value)}
              />
            </SettingRow>
          )}

          <Button onClick={handleSave} $success={saveSuccess}>
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
          </Button>
        </SectionBody>
      </Section>



      {isSuperAdmin() && (
        <Section>
          <SectionHeader>
            <MdDeleteForever style={{ color: '#ff6b6b' }} />
            <h3>Ma'lumotlarni tozalash</h3>
          </SectionHeader>
          <SectionBody>
            <WarningBox>
              <MdWarning />
              <div>
                <div className="title">Diqqat!</div>
                <div className="text">
                  Bu amal barcha ma'lumotlarni (o'quvchilar, to'lovlar, davomat, chiqimlar) 
                  butunlay o'chiradi. Bu amalni qaytarib bo'lmaydi!
                </div>
              </div>
            </WarningBox>

            <DangerButton onClick={() => setShowClearDialog(true)}>
              <MdDeleteForever />
              Barcha ma'lumotlarni tozalash
            </DangerButton>
          </SectionBody>
        </Section>
      )}

      <Section>
        <SectionHeader>
          <MdDashboard />
          <h3>Hisobdan chiqish</h3>
        </SectionHeader>
        <SectionBody>
          <DangerButton onClick={() => setShowLogoutDialog(true)}>
            <MdPowerSettingsNew />
            Tizimdan chiqish
          </DangerButton>
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
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Dialog = styled.div`
  background: #1c1f2e;
  border-radius: 12px;
  width: 100%;
  max-width: 340px;
  overflow: hidden;
`

const DialogIcon = styled.div`
  font-size: 2.2rem;
  color: #ff6b6b;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto 12px;
`

const DialogTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  padding: 0 20px 8px;
`

const DialogText = styled.div`
  font-size: 0.88rem;
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
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: rgba(0,224,255,0.06);
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
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: rgba(255,107,107,0.06);
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
