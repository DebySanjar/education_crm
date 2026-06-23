import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useOnboarding } from '../context/OnboardingContext';
import { useLocation } from 'react-router-dom';

const TooltipContent = styled.div`
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

const TooltipButton = styled.button`
  background: linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
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
            content: 'Bu yerda jami o\'quvchilar, tushum va xarajatlarni real vaqt rejimida ko\'rishingiz mumkin.',
            title: '📊 Asosiy ko\'rsatkichlar'
          },
          {
            target: '#sidebar-nav',
            content: 'Bu yerda barcha sahifalarga o\'tishingiz mumkin: O\'quvchilar, Guruhlar, To\'lovlar va boshqalar.',
            title: '🧭 Navigatsiya paneli'
          }
        ];
      case '/students':
        return [
          {
            target: '#students-header',
            content: 'Bu yerda o\'quvchilar ro\'yxatini boshqarasiz.',
            title: '👥 O\'quvchilar',
            disableBeacon: true
          },
          {
            target: '#add-student-btn',
            content: 'Yangi o\'quvchi qo\'shish uchun shu tugmani bosing.',
            title: '➕ Yangi o\'quvchi'
          },
          {
            target: '#students-groups',
            content: 'O\'quvchilarni guruhlar bo\'yicha filtrlashingiz mumkin.',
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
            content: 'Yangi guruh qo\'shishingiz mumkin.',
            title: '➕ Yangi guruh'
          }
        ];
      case '/payments':
        return [
          {
            target: '#payments-header',
            content: 'Bu yerda to\'lovlarni kuzatasiz.',
            title: '💰 To\'lovlar',
            disableBeacon: true
          },
          {
            target: '#add-payment-btn',
            content: 'Yangi to\'lov qo\'shishingiz mumkin.',
            title: '➕ To\'lov qo\'shish'
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
            content: 'Yangi xarajat qo\'shishingiz mumkin.',
            title: '➕ Xarajat qo\'shish'
          }
        ];
      case '/statistics':
        return [
          {
            target: '#stats-header',
            content: 'Bu yerda tushum, xarajat va boshqa statistiklarni ko\'rishingiz mumkin.',
            title: '📈 Statistika',
            disableBeacon: true
          },
          {
            target: '#stats-charts',
            content: 'Grafiklar yordamida ma\'lumotlarni vizual ko\'ring.',
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
          background: 'linear-gradient(135deg, #00e0ff 0%, #7c3aed 100%)',
          borderRadius: '8px',
          padding: '8px 20px',
          fontWeight: '600',
        },
        buttonBack: {
          color: '#8892b0',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#ff6b6b',
        },
      }}
      callback={handleJoyrideCallback}
      tooltipComponent={({
        continuous,
        index,
        step,
        backProps,
        closeProps,
        primaryProps,
        skipProps,
        tooltipProps,
        isLastStep,
        size,
      }) => (
        <div {...tooltipProps}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <TooltipContent>
              {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
              <div style={{ lineHeight: '1.6', marginBottom: '20px }}>
                {step.content}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {index > 0 && (
                  <button {...backProps} style={{
                    background: 'transparent',
                    border: '1px solid #2d3748',
                    color: '#8892b0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginRight: '10px',
                    fontWeight: '600'
                  }}>
                    Orqaga
                  </button>
                )}
                  {!isLastStep && (
                  <button {...skipProps} style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ff6b6b',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}>
                    O'tkazib yuborish
                  </button>
                )}
                </div>
                <TooltipButton {...primaryProps}>
                  {isLastStep ? 'Tugatish' : 'Keyingisi'}
                </TooltipButton>
              </div>
            </TooltipContent>
          </motion.div>
        </div>
      )}
    />
  );
}
