import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
  MdDashboard, MdPeople, MdChecklist, MdPayment, MdBarChart, MdSettings,
  MdLogout, MdMenu, MdChevronLeft, MdClose, MdMoneyOff,
  MdExpandMore, MdGroup, MdDescription, MdAdminPanelSettings
} from 'react-icons/md'

const navItems = [
  { to: '/', icon: <MdDashboard />, label: 'Bosh sahifa' },
  {
    icon: <MdPeople />, label: "O'quvchilar", expandable: true,
    children: [
      { to: '/students', icon: <MdPeople />, label: "O'quvchilar ro'yxati" },
      { to: '/groups', icon: <MdGroup />, label: 'Guruhlar' },
    ]
  },
  { to: '/attendance', icon: <MdChecklist />, label: 'Davomat' },
  { to: '/payments', icon: <MdPayment />, label: "To'lovlar" },
  { to: '/expenses', icon: <MdMoneyOff />, label: 'Chiqimlar' },
  { to: '/statistics', icon: <MdBarChart />, label: 'Statistika' },
]

export default function DashboardLayout() {
  const { logout } = useAuth()
  const { unreadSubmissionsCount } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(
    location.pathname === '/students' || location.pathname === '/groups'
  )
  const [surveysOpen, setSurveysOpen] = useState(
    location.pathname === '/surveys' || location.pathname === '/surveys/submissions'
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isStudentsActive = location.pathname === '/students' || location.pathname === '/groups'
  const isSurveysActive = location.pathname === '/surveys' || location.pathname === '/surveys/submissions'

  return (
    <LayoutWrapper>
      {mobileOpen && <Overlay onClick={() => setMobileOpen(false)} />}

      <Sidebar id="sidebar-nav" $collapsed={collapsed} $mobileOpen={mobileOpen}>
        <SidebarHeader $collapsed={collapsed}>
          {!collapsed && <LogoIcon><MdAdminPanelSettings /></LogoIcon>}
          {!collapsed && <LogoText>Admin<span>Panel</span></LogoText>}
          {collapsed && <LogoIconCenter><MdAdminPanelSettings /></LogoIconCenter>}
          {!collapsed && (
            <CollapseBtn onClick={() => setCollapsed(c => !c)} title="Yopish">
              <MdChevronLeft />
            </CollapseBtn>
          )}
          <MobileCloseBtn onClick={() => setMobileOpen(false)}>
            <MdClose />
          </MobileCloseBtn>
        </SidebarHeader>

        <Nav>
          {collapsed && (
            <ExpandBtn onClick={() => setCollapsed(false)} title="Kengaytirish">
              <MdChevronLeft style={{ transform: 'rotate(180deg)' }} />
            </ExpandBtn>
          )}

          {/* Bosh sahifa */}
          <NavItem
            to="/"
            end
            $collapsed={collapsed}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? 'Bosh sahifa' : ''}
          >
            <span className="icon"><MdDashboard /></span>
            {!collapsed && <span className="label">Bosh sahifa</span>}
          </NavItem>

          {/* O'quvchilar — expandable */}
          {collapsed ? (
            <>
              <NavItem to="/students" $collapsed={collapsed} onClick={() => setMobileOpen(false)} title="O'quvchilar ro'yxati">
                <span className="icon"><MdPeople /></span>
              </NavItem>
              <NavItem to="/groups" $collapsed={collapsed} onClick={() => setMobileOpen(false)} title="Guruhlar">
                <span className="icon"><MdGroup /></span>
              </NavItem>
            </>
          ) : (
            <>
              <ParentNavItem
                $active={isStudentsActive}
                onClick={() => setStudentsOpen(o => !o)}
              >
                <span className="icon"><MdPeople /></span>
                <span className="label">O'quvchilar</span>
                <ChevronIcon $open={studentsOpen}><MdExpandMore /></ChevronIcon>
              </ParentNavItem>
              {studentsOpen && (
                <SubNav>
                  <SubNavItem
                    to="/students"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="dot" />
                    <span>Ro'yxat</span>
                  </SubNavItem>
                  <SubNavItem
                    to="/groups"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="dot" />
                    <span>Guruhlar</span>
                  </SubNavItem>
                </SubNav>
              )}
            </>
          )}

          {/* Davomat, To'lovlar, Chiqimlar */}
          {[
            { to: '/attendance', icon: <MdChecklist />, label: 'Davomat' },
            { to: '/payments', icon: <MdPayment />, label: "To'lovlar" },
            { to: '/expenses', icon: <MdMoneyOff />, label: 'Chiqimlar' },
          ].map(item => (
            <NavItem
              key={item.to}
              to={item.to}
              $collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : ''}
            >
              <span className="icon">{item.icon}</span>
              {!collapsed && <span className="label">{item.label}</span>}
            </NavItem>
          ))}

          {/* Sorovnomalar — expandable */}
          {collapsed ? (
            <>
              <NavItem to="/surveys" $collapsed={collapsed} onClick={() => setMobileOpen(false)} title="Sorovnomalar">
                <span className="icon"><MdDescription /></span>
                {unreadSubmissionsCount > 0 && <Badge style={{ position: 'absolute', top: '4px', right: '4px' }}>{unreadSubmissionsCount}</Badge>}
              </NavItem>
              <NavItem to="/surveys/submissions" $collapsed={collapsed} onClick={() => setMobileOpen(false)} title="Arizachilar">
                <span className="icon"><MdDescription /></span>
                {unreadSubmissionsCount > 0 && <Badge style={{ position: 'absolute', top: '4px', right: '4px' }}>{unreadSubmissionsCount}</Badge>}
              </NavItem>
            </>
          ) : (
            <>
              <ParentNavItem
                $active={isSurveysActive}
                onClick={() => setSurveysOpen(o => !o)}
              >
                <span className="icon"><MdDescription /></span>
                <span className="label">Sorovnomalar</span>
                {unreadSubmissionsCount > 0 && <Badge>{unreadSubmissionsCount}</Badge>}
                <ChevronIcon $open={surveysOpen}><MdExpandMore /></ChevronIcon>
              </ParentNavItem>
              {surveysOpen && (
                <SubNav>
                  <SubNavItem
                    to="/surveys"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="dot" />
                    <span>Sorovnomalar</span>
                  </SubNavItem>
                  <SubNavItem
                    to="/surveys/submissions"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="dot" />
                    <span>Arizachilar</span>
                    {unreadSubmissionsCount > 0 && <Badge>{unreadSubmissionsCount}</Badge>}
                  </SubNavItem>
                </SubNav>
              )}
            </>
          )}

          {/* Statistika */}
          <NavItem
            to="/statistics"
            $collapsed={collapsed}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? 'Statistika' : ''}
          >
            <span className="icon"><MdBarChart /></span>
            {!collapsed && <span className="label">Statistika</span>}
          </NavItem>
        </Nav>

        <NavItem
          to="/settings"
          $collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
          title={collapsed ? 'Sozlamalar' : ''}
          style={{ borderTop: '1px solid #1e2235', marginTop: 'auto' }}
        >
          <span className="icon"><MdSettings /></span>
          {!collapsed && <span className="label">Sozlamalar</span>}
        </NavItem>

        <LogoutBtn onClick={() => setShowLogoutDialog(true)} $collapsed={collapsed} title={collapsed ? 'Chiqish' : ''}>
          <MdLogout />
          {!collapsed && <span>Chiqish</span>}
        </LogoutBtn>
      </Sidebar>

      <Main $collapsed={collapsed}>
        <MobileTopBar>
          <MobileMenuBtn onClick={() => setMobileOpen(o => !o)}>
            <MdMenu />
          </MobileMenuBtn>
          <AdminBadge>Admin</AdminBadge>
        </MobileTopBar>
        <Content>
          <Outlet />
        </Content>
      </Main>

      {showLogoutDialog && (
        <DialogOverlay onClick={() => setShowLogoutDialog(false)}>
          <Dialog onClick={e => e.stopPropagation()}>
            <DialogIcon><MdLogout /></DialogIcon>
            <DialogTitle>Chiqishni tasdiqlang</DialogTitle>
            <DialogText>Tizimdan chiqmoqchimisiz?</DialogText>
            <DialogBtns>
              <DialogCancel onClick={() => setShowLogoutDialog(false)}>Bekor qilish</DialogCancel>
              <DialogConfirm onClick={handleLogout}>Ha, chiqish</DialogConfirm>
            </DialogBtns>
          </Dialog>
        </DialogOverlay>
      )}
    </LayoutWrapper>
  )
}

/* ─── Styled Components ─── */

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0f1117;
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 99;
  @media (min-width: 769px) { display: none; }
`

const SIDEBAR_FULL = '240px'
const SIDEBAR_MINI = '64px'

const Sidebar = styled.aside`
  width: ${({ $collapsed }) => $collapsed ? SIDEBAR_MINI : SIDEBAR_FULL};
  min-height: 100vh;
  background: #13161f;
  border-right: 1px solid #1e2235;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  transition: width 0.25s ease;
  overflow: hidden;

  /* Mobile: slide in/out, always full width */
  @media (max-width: 768px) {
    width: ${SIDEBAR_FULL};
    transform: ${({ $mobileOpen }) => $mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.28s ease;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: ${({ $collapsed }) => $collapsed ? '0 0 0 0' : '0 12px 0 20px'};
  justify-content: ${({ $collapsed }) => $collapsed ? 'center' : 'space-between'};
  border-bottom: 1px solid #1e2235;
  min-height: 60px;
  flex-shrink: 0;
  position: relative;
`

const LogoIcon = styled.div`
  font-size: 1.7rem;
  color: #00e0ff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: ${({ $collapsed }) => $collapsed ? '0' : '0'};
`

const LogoIconCenter = styled.div`
  font-size: 1.7rem;
  color: #00e0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const LogoText = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  flex: 1;
  span { color: #00e0ff; }
`

const Nav = styled.nav`
  flex: 1;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ParentNavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: ${({ $active }) => $active ? '#00e0ff' : '#8892b0'};
  background: ${({ $active }) => $active ? 'rgba(0,224,255,0.09)' : 'none'};
  border: none;
  border-left: 3px solid ${({ $active }) => $active ? '#00e0ff' : 'transparent'};
  text-align: left;
  font-size: 0.93rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  white-space: nowrap;
  transition: all 0.18s;
  position: relative;

  .icon { font-size: 1.25rem; flex-shrink: 0; }
  .label { flex: 1; }

  &:hover {
    color: #00e0ff;
    background: rgba(0,224,255,0.06);
  }
`

const ChevronIcon = styled.span`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: inherit;
`

const SubNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(0,0,0,0.15);
  border-left: 2px solid #1e2235;
  margin-left: 20px;
`

const SubNavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  color: #8892b0;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.18s;
  white-space: nowrap;
  position: relative;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
    opacity: 0.5;
  }

  &:hover {
    color: #00e0ff;
    background: rgba(0,224,255,0.06);
    .dot { opacity: 1; }
  }

  &.active {
    color: #00e0ff;
    background: rgba(0,224,255,0.09);
    .dot { opacity: 1; }
  }
`

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $collapsed }) => $collapsed ? '13px 0' : '12px 20px'};
  justify-content: ${({ $collapsed }) => $collapsed ? 'center' : 'flex-start'};
  color: #8892b0;
  text-decoration: none;
  font-size: 0.93rem;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.18s;
  white-space: nowrap;
  position: relative;

  .icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  &:hover {
    color: #00e0ff;
    background: rgba(0, 224, 255, 0.06);
  }

  &.active {
    color: #00e0ff;
    background: rgba(0, 224, 255, 0.09);
    border-left-color: ${({ $collapsed }) => $collapsed ? 'transparent' : '#00e0ff'};
  }
`

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $collapsed }) => $collapsed ? '14px 0' : '14px 20px'};
  justify-content: ${({ $collapsed }) => $collapsed ? 'center' : 'flex-start'};
  color: #ff6b6b;
  background: none;
  border: none;
  border-top: 1px solid #1e2235;
  cursor: pointer;
  font-size: 0.93rem;
  font-weight: 500;
  width: 100%;
  transition: background 0.18s;
  white-space: nowrap;

  svg { font-size: 1.2rem; flex-shrink: 0; }
  &:hover { background: rgba(255, 107, 107, 0.08); }
`

const ExpandBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-bottom: 1px solid #1e2235;
  color: #4a5568;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 10px 0;
  width: 100%;
  transition: color 0.18s, background 0.18s;
  &:hover { color: #00e0ff; background: rgba(0,224,255,0.06); }
`

const CollapseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 6px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: color 0.18s, background 0.18s;

  &:hover { color: #00e0ff; background: rgba(0,224,255,0.08); }

  /* Hide on mobile */
  @media (max-width: 768px) { display: none; }
`

const MobileCloseBtn = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  font-size: 1.3rem;
  padding: 6px;
  border-radius: 6px;
  flex-shrink: 0;
  &:hover { color: #e2e8f0; }

  @media (max-width: 768px) { display: flex; }
`

const Main = styled.div`
  flex: 1;
  margin-left: ${({ $collapsed }) => $collapsed ? SIDEBAR_MINI : SIDEBAR_FULL};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.25s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`

/* Thin top bar — mobile only */
const MobileTopBar = styled.header`
  display: none;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  background: #13161f;
  border-bottom: 1px solid #1e2235;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 768px) { display: flex; }
`

const MobileMenuBtn = styled.button`
  background: none;
  border: none;
  color: #8892b0;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
`

const AdminBadge = styled.div`
  background: rgba(0, 224, 255, 0.1);
  border: 1px solid rgba(0, 224, 255, 0.3);
  color: #00e0ff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`

const Badge = styled.span`
  background: #ff6b6b;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
`

const Content = styled.main`
  flex: 1;
  padding: 24px;
  @media (max-width: 480px) { padding: 16px; }
`

/* ── Logout Dialog ── */
const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
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
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
`

const DialogIcon = styled.div`
  font-size: 2.2rem;
  color: #ff6b6b;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`

const DialogTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
`

const DialogText = styled.div`
  font-size: 0.88rem;
  color: #8892b0;
  text-align: center;
  margin-bottom: 8px;
`

const DialogBtns = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
`

const DialogCancel = styled.button`
  flex: 1;
  padding: 10px;
  background: #1a1d2e;
  border: 1px solid #2d3748;
  color: #8892b0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
  &:hover { color: #e2e8f0; border-color: #4a5568; }
`

const DialogConfirm = styled.button`
  flex: 1;
  padding: 10px;
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.35);
  color: #ff6b6b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.15s;
  &:hover { background: rgba(255,107,107,0.22); }
`
