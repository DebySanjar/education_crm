import React, { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'
import { MdSearch, MdDelete } from 'react-icons/md'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
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

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f1117;
  border: 1px solid #2d3748;
  border-radius: 10px;
  padding: 10px 14px;
  flex: 1;
  min-width: 220px;
  svg {
    color: #8892b0;
    font-size: 1.2rem;
  }
  input {
    flex: 1;
    border: none;
    background: transparent;
    color: #e2e8f0;
    font-size: 0.95rem;
    outline: none;
  }
`

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  background: #13161f;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid #1e2235;
  flex-wrap: wrap;
`

const Tab = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#1a1d2e' : 'transparent'};
  color: ${props => props.$active ? '#00e0ff' : '#8892b0'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    color: #e2e8f0;
  }
`

const TableCard = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #0f1117;
  border-bottom: 1px solid #1e2235;
  white-space: nowrap;
`

const Td = styled.td`
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #cbd5e1;
  border-bottom: 1px solid #1e2235;
  white-space: nowrap;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  font-size: 0.95rem;
`

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #2d3748;
  background: transparent;
  color: #8892b0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
  }
`

const SurveySubmissions = () => {
  const { surveys, submissions, deleteSubmission } = useData()
  const [selectedSurveyId, setSelectedSurveyId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submissionToDelete, setSubmissionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filteredSubmissions = selectedSurveyId
    ? submissions.filter(s => s.surveyId === selectedSurveyId)
    : submissions

  const searchedSubmissions = filteredSubmissions.filter(sub => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return Object.values(sub).some(val => 
      String(val).toLowerCase().includes(query)
    )
  })

  const getTableHeaders = () => {
    const headers = new Set()
    searchedSubmissions.forEach(sub => {
      Object.keys(sub).forEach(key => {
        if (key !== 'id' && key !== 'surveyId' && key !== 'surveyName' && key !== 'createdAt') {
          headers.add(key)
        }
      })
    })
    return Array.from(headers)
  }

  const headers = getTableHeaders()

  const handleDeleteClick = (submission) => {
    setSubmissionToDelete(submission)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return
    setDeleting(true)
    await deleteSubmission(submissionToDelete.id, submissionToDelete.surveyId)
    setDeleting(false)
    setShowDeleteDialog(false)
    setSubmissionToDelete(null)
  }

  return (
    <Wrapper>
      <PageHeader>
        <TitleBlock>
          <h2>Arizachilar</h2>
          <p>Barcha yuborilgan arizalarni ko'ring</p>
        </TitleBlock>
        <SearchWrap>
          <MdSearch />
          <input 
            placeholder="Ariza qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrap>
      </PageHeader>

      {surveys.length > 0 && (
        <TabsContainer>
          <Tab $active={!selectedSurveyId} onClick={() => setSelectedSurveyId(null)}>
            Barcha arizalar
          </Tab>
          {surveys.map(survey => (
            <Tab
              key={survey.id}
              $active={selectedSurveyId === survey.id}
              onClick={() => setSelectedSurveyId(survey.id)}
            >
              {survey.name}
            </Tab>
          ))}
        </TabsContainer>
      )}

      <TableCard>
        <Table>
          <thead>
            <tr>
              {headers.map(key => (
              <Th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Th>
            ))}
              <Th>Sorovnoma</Th>
              <Th>Vaqt</Th>
              <Th style={{ textAlign: 'center' }}>Amallar</Th>
            </tr>
          </thead>
          <tbody>
            {searchedSubmissions.length === 0 ? (
              <tr>
                <Td colSpan={headers.length + 3}>
                  <EmptyState>{searchQuery ? "Hech qanday ariza topilmadi" : "Hali ariza yo'q"}</EmptyState>
                </Td>
              </tr>
            ) : (
              searchedSubmissions.map(submission => (
                <tr key={submission.id}>
                  {headers.map(key => (
                    <Td key={key}>{submission[key] || '-'}</Td>
                  ))}
                  <Td>{surveys.find(s => s.id === submission.surveyId)?.name || 'Noma\'lum'}</Td>
                  <Td>
                    {submission.createdAt?.toDate?.().toLocaleString('uz-UZ') || 'Noma\'lum'}
                  </Td>
                  <Td style={{ textAlign: 'center' }}>
                    <IconButton onClick={() => handleDeleteClick(submission)}>
                      <MdDelete size={18} />
                    </IconButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableCard>
      
      {/* Delete Submission Confirmation Dialog */}
      {showDeleteDialog && (
        <DialogOverlay onClick={() => !deleting && setShowDeleteDialog(false)}>
          <Dialog onClick={e => e.stopPropagation()}>
            <DialogTitle>O'chirishni tasdiqlang</DialogTitle>
            <DialogText>
              Ushbu arizani o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi!
            </DialogText>
            <DialogDivider />
            <DialogButtons>
              <DialogCancel 
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Bekor qilish
              </DialogCancel>
              <DialogDividerVertical />
              <DialogConfirm 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "O'chirilmoqda" : "O'chirish"}
              </DialogConfirm>
            </DialogButtons>
          </Dialog>
        </DialogOverlay>
      )}
    </Wrapper>
  )
}

// Dialog components
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

export default SurveySubmissions
