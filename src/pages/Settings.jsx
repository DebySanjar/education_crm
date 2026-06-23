import { useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useOnboarding } from '../context/OnboardingContext'
import { MdSave, MdCheckCircle, MdTimer, MdDeleteForever, MdWarning, MdRefresh } from 'react-icons/md'

export default function Settings() {
  const {
    autoLogoutEnabled,
    setAutoLogoutEnabled,
    autoLogoutMinutes,
    setAutoLogoutMinutes,
    isSuperAdmin,
  } = useAuth()

  const { clearAllData } = useData()
  const { restartTour } = useOnboarding()
  const toast = useToast()

  const [tempAutoLogoutMinutes, setTempAutoLogoutMinutes] = useState(autoLogoutMinutes.toString())
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleSave = () => {
    setAutoLogoutMinutes(Number(tempAutoLogoutMinutes))
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleClearData = async () => {
    setClearing(true)
    const result = await clearAllData()
    setClearing(false)
    setShowClearDialog(false)
    // toast DataContext da chiqariladi — bu yerda qo'shimcha narsa kerak emas
  }

  return (
    <Wrapper>
      <PageHeader>
        <div>
          <h2>Sozlamalar</h2>
          <p>Tizim sozlamalari va foydalanuvchi ma'lumotlari</p>
        </div>
      </PageHeader>

      <Section>
        <SectionHeader>
          <MdRefresh style={{ color: '#00e0ff', fontSize: '1.3rem' }} />
          <SectionTitle>Onboarding turini qayta boshlash</SectionTitle>
        </SectionHeader>
        <SectionBody>
          <RestartTourButton onClick={restartTour}>
            <MdRefresh />
            Tourni qayta ko'rsatish
          </RestartTourButton>
        </SectionBody>
      </Section>

      {isSuperAdmin() && (
      <Section>
        <SectionHeader>
          <MdDeleteForever style={{ color: '#ff6b6b', fontSize: '1.3rem' }} />
          <SectionTitle>Ma'lumotlarni tozalash</SectionTitle>
        </SectionHeader>
        <SectionBody>
          <WarningBox>
            <MdWarning style={{ fontSize: '1.5rem', color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <WarningTitle>Diqqat!</WarningTitle>
              <WarningText>
                Bu amal barcha ma'lumotlarni (o'quvchilar, to'lovlar, davomat, chiqimlar) 
                butunlay o'chiradi. Bu amalni qaytarib bo'lmaydi!
              </WarningText>
            </div>
          </WarningBox>
          
          <ClearButton onClick={() => setShowClearDialog(true)}>
            <MdDeleteForever />
            Barcha ma'lumotlarni tozalash
          </ClearButton>
        </SectionBody>
      </Section>
      )}

      <Section>
        <SectionHeader>
          <MdTimer style={{ color: '#f59e0b', fontSize: '1.3rem' }} />
          <SectionTitle>Avtomatik bloklash</SectionTitle>
        </SectionHeader>
        <SectionBody>
          <FormRow>
            <label>Faollashtirish</label>
            <Toggle
              type="button"
              $active={autoLogoutEnabled}
              onClick={() => setAutoLogoutEnabled(!autoLogoutEnabled)}
            >
              <ToggleDot $active={autoLogoutEnabled} />
            </Toggle>
          </FormRow>

          {autoLogoutEnabled && (
            <FormRow>
              <label>Bloklash vaqti (daqiqa)</label>
              <input
                type="number"
                min="1"
                value={tempAutoLogoutMinutes}
                onChange={(e) => setTempAutoLogoutMinutes(e.target.value)}
                style={{ width: '100px' }}
              />
            </FormRow>
          )}
        </SectionBody>
      </Section>

      <SaveRow>
        <SaveButton onClick={handleSave}>
          {saveSuccess ? (
            <>
              <MdCheckCircle />
              Saqlandi!
            </>
          ) : (
            <>
              <MdSave />
              Saqlash
            </>
          )}
        </SaveButton>
      </SaveRow>

      {/* Clear Data Confirmation Dialog */}
      {showClearDialog && (
        <DialogOverlay onClick={() => !clearing && setShowClearDialog(false)}>
          <Dialog onClick={e => e.stopPropagation()}>
            <DialogIcon>
              <MdWarning />
            </DialogIcon>
            <DialogTitle>Ma'lumotlarni tozalash</DialogTitle>
            <DialogText>
              Barcha ma'lumotlar (o'quvchilar, to'lovlar, davomat, chiqimlar) 
              butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi!
            </DialogText>
            <DialogText style={{ fontWeight: 600, color: '#ff6b6b' }}>
              Davom etishni xohlaysizmi?
            </DialogText>
            <DialogBtns>
              <DialogCancel 
                onClick={() => setShowClearDialog(false)}
                disabled={clearing}
              >
                Bekor qilish
              </DialogCancel>
              <DialogConfirm 
                onClick={handleClearData}
                disabled={clearing}
              >
                {clearing ? 'Tozalanmoqda...' : 'Ha, tozalash'}
              </DialogConfirm>
            </DialogBtns>
          </Dialog>
        </DialogOverlay>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`display: flex; flex-direction: column; gap: 24px;`

const PageHeader = styled.div`
  h2 { font-size: 1.4rem; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
  p { font-size: 0.88rem; color: #8892b0; }
`

const Section = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  overflow: hidden;
`

const SectionHeader = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #1e2235;
  background: #0f1117;
`

const SectionTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
`

const SectionBody = styled.div`
  padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
`

const FormRow = styled.div`
  display: flex; align-items: center; gap: 16px;
  label {
    font-size: 0.86rem;
    color: #8892b0;
    font-weight: 500;
    width: 180px;
    flex-shrink: 0;
  }
  input {
    background: #0f1117;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 8px 12px;
    color: #e2e8f0;
    font-size: 0.9rem;
    outline: none;
    flex: 1;
    &:focus { border-color: #00e0ff; }
  }
`

const Toggle = styled.button`
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background: ${({ $active }) => $active ? '#00e0ff28' : '#2d3748'};
  border: 1px solid ${({ $active }) => $active ? '#00e0ff44' : '#2d3748'};
  display: flex; align-items: center;
  padding: 3px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
`

const ToggleDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'};
  transform: translateX(${({ $active }) => $active ? '24px' : '0'});
  transition: all 0.2s;
`

const SaveRow = styled.div`
  display: flex; justify-content: flex-end;
`

const SaveButton = styled.button`
  display: flex; align-items: center; gap: 8px;
  background: #00e0ff18;
  border: 1px solid #00e0ff44;
  color: #00e0ff;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.15s;
  &:hover { background: #00e0ff28; }
`

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 10px;
  padding: 16px;
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

const RestartTourButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #00e0ff18;
  border: 1px solid #00e0ff44;
  color: #00e0ff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.15s;
  &:hover { background: #00e0ff28; }
  svg { font-size: 1.2rem; }
`

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.35);
  color: #ff6b6b;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.15s;
  &:hover { background: rgba(255, 107, 107, 0.22); }
  svg { font-size: 1.2rem; }
`

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(2px);
`

const Dialog = styled.div`
  background: #13161f;
  border: 1px solid #2d3748;
  border-radius: 16px;
  padding: 32px 28px 24px;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
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
  margin-bottom: 6px;
`

const DialogTitle = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #e2e8f0;
`

const DialogText = styled.div`
  font-size: 0.88rem;
  color: #8892b0;
  text-align: center;
  line-height: 1.5;
`

const DialogBtns = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
`

const DialogCancel = styled.button`
  flex: 1;
  padding: 11px;
  background: #1a1d2e;
  border: 1px solid #2d3748;
  color: #8892b0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
  &:hover:not(:disabled) { color: #e2e8f0; border-color: #4a5568; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const DialogConfirm = styled.button`
  flex: 1;
  padding: 11px;
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.35);
  color: #ff6b6b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.15s;
  &:hover:not(:disabled) { background: rgba(255,107,107,0.22); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`
