import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useOnboarding } from '../context/OnboardingContext';
import { useLocation } from 'react-router-dom';

const TooltipContainer = styled.div`
  padding: 20px;
  color: #e2e8f0;
  font-size: 14px;
`;

const TooltipTitle = styled.h3`
  font-size: 18px;
  color: #00e0ff;
  margin-bottom: 10px;
  font-weight: 700;
`;

const TooltipContentText = styled.div`
  line-height: 1.6;
  margin-bottom: 20px;
`;

const TooltipButtonsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TooltipButtonsLeft = styled.div`
  display: flex;
  gap: 10px;
`;

const ButtonBack = styled.button`
  background: transparent;
  border: 1px solid #2d3748;
  color: #8892b0;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;
  &:hover {
    color: #e2e8f0;
    border-color: #4a5568;
  }
`;

const ButtonSkip = styled.button`
  background: transparent;
  border: none;
  color: #ff6b6b;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;
  &:hover {
    color: #ff8a8a;
  }
`;

const ButtonPrimary = styled.button`
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 224, 255, 0.4);
  }
`;

export default function OnboardingTour() {
  const { runTour, finishTour } = useOnboarding();
  const location = useLocation();

  // Har bir sahifa uchun alohida tour bosqichlari
  const getStepsForRoute = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return [
          {
            target: '#dashboard-welcome',
            content: 'Xush kelibsiz! Bu CRM sizning asosiy paneli hisoblanadi.',
            title: '👋 Assalomu alaykum!',
            disableBeacon: true
          },
          {
            target: '#dashboard-kpis',
            content: 'Bu yerda jami oquvchilar, tushum va xarajatlarni real vaqt rejimida korishingiz mumkin.',
            title: '📊 Asosiy korsatkichlar'
          },
          {
            target: '#sidebar-nav',
            content: 'Bu yerda barcha sahifalarga otingiz mumkin: Oquvchilar, Guruhlar, Tolovlar va boshqalar.',
            title: '🧭 Navigatsiya paneli'
          }
        ];
      case '/students':
        return [
          {
            target: '#students-header',
            content: 'Bu yerda oquvchilar royxatini boshqarasiz.',
            title: '👥 Oquvchilar',
            disableBeacon: true
          },
          {
            target: '#add-student-btn',
            content: 'Yangi oquvchi qoshish uchun shu tugmani bosing.',
            title: '➕ Yangi oquvchi'
          },
          {
            target: '#students-groups',
            content: 'Oquvchilarni guruhlar boyicha filtrlashingiz mumkin.',
            title: '🏷️ Guruhlar'
          }
        ];
      case '/groups':
        return [
          {
            target: '#groups-header',
            content: 'Bu yerda guruhlarni boshqarasiz.',
            title: '📚 Guruhlar',
            disableBeacon: true
          },
          {
            target: '#add-group-btn',
            content: 'Yangi guruh qoshishingiz mumkin.',
            title: '➕ Yangi guruh'
          }
        ];
      case '/payments':
        return [
          {
            target: '#payments-header',
            content: 'Bu yerda tolovlarni kuzatasiz.',
            title: '💰 Tolovlar',
            disableBeacon: true
          },
          {
            target: '#add-payment-btn',
            content: 'Yangi tolov qoshishingiz mumkin.',
            title: '➕ Tolov qoshish'
          }
        ];
      case '/expenses':
        return [
          {
            target: '#expenses-header',
            content: 'Bu yerda xarajatlarni kuzatasiz.',
            title: '📤 Xarajatlar',
            disableBeacon: true
          },
          {
            target: '#add-expense-btn',
            content: 'Yangi xarajat qoshishingiz mumkin.',
            title: '➕ Xarajat qoshish'
          }
        ];
      case '/statistics':
        return [
          {
            target: '#stats-header',
            content: 'Bu yerda tushum, xarajat va boshqa statistiklarni korishingiz mumkin.',
            title: '📈 Statistika',
            disableBeacon: true
          },
          {
            target: '#stats-charts',
            content: 'Grafiklar yordamida malumotlarni vizual koring.',
            title: '📉 Grafiklar'
          }
        ];
      default:
        return [];
    }
  };

  const steps = getStepsForRoute();

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      finishTour();
    }
  };

  return (
    <Joyride
      continuous
      hideCloseButton={false}
      run={runTour && steps.length > 0}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: '#1a1d2e',
          backgroundColor: '#1a1d2e',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          primaryColor: '#00e0ff',
          textColor: '#e2e8f0',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        },
        buttonNext: {
          display: 'none',
        },
        buttonBack: {
          display: 'none',
        },
        buttonSkip: {
          display: 'none',
        },
      }}
      callback={handleJoyrideCallback}
      tooltipComponent={({
        index,
        step,
        backProps,
        primaryProps,
        skipProps,
        tooltipProps,
        isLastStep,
      }) => (
        <div {...tooltipProps}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <TooltipContainer>
              {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
              <TooltipContentText>{step.content}</TooltipContentText>
              <TooltipButtonsRow>
                <TooltipButtonsLeft>
                  {index > 0 && <ButtonBack {...backProps}>Orqaga</ButtonBack>}
                  {!isLastStep && <ButtonSkip {...skipProps}>Otkazib yuborish</ButtonSkip>}
                </TooltipButtonsLeft>
                <ButtonPrimary {...primaryProps}>
                  {isLastStep ? 'Tugatish' : 'Keyingisi'}
                </ButtonPrimary>
              </TooltipButtonsRow>
            </TooltipContainer>
          </motion.div>
        </div>
      )}
    />
  );
}
