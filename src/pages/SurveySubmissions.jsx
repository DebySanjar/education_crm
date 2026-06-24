import React, { useState } from 'react'
import styled from 'styled-components'
import { useData } from '../context/DataContext'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
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
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.active ? '#1a1d2e' : 'transparent'};
  color: ${props => props.active ? '#00e0ff' : '#8892b0'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    color: #e2e8f0;
  }
`

const TableWrapper = styled.div`
  background: #13161f;
  border: 1px solid #1e2235;
  border-radius: 12px;
  overflow: hidden;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  padding: 14px 18px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #0f1117;
  border-bottom: 1px solid #1e2235;
`

const Td = styled.td`
  padding: 14px 18px;
  font-size: 0.9rem;
  color: #cbd5e1;
  border-bottom: 1px solid #1e2235;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 0.95rem;
`

const SurveySubmissions = () => {
  const { surveys, submissions } = useData()
  const [selectedSurveyId, setSelectedSurveyId] = useState(null)

  const filteredSubmissions = selectedSurveyId
    ? submissions.filter(s => s.surveyId === selectedSurveyId)
    : submissions

  return (
    <Wrapper>
      <PageHeader>
        <TitleBlock>
          <h2>Arizachilar</h2>
          <p>Barcha yuborilgan arizalarni ko'ring</p>
        </TitleBlock>

        {surveys.length > 0 && (
          <TabsContainer>
            <Tab active={!selectedSurveyId} onClick={() => setSelectedSurveyId(null)}>
              Barcha arizalar
            </Tab>
            {surveys.map(survey => (
              <Tab
                key={survey.id}
                active={selectedSurveyId === survey.id}
                onClick={() => setSelectedSurveyId(survey.id)}
              >
                {survey.name}
              </Tab>
            ))}
          </TabsContainer>
        )}
      </PageHeader>

      <TableWrapper>
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
            {filteredSubmissions.length === 0 ? (
              <tr>
                <Td colSpan="5">
                  <EmptyState>Hali ariza yo'q</EmptyState>
                </Td>
              </tr>
            ) : (
              filteredSubmissions.map(submission => (
                <tr key={submission.id}>
                  <Td>{submission.firstName}</Td>
                  <Td>{submission.lastName}</Td>
                  <Td>{submission.phone}</Td>
                  <Td>{surveys.find(s => s.id === submission.surveyId)?.name || 'Noma\'lum'}</Td>
                  <Td>
                    {submission.createdAt?.toDate?.().toLocaleString('uz-UZ') || 'Noma\'lum'}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>
    </Wrapper>
  )
}

export default SurveySubmissions
