import React, { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { MdAdd, MdLink, MdDelete } from 'react-icons/md'

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
  background: #0f1117;
  border: 2px solid #1e2235;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
  &:hover {
    border-color: #334155;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.3);
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

const LinkInput = styled.div`
  display: flex;
  gap: 8px;
  background: #0f1117;
  border: 1px solid #1e2235;
  padding: 10px 14px;
  border-radius: 8px;
  align-items: center;
`

const LinkText = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: #e2e8f0;
  font-size: 0.85rem;
  outline: none;
`

const CopyButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #00e0ff44;
  background: #00e0ff18;
  color: #00e0ff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #00e0ff28;
  }
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

const SurveysList = () => {
  const { surveys, addSurvey, deleteSurvey } = useData()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const copyLink = (surveyId) => {
    const link = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(link)
    alert('Link nusxalandi!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    await addSurvey({
      name,
      description,
      fields: [
        { name: 'firstName', label: 'Ism', type: 'text', required: true },
        { name: 'lastName', label: 'Familiya', type: 'text', required: true },
        { name: 'phone', label: 'Telefon', type: 'tel', required: true }
      ]
    })

    setName('')
    setDescription('')
    setShowModal(false)
  }

  return (
    <Wrapper>
      <PageHeader>
        <TitleBlock>
          <h2>Sorovnomalar</h2>
          <p>O'quvchilar uchun ariza formalarini boshqaring</p>
        </TitleBlock>
        <Button onClick={() => setShowModal(true)}>
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
                  <IconButton onClick={() => copyLink(survey.id)} title="Link nusxalash">
                    <MdLink size={16} />
                  </IconButton>
                  <IconButton className="danger" onClick={() => deleteSurvey(survey.id)} title="O'chirish">
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
              <LinkInput>
                <LinkText value={`${window.location.origin}/survey/${survey.id}`} readOnly />
                <CopyButton onClick={() => copyLink(survey.id)}>Nusxa olish</CopyButton>
              </LinkInput>
            </Card>
          ))}
        </CardsGrid>
      )}

      {showModal && (
        <ModalOverlay onClick={(e) => e.target === e.target && setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Yangi sorovnoma yaratish</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>✕</CloseButton>
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
    </Wrapper>
  )
}

export default SurveysList
