import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { getSurveyById, incrementSurveyViews, addSubmission as addSubmissionFS } from '../services/firestoreService'
import { MdCheckCircle, MdChevronRight } from 'react-icons/md'
import { motion } from 'framer-motion'

// Color palette (Google Forms inspired)
const COLORS = {
  primary: '#673ab7',
  primaryLight: '#ede7f6',
  textPrimary: '#202124',
  textSecondary: '#5f6368',
  border: '#dadce0',
  background: '#f8f9fa',
  white: '#ffffff',
  error: '#d93025',
  success: '#137333'
}

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${COLORS.background};
  padding: 0;
  margin: 0;
`

const HeaderBanner = styled.div`
  width: 100%;
  height: 10px;
  background: linear-gradient(90deg, ${COLORS.primary} 0%, #9c27b0 100%);
`

const Container = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 12px 16px 60px;
  
  @media (min-width: 768px) {
    padding: 24px 0 80px;
  }
`

const FormCard = styled(motion.div)`
  background: ${COLORS.white};
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
  overflow: hidden;
  margin-bottom: 12px;
`

const HeaderSection = styled.div`
  border-top: 8px solid ${COLORS.primary};
  padding: 24px 24px 16px;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 400;
  color: ${COLORS.textPrimary};
  margin: 0 0 8px 0;
  line-height: 1.25;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`

const Description = styled.p`
  font-size: 0.9375rem;
  color: ${COLORS.textSecondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`

const RequiredNote = styled.div`
  font-size: 0.875rem;
  color: ${COLORS.error};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
`

const FieldCard = styled.div`
  padding: 24px;
  border-top: 1px solid ${COLORS.border};
`

const FieldLabel = styled.label`
  display: block;
  font-size: 1rem;
  color: ${COLORS.textPrimary};
  margin-bottom: 16px;
  line-height: 1.5;
`

const RequiredAsterisk = styled.span`
  color: ${COLORS.error};
  margin-left: 4px;
`

const Input = styled.input`
  width: 100%;
  padding: 8px 0;
  border: none;
  border-bottom: 1px solid ${COLORS.border};
  background: transparent;
  color: ${COLORS.textPrimary};
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  
  &:focus {
    border-bottom: 2px solid ${COLORS.primary};
  }
  
  &::placeholder {
    color: ${COLORS.textSecondary};
    opacity: 0.6;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${COLORS.border};
  border-radius: 4px;
  background: ${COLORS.white};
  color: ${COLORS.textPrimary};
  font-size: 0.9375rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235f6368' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 44px;
  
  &:focus {
    border-color: ${COLORS.primary};
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 0;
  border: none;
  border-bottom: 1px solid ${COLORS.border};
  background: transparent;
  color: ${COLORS.textPrimary};
  font-size: 0.9375rem;
  outline: none;
  min-height: 48px;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
  
  &:focus {
    border-bottom: 2px solid ${COLORS.primary};
  }
  
  &::placeholder {
    color: ${COLORS.textSecondary};
    opacity: 0.6;
  }
`

const ButtonContainer = styled.div`
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${COLORS.border};
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`

const Button = styled.button`
  padding: 10px 24px;
  border-radius: 4px;
  border: none;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  
  &:hover:not(:disabled) {
    background: #5e35b1;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const FooterText = styled.div`
  font-size: 0.8125rem;
  color: ${COLORS.textSecondary};
  text-align: center;
  padding: 24px 16px;
`

const SuccessScreen = styled(motion.div)`
  max-width: 640px;
  margin: 0 auto;
  padding: 12px 16px;
  
  @media (min-width: 768px) {
    padding: 24px 0;
  }
`

const SuccessCard = styled(FormCard)`
  padding: 48px 24px;
  text-align: center;
`

const SuccessIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${COLORS.success};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  color: ${COLORS.white};
`

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: ${COLORS.textPrimary};
  margin: 0 0 12px 0;
`

const SuccessText = styled.p`
  font-size: 0.9375rem;
  color: ${COLORS.textSecondary};
  margin: 0;
  line-height: 1.6;
`

const ErrorScreen = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 24px;
  text-align: center;
`

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  color: ${COLORS.error};
  margin: 0 0 12px 0;
`

const ErrorText = styled.p`
  font-size: 0.9375rem;
  color: ${COLORS.textSecondary};
  margin: 0;
`

const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: ${COLORS.textSecondary};
  font-size: 0.9375rem;
`

const SurveyPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({})
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
        // Initialize form data based on survey fields
        const initialData = {}
        result.data.fields?.forEach(field => {
          initialData[field.name] = ''
        })
        setFormData(initialData)
      } else {
        setError('Sorovnoma topilmadi yoki o\'chirilgan')
      }
      setLoading(false)
    }
    loadSurvey()
  }, [id])

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

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

  const hasRequiredFields = survey?.fields?.some(f => f.required)

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.name}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={`Javobingiz`}
            required={field.required}
          />
        )
      case 'number':
        return (
          <Input
            key={field.name}
            type="number"
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={`Javobingiz`}
            required={field.required}
          />
        )
      case 'tel':
        return (
          <Input
            key={field.name}
            type="tel"
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder="+998 90 123 45 67"
            required={field.required}
          />
        )
      case 'select':
        return (
          <Select
            key={field.name}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Tanlang</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </Select>
        )
      case 'textarea':
        return (
          <Textarea
            key={field.name}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={`Javobingiz`}
            required={field.required}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return <LoadingScreen>Yuklanmoqda...</LoadingScreen>
  }

  if (error) {
    return (
      <PageWrapper>
        <HeaderBanner />
        <ErrorScreen>
          <ErrorTitle>Xatolik</ErrorTitle>
          <ErrorText>{error}</ErrorText>
        </ErrorScreen>
      </PageWrapper>
    )
  }

  if (submitted) {
    return (
      <PageWrapper>
        <HeaderBanner />
        <SuccessScreen>
          <SuccessCard
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SuccessIcon>
              <MdCheckCircle size={40} />
            </SuccessIcon>
            <SuccessTitle>Javobingiz qabul qilindi</SuccessTitle>
            <SuccessText>
              Arizangiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.
            </SuccessText>
          </SuccessCard>
          <FooterText>
            Google Forms shaklida yaratilgan
          </FooterText>
        </SuccessScreen>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <HeaderBanner />
      <Container>
        <FormCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HeaderSection>
            <Title>{survey.name}</Title>
            {survey.description && <Description>{survey.description}</Description>}
            {hasRequiredFields && (
              <RequiredNote>
                <span>*</span> Majburiy savollar
              </RequiredNote>
            )}
          </HeaderSection>

          <form onSubmit={handleSubmit}>
            {survey.fields?.map(field => (
              <FieldCard key={field.name}>
                <FieldLabel>
                  {field.label}
                  {field.required && <RequiredAsterisk>*</RequiredAsterisk>}
                </FieldLabel>
                {renderField(field)}
              </FieldCard>
            ))}

            <ButtonContainer>
              <div></div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                {!submitting && <MdChevronRight size={20} />}
              </Button>
            </ButtonContainer>
          </form>
        </FormCard>

        <FooterText>
          Hech qanday shaxsiy ma'lumotlar to'planmaydi
        </FooterText>
      </Container>
    </PageWrapper>
  )
}

export default SurveyPage
