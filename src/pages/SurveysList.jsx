import React, { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { MdAdd, MdLink, MdDelete, MdEdit, MdVisibility } from 'react-icons/md'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`

const TitleBlock = styled.div`
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0 0 8px 0;
  }
  p {
    font-size: 0.9rem;
    color: #8892b0;
    margin: 0;
  }
`

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: #00e0ff18;
  color: #00e0ff;
  border: 1px solid #00e0ff44;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    background: #00e0ff28;
  }
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`

const Card = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  
  &:hover {
    border-color: #2d3748;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #8892b0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
  &:hover {
    border-color: #4a5568;
    color: #e2e8f0;
  }
  &.danger:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
  }
`

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #1e2235;
`

const Stat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #4a5568;
`

const StatValue = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: #00e0ff;
`

// iOS-style dialog styles
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
  border-radius: 16px;
  width: 100%;
  max-width: 340px;
  overflow: hidden;
`

const DialogTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  padding: 20px 20px 8px;
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

const DialogBtns = styled.div`
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
  &:hover:not(:disabled) { background: rgba(0,224,255,0.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
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
  &:hover:not(:disabled) { background: rgba(255,107,107,0.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const DialogDividerVertical = styled.div`
  width: 1px;
  background: #2d3748;
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(2px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Modal = styled.div`
  background: #13161f;
  border: 1px solid #2d3748;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const ModalTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #8892b0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:hover {
    border-color: #4a5568;
    color: #e2e8f0;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
`

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: #0f1117;
  color: #e2e8f0;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.15s;
  &:focus {
    border-color: #00e0ff;
  }
`

const Textarea = styled.textarea`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: #0f1117;
  color: #e2e8f0;
  font-size: 0.9rem;
  outline: none;
  min-height: 100px;
  resize: vertical;
  transition: all 0.15s;
  &:focus {
    border-color: #00e0ff;
  }
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
`

const CancelButton = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #8892b0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: #4a5568;
    color: #e2e8f0;
  }
`

const SubmitButton = styled.button`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  background: #00e0ff18;
  color: #00e0ff;
  border: 1px solid #00e0ff44;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #00e0ff28;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 0.95rem;
`

const FieldSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const FieldItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #0f1117;
  border: 1px solid #2d3748;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    border-color: #4a5568;
  }

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    font-size: 0.9rem;
    color: #cbd5e1;
  }
`

const SectionTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
  margin-bottom: 6px;
`

// Available field config
const availableFields = [
  { id: 'fullName', name: 'fullName', label: 'Ism va familiya', type: 'text', required: true },
  { id: 'age', name: 'age', label: 'Yosh', type: 'number', required: false },
  { id: 'phone', name: 'phone', label: 'Telefon raqam', type: 'tel', required: true },
  { id: 'address', name: 'address', label: 'Manzil', type: 'text', required: false },
  { id: 'gender', name: 'gender', label: 'Jinsi', type: 'select', options: ['Erkak', 'Ayol'], required: false },
  { id: 'additionalQuestions', name: 'additionalQuestions', label: 'Qo\'shimcha savollar', type: 'textarea', required: false }
]

const SurveysList = () => {
  const { surveys, addSurvey, deleteSurvey, updateSurvey } = useData()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFields, setSelectedFields] = useState(['fullName', 'phone']) // Default fields
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const copyLink = async (surveyId) => {
    const link = `${window.location.origin}/survey/${surveyId}`
    await navigator.clipboard.writeText(link)
    toast.success('Link nusxalandi!')
  }

  const openSurvey = (surveyId) => {
    const link = `${window.location.origin}/survey/${surveyId}`
    window.open(link, '_blank')
  }

  const openEditModal = (survey) => {
    setEditingSurvey(survey)
    setName(survey.name)
    setDescription(survey.description || '')
    setSelectedFields(survey.fields?.map(f => f.id || f.name) || ['fullName', 'phone'])
    setShowModal(true)
  }

  const toggleField = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId) 
        : [...prev, fieldId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    
    if (editingSurvey) {
      // Tahrirlash
      await updateSurvey(editingSurvey.id, {
        name,
        description,
        fields: availableFields.filter(f => selectedFields.includes(f.id))
      })
    } else {
      // Yangi yaratish
      await addSurvey({
        name,
        description,
        fields: availableFields.filter(f => selectedFields.includes(f.id))
      })
    }

    setName('')
    setDescription('')
    setSelectedFields(['fullName', 'phone'])
    setEditingSurvey(null)
    setShowModal(false)
  }

  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return
    setDeleting(true)
    await deleteSurvey(surveyToDelete.id)
    setDeleting(false)
    setShowDeleteDialog(false)
    setSurveyToDelete(null)
  }

  return (
    <Wrapper>
      <PageHeader>
        <TitleBlock>
          <h2>Sorovnomalar</h2>
          <p>O'quvchilar uchun ariza formalarini boshqaring</p>
        </TitleBlock>
        <Button onClick={() => {
          setEditingSurvey(null)
          setName('')
          setDescription('')
          setSelectedFields(['fullName', 'phone'])
          setShowModal(true)
        }}>
          <MdAdd size={18} />
          Yangi sorovnoma
        </Button>
      </PageHeader>

      {surveys.length === 0 ? (
        <EmptyState>Hali sorovnoma yo'q. Birinchi sorovnomani yaratish uchun yuqoridagi tugmani bosing!</EmptyState>
      ) : (
        <CardsGrid>
          {surveys.map(survey => (
            <Card key={survey.id}>
              <CardHeader>
                <CardTitle>{survey.name}</CardTitle>
                <CardActions>
                  <IconButton onClick={() => openSurvey(survey.id)} title="Formani ko'rish">
                    <MdVisibility size={16} />
                  </IconButton>
                  <IconButton onClick={() => openEditModal(survey)} title="Tahrirlash">
                    <MdEdit size={16} />
                  </IconButton>
                  <IconButton onClick={() => copyLink(survey.id)} title="Link nusxalash">
                    <MdLink size={16} />
                  </IconButton>
                  <IconButton className="danger" onClick={() => {
                    setSurveyToDelete(survey)
                    setShowDeleteDialog(true)
                  }} title="O'chirish">
                    <MdDelete size={16} />
                  </IconButton>
                </CardActions>
              </CardHeader>
              <CardDescription>{survey.description}</CardDescription>
              <StatsRow>
                <Stat>
                  <StatLabel>Ko'rilgan</StatLabel>
                  <StatValue>{survey.views || 0}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>To'ldirilgan</StatLabel>
                  <StatValue>{survey.submissions || 0}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Konversiya</StatLabel>
                  <StatValue>
                    {survey.views > 0 ? Math.round(((survey.submissions || 0) / survey.views) * 100) : 0}%
                  </StatValue>
                </Stat>
              </StatsRow>
            </Card>
          ))}
        </CardsGrid>
      )}

      {showModal && (
        <ModalOverlay onClick={(e) => e.target === e.target && setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingSurvey ? 'Sorovnomani tahrirlash' : 'Yangi sorovnoma yaratish'}
              </ModalTitle>
              <CloseButton onClick={() => {
                setShowModal(false)
                setEditingSurvey(null)
              }}>✕</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Sorovnoma nomi</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: 2024-yilgi qabul"
                  required
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Tavsif</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sorovnoma haqida qisqacha ma'lumot"
                />
              </FormGroup>

              <SectionTitle>Forma maydonlarini tanlang</SectionTitle>
              <FieldSelector>
                {availableFields.map(field => (
                  <FieldItem key={field.id}>
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.id)}
                      onChange={() => toggleField(field.id)}
                    />
                    <span>
                      {field.label} {field.required ? '(Majburiy)' : ''}
                    </span>
                  </FieldItem>
                ))}
              </FieldSelector>

              <ModalActions>
                <CancelButton type="button" onClick={() => setShowModal(false)}>
                  Bekor qilish
                </CancelButton>
                <SubmitButton type="submit">
                  Yaratish
                </SubmitButton>
              </ModalActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Delete Survey Confirmation Dialog (iOS-style) */}
      {showDeleteDialog && (
        <DialogOverlay onClick={() => !deleting && setShowDeleteDialog(false)}>
          <Dialog onClick={e => e.stopPropagation()}>
            <DialogTitle>O'chirishni tasdiqlang</DialogTitle>
            <DialogText>
              "{surveyToDelete?.name}" sorovnomasini o'chirishni xohlaysizmi? 
              Bu amalni qaytarib bo'lmaydi!
            </DialogText>
            <DialogDivider />
            <DialogBtns>
              <DialogCancel 
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Bekor qilish
              </DialogCancel>
              <DialogDividerVertical />
              <DialogConfirm 
                onClick={handleDeleteSurvey}
                disabled={deleting}
              >
                {deleting ? 'O\'chirilmoqda...' : 'O\'chirish'}
              </DialogConfirm>
            </DialogBtns>
          </Dialog>
        </DialogOverlay>
      )}
    </Wrapper>
  )
}

export default SurveysList
