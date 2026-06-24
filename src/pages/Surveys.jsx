import React, { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { MdAdd, MdLink, MdDelete, MdEdit, MdVisibility, MdSend } from 'react-icons/md'
import { motion } from 'framer-motion'

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
  gap: 16px;
`

const TitleBlock = styled.div`
  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0 0 8px 0;
  }
  p {
    font-size: 0.95rem;
    color: #94a3b8;
    margin: 0;
  }
`

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 224, 255, 0.4);
  }
`

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  background: #13161f;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid #1e2235;
`

const Tab = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#1a1d2e' : 'transparent'};
  color: ${props => props.$active ? '#00e0ff' : '#94a3b8'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    color: #e2e8f0;
  }
`

// Tab 1: Surveys Cards
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`

const Card = styled(motion.div)`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
  &:hover {
    border-color: #334155;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:hover {
    border-color: #4a5568;
    color: #e2e8f0;
  }
  &.$danger:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
  }
`

const CardDescription = styled.p`
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
`

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
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
  font-size: 0.85rem;
  color: #64748b;
`

const StatValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #00e0ff;
`

const LinkInput = styled.div`
  display: flex;
  gap: 8px;
  background: #0f1117;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  align-items: center;
`

const LinkText = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: #e2e8f0;
  font-size: 0.9rem;
  outline: none;
`

const CopyButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #00e0ff44;
  background: #00e0ff18;
  color: #00e0ff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #00e0ff28;
  }
`

// Tab 2: Submissions Table
const TableWrapper = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 16px;
  overflow: hidden;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #0f1117;
  border-bottom: 1px solid #1e2235;
`

const Td = styled.td`
  padding: 16px 20px;
  font-size: 0.95rem;
  color: #cbd5e1;
  border-bottom: 1px solid #1e2235;
`

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
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
  padding: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const ModalTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
`

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #94a3b8;
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
  gap: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #cbd5e1;
`

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: #0f1117;
  color: #e2e8f0;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.15s;
  &:focus {
    border-color: #00e0ff;
  }
`

const Textarea = styled.textarea`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: #0f1117;
  color: #e2e8f0;
  font-size: 0.95rem;
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
  gap: 12px;
  margin-top: 24px;
`

const CancelButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: #4a5568;
    color: #e2e8f0;
  }
`

const SubmitButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 224, 255, 0.4);
  }
`

const SurveysPage = () => {
  const { surveys, addSurvey, deleteSurvey, submissions } = useData()
  const [activeTab, setActiveTab] = useState('surveys') // 'surveys' or 'submissions'
  const [selectedSurvey, setSelectedSurvey] = useState(null) // for submissions tab
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', fields: [] })

  const handleAddSurvey = async (e) => {
    e.preventDefault()
    if (!formData.name) return
    
    // Default fields: name, surname, phone
    const defaultFields = [
      { name: 'firstName', label: 'Ism', type: 'text', required: true },
      { name: 'lastName', label: 'Familiya', type: 'text', required: true },
      { name: 'phone', label: 'Telefon', type: 'tel', required: true }
    ]
    
    await addSurvey({ 
      ...formData, 
      fields: defaultFields 
    })
    
    setFormData({ name: '', description: '', fields: [] })
    setIsModalOpen(false)
  }

  const copyLink = (surveyId) => {
    const link = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(link)
    alert('Link nusxalandi!')
  }

  const filteredSubmissions = selectedSurvey 
    ? submissions.filter(s => s.surveyId === selectedSurvey) 
    : submissions

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <Wrapper>
      <PageHeader>
        <TitleBlock>
          <h2>Sorovnomalar</h2>
          <p>O'quvchilar uchun ariza va ro'yxatdan o'tish formalarini boshqaring</p>
        </TitleBlock>
        <Button onClick={() => setIsModalOpen(true)}>
          <MdAdd size={20} />
          Yangi sorovnoma
        </Button>
      </PageHeader>

      <TabsContainer>
        <Tab $active={activeTab === 'surveys'} onClick={() => setActiveTab('surveys')}>
          Sorovnomalar
        </Tab>
        <Tab $active={activeTab === 'submissions'} onClick={() => setActiveTab('submissions')}>
          Arizachilar
        </Tab>
      </TabsContainer>

      {activeTab === 'surveys' && (
        <CardsGrid as={motion.div} variants={containerVariants} initial="hidden" animate="show">
          {surveys.map(survey => (
            <Card key={survey.id} variants={itemVariants}>
              <CardHeader>
                <CardTitle>{survey.name}</CardTitle>
                <CardActions>
                  <IconButton onClick={() => copyLink(survey.id)} title="Linkni nusxalash">
                    <MdLink size={18} />
                  </IconButton>
                  <IconButton className="$danger" onClick={() => deleteSurvey(survey.id)} title="O'chirish">
                    <MdDelete size={18} />
                  </IconButton>
                </CardActions>
              </CardHeader>
              <CardDescription>{survey.description}</CardDescription>
              <StatsRow>
                <Stat>
                  <StatLabel>Ko'rilgan</StatLabel>
                  <StatValue>{survey.views}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>To'ldirilgan</StatLabel>
                  <StatValue>{survey.submissions}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Konversiya</StatLabel>
                  <StatValue>
                    {survey.views > 0 ? Math.round((survey.submissions / survey.views) * 100) : 0}%
                  </StatValue>
                </Stat>
              </StatsRow>
              <LinkInput>
                <LinkText 
                  value={`${window.location.origin}/survey/${survey.id}`} 
                  readOnly
                />
                <CopyButton onClick={() => copyLink(survey.id)}>
                  Nusxa olish
                </CopyButton>
              </LinkInput>
            </Card>
          ))}
          {surveys.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              Hali sorovnoma yo'q. Birinchi sorovnomani yaratish uchun yuqoridagi tugmani bosing!
            </div>
          )}
        </CardsGrid>
      )}

      {activeTab === 'submissions' && (
        <TableWrapper>
          {surveys.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2235', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tab $active={!selectedSurvey} onClick={() => setSelectedSurvey(null)}>
                Barcha arizalar
              </Tab>
              {surveys.map(survey => (
                <Tab 
                  key={survey.id} 
                  $active={selectedSurvey === survey.id} 
                  onClick={() => setSelectedSurvey(survey.id)}
                >
                  {survey.name}
                </Tab>
              ))}
            </div>
          )}
          <Table>
            <thead>
              <tr>
                <Th>Ism</Th>
                <Th>Familiya</Th>
                <Th>Telefon</Th>
                <Th>Sorovnoma</Th>
                <Th>Vaqt</Th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(submission => (
                <tr key={submission.id}>
                  <Td>{submission.firstName}</Td>
                  <Td>{submission.lastName}</Td>
                  <Td>{submission.phone}</Td>
                  <Td>{surveys.find(s => s.id === submission.surveyId)?.name || 'Noma\'lum'}</Td>
                  <Td>
                    {submission.createdAt?.toDate?.().toLocaleDateString('uz-UZ') || 'Noma\'lum'}
                  </Td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <Td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    Hali ariza yo'q
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {/* Add Survey Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={(e) => e.target === e.target && setIsModalOpen(false)}>
          <Modal as={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <ModalHeader>
              <ModalTitle>Yangi sorovnoma yaratish</ModalTitle>
              <CloseButton onClick={() => setIsModalOpen(false)}>✕</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleAddSurvey}>
              <FormGroup>
                <Label>Sorovnoma nomi</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: 2024-yilgi qabul"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Tavsif</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sorovnoma haqida qisqacha ma'lumot"
                />
              </FormGroup>
              <ModalActions>
                <CancelButton type="button" onClick={() => setIsModalOpen(false)}>
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

export default SurveysPage
