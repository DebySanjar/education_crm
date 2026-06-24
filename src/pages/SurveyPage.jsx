import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { getSurveyById, incrementSurveyViews, addSubmission as addSubmissionFS } from '../services/firestoreService'
import { MdCheckCircle } from 'react-icons/md'
import { motion } from 'framer-motion'

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`

const Container = styled(motion.div)`
  width: 100%;
  max-width: 600px;
  background: #13161f;
  border: 1px solid #2d3748;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 36px;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Description = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #cbd5e1;
`

const Input = styled.input`
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid #2d3748;
  background: #0f1117;
  color: #e2e8f0;
  font-size: 1rem;
  outline: none;
  transition: all 0.15s;
  &:focus {
    border-color: #00e0ff;
    box-shadow: 0 0 0 3px rgba(0, 224, 255, 0.1);
  }
`

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 224, 255, 0.4);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const SuccessScreen = styled(motion.div)`
  text-align: center;
  padding: 40px 20px;
`

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  color: #10b981;
`

const SuccessTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 12px 0;
`

const SuccessText = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
`

const ErrorScreen = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #ff6b6b;
`

const SurveyPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) {
        setError('Sorovnoma topilmadi')
        setLoading(false)
        return
      }
      
      // Increment views
      await incrementSurveyViews(id)
      
      const result = await getSurveyById(id)
      if (result.success && result.data) {
        setSurvey(result.data)
      } else {
        setError('Sorovnoma topilmadi yoki o\'chirilgan')
      }
      setLoading(false)
    }
    loadSurvey()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!survey) return
    
    setSubmitting(true)
    try {
      await addSubmissionFS({
        ...formData,
        surveyId: id,
        surveyName: survey.name
      })
      setSubmitted(true)
    } catch (err) {
      alert('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ color: '#94a3b8', textAlign: 'center' }}>Yuklanmoqda...</div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <Container>
          <ErrorScreen>
            <h2>Xatolik</h2>
            <p>{error}</p>
          </ErrorScreen>
        </Container>
      </PageWrapper>
    )
  }

  if (submitted) {
    return (
      <PageWrapper>
        <SuccessScreen
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <SuccessIcon>
            <MdCheckCircle size={48} />
          </SuccessIcon>
          <SuccessTitle>Muvaffaqiyatli!</SuccessTitle>
          <SuccessText>
            Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
          </SuccessText>
        </SuccessScreen>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Header>
          <Title>{survey.name}</Title>
          {survey.description && <Description>{survey.description}</Description>}
        </Header>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Ism *</Label>
            <Input
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Ismingizni kiriting"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Familiya *</Label>
            <Input
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Familiyangizni kiriting"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Telefon *</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 90 123 45 67"
              required
            />
          </FormGroup>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
          </Button>
        </Form>
      </Container>
    </PageWrapper>
  )
}

export default SurveyPage
