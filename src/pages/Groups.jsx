import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdEdit, MdDelete, MdClose, MdGroup, MdPeople, MdAttachMoney, MdCalendarToday } from 'react-icons/md'

const emptyForm = {
  name: '',
  openedDate: new Date().toISOString().split('T')[0],
  price: '1500000',
}

const formatNum = (v) => {
  const n = String(v).replace(/\D/g, '')
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
const parseNum = (v) => parseInt(String(v).replace(/\./g, '') || '0', 10)

export default function Groups() {
  const { groups, students, addGroup, updateGroup, deleteGroup, loading } = useData()
  const { isSuperAdmin } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const getStudentCount = (groupName) => students.filter(s => s.group === groupName).length
  const getTotalValue = (groupName, price) => {
    const count = getStudentCount(groupName)
    return count * (price || 0)
  }

  const openAdd = () => {
    setForm(emptyForm)
    setEditId(null)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (g) => {
    setForm({ name: g.name, openedDate: g.openedDate || '', price: formatNum(g.price || 1500000) })
    setEditId(g.id)
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Guruh nomini kiriting'
    const priceNum = parseNum(form.price)
    if (priceNum < 10000) newErrors.price = 'Minimal narx: 10.000 so\'m'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const data = { name: form.name.trim(), openedDate: form.openedDate, price: priceNum }
    if (editId) {
      await updateGroup(editId, data)
    } else {
      if (groups.some(g => g.name.toLowerCase() === data.name.toLowerCase())) {
        setErrors({ name: 'Bu guruh allaqachon mavjud' }); return
      }
      await addGroup(data)
    }
    setShowModal(false)
  }

  const handleDelete = async (g) => {
    const count = getStudentCount(g.name)
    if (count > 0) {
      alert(`"${g.name}" guruhida ${count} ta o'quvchi bor. Avval ularni boshqa guruhga o'tkazing.`)
      setDeleteConfirm(null)
      return
    }
    await deleteGroup(g.id)
    setDeleteConfirm(null)
  }

  return (
    <Wrapper>
      <PageHeader id="groups-header">
        <h2>Guruhlar</h2>
        {isSuperAdmin() && (
          <AddBtn id="add-group-btn" onClick={openAdd}><MdAdd /> Guruh qo'shish</AddBtn>
        )}
      </PageHeader>

      {loading ? (
        <Grid>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </Grid>
      ) : groups.length === 0 ? (
        <EmptyState>
          <MdGroup />
          <p>Hali guruh qo'shilmagan</p>
          {isSuperAdmin() && <AddBtn onClick={openAdd}><MdAdd /> Birinchi guruhni qo'shish</AddBtn>}
        </EmptyState>
      ) : (
        <Grid>
          {groups.map(g => {
            const count = getStudentCount(g.name)
            const price = g.price || 1500000
            const totalVal = getTotalValue(g.name, price)
            return (
              <CardWrap key={g.id}>
                <StyledCard>
                  <CardTitleArea>
                    <TitleLeft>
                      <MdGroup style={{ fontSize: '1.1rem' }} />
                      <span>{g.name}</span>
                    </TitleLeft>
                    <CardTag>Guruh</CardTag>
                  </CardTitleArea>

                  <CardBody>
                    <FeatureGrid>
                      <FeatureItem>
                        <FeatureIcon $color="#00e0ff"><MdPeople /></FeatureIcon>
                        <FeatureInfo>
                          <FeatureLabel>O'quvchilar</FeatureLabel>
                          <FeatureValue>{count} ta</FeatureValue>
                        </FeatureInfo>
                      </FeatureItem>

                      <FeatureItem>
                        <FeatureIcon $color="#a78bfa"><MdCalendarToday /></FeatureIcon>
                        <FeatureInfo>
                          <FeatureLabel>Ochilgan</FeatureLabel>
                          <FeatureValue>{g.openedDate || '—'}</FeatureValue>
                        </FeatureInfo>
                      </FeatureItem>

                      <FeatureItem>
                        <FeatureIcon $color="#10b981"><MdAttachMoney /></FeatureIcon>
                        <FeatureInfo>
                          <FeatureLabel>Kurs narxi</FeatureLabel>
                          <FeatureValue>{price.toLocaleString()} so'm</FeatureValue>
                        </FeatureInfo>
                      </FeatureItem>

                      <FeatureItem>
                        <FeatureIcon $color="#f59e0b"><MdAttachMoney /></FeatureIcon>
                        <FeatureInfo>
                          <FeatureLabel>Umumiy qiymat</FeatureLabel>
                          <FeatureValue $highlight>{totalVal.toLocaleString()} so'm</FeatureValue>
                        </FeatureInfo>
                      </FeatureItem>
                    </FeatureGrid>

                    {isSuperAdmin() && (
                      <CardActions>
                        <ActionBtn $color="#00e0ff" onClick={() => openEdit(g)}>
                          <MdEdit />
                        </ActionBtn>
                        <ActionBtn $color="#ff6b6b" onClick={() => setDeleteConfirm(g)}>
                          <MdDelete />
                        </ActionBtn>
                      </CardActions>
                    )}
                  </CardBody>
                </StyledCard>
              </CardWrap>
            )
          })}
        </Grid>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editId ? 'Guruhni tahrirlash' : "Yangi guruh qo'shish"}</h3>
              <CloseBtn onClick={() => setShowModal(false)}><MdClose /></CloseBtn>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <FormBody>
                <FormGroup>
                  <label>Guruh nomi *</label>
                  <input
                    required
                    autoFocus
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                    placeholder="Masalan: A guruh, Ertalabki..."
                  />
                  {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <label>Ochilgan sana</label>
                  <input
                    type="date"
                    value={form.openedDate}
                    onChange={e => setForm(f => ({ ...f, openedDate: e.target.value }))}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Kurs narxi (so'm) *</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={e => { setForm(f => ({ ...f, price: formatNum(e.target.value) })); setErrors(er => ({ ...er, price: '' })) }}
                    placeholder="1.500.000"
                  />
                  {errors.price && <ErrorText>{errors.price}</ErrorText>}
                </FormGroup>
              </FormBody>
              <ModalFooter>
                <CancelBtn type="button" onClick={() => setShowModal(false)}>Bekor qilish</CancelBtn>
                <SaveBtn type="submit">{editId ? 'Saqlash' : "Qo'shish"}</SaveBtn>
              </ModalFooter>
            </form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ModalOverlay onClick={() => setDeleteConfirm(null)}>
          <ConfirmModal onClick={e => e.stopPropagation()}>
            <h3>O'chirishni tasdiqlang</h3>
            <p>"{deleteConfirm.name}" guruhini o'chirmoqchimisiz?</p>
            <ConfirmBtns>
              <CancelBtn onClick={() => setDeleteConfirm(null)}>Bekor qilish</CancelBtn>
              <DeleteBtn onClick={() => handleDelete(deleteConfirm)}>O'chirish</DeleteBtn>
            </ConfirmBtns>
          </ConfirmModal>
        </ModalOverlay>
      )}
    </Wrapper>
  )
}

/* ─── Animations ─── */
const fadeUp = keyframes`from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); }`

/* ─── Layout ─── */
const Wrapper = styled.div`display:flex; flex-direction:column; gap:24px;`

const PageHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  h2 { font-size:1.4rem; font-weight:700; color:#e2e8f0; }
`

const AddBtn = styled.button`
  display:flex; align-items:center; gap:6px;
  background:#00e0ff18; border:1px solid #00e0ff44; color:#00e0ff;
  padding:9px 18px; border-radius:8px; cursor:pointer; font-size:0.9rem; font-weight:600;
  transition:background 0.18s;
  &:hover { background:#00e0ff28; }
`

const Grid = styled.div`
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap:28px;
`

const EmptyState = styled.div`
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:16px; padding:80px 20px;
  svg { font-size:4rem; color:#2d3748; }
  p { color:#4a5568; font-size:1rem; }
`

const SkeletonCard = styled.div`
  height:280px; border-radius:10px;
  background:linear-gradient(90deg,#13161f 25%,#1e2235 50%,#13161f 75%);
  background-size:200% 100%;
  animation:shimmer 1.5s infinite;
  @keyframes shimmer { to { background-position:-200% 0; } }
`

/* ─── Card ─── */
const CardWrap = styled.div`animation:${fadeUp} 0.4s ease both;`

const StyledCard = styled.div`
  position:relative;
  background:#13161f;
  border:1px solid #1e2235;
  border-radius:12px;
  overflow:hidden;
  transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    transform:translateY(-2px);
    border-color:#2d3748;
    box-shadow:0 8px 24px rgba(0,0,0,0.2);
  }
`

const CardPatternGrid = styled.div`
  position:absolute; inset:0;
  background-image:
    linear-gradient(to right,rgba(0,224,255,0.03) 1px,transparent 1px),
    linear-gradient(to bottom,rgba(0,224,255,0.03) 1px,transparent 1px);
  background-size:20px 20px;
  pointer-events:none; opacity:0.5; z-index:1;
  transition:opacity 0.4s;
  ${StyledCard}:hover & { opacity:1; }
`

const CardOverlayDots = styled.div`
  position:absolute; inset:0;
  background-image:radial-gradient(rgba(0,224,255,0.08) 1px,transparent 1px);
  background-size:20px 20px; background-position:-10px -10px;
  pointer-events:none; opacity:0; z-index:1;
  transition:opacity 0.4s;
  ${StyledCard}:hover & { opacity:1; }
`

const BoldPattern = styled.div`
  position:absolute; top:0; right:0;
  width:80px; height:80px;
  pointer-events:none; z-index:1;
  svg { width:100%; height:100%; }
`

const CardTitleArea = styled.div`
  position:relative;
  padding:14px 18px;
  background:#0f1117;
  border-bottom:1px solid #1e2235;
  display:flex; justify-content:space-between; align-items:center;
  z-index:2;
`

const TitleLeft = styled.div`
  display:flex; align-items:center; gap:8px;
  font-size:1rem; font-weight:800; color:#e2e8f0;
  text-transform:uppercase; letter-spacing:0.05em; z-index:1;
  svg { color:#00e0ff; }
`

const CardTag = styled.span`
  background:#1a1d2e; color:#00e0ff;
  font-size:0.7rem; font-weight:600;
  padding:3px 8px; border:1px solid #00e0ff44;
  border-radius:6px;
`

const CardBody = styled.div`
  position:relative; padding:18px; z-index:2;
`

const FeatureGrid = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;
`

const FeatureItem = styled.div`
  display:flex; align-items:center; gap:10px;
  background:#13161f; border:1px solid #1e2235; border-radius:8px; padding:10px;
  transition:transform 0.2s, border-color 0.2s;
  &:hover { transform:translateX(2px); border-color:#00e0ff33; }
`

const FeatureIcon = styled.div`
  width:32px; height:32px; border-radius:6px; flex-shrink:0;
  background:${({ $color }) => $color + '18'};
  border:1.5px solid ${({ $color }) => $color + '44'};
  display:flex; align-items:center; justify-content:center;
  color:${({ $color }) => $color}; font-size:1rem;
`

const FeatureInfo = styled.div`display:flex; flex-direction:column; gap:2px; min-width:0;`
const FeatureLabel = styled.span`font-size:0.7rem; color:#4a5568; font-weight:500; text-transform:uppercase; letter-spacing:0.5px;`
const FeatureValue = styled.span`
  font-size:0.82rem; font-weight:700;
  color:${({ $highlight }) => $highlight ? '#f59e0b' : '#e2e8f0'};
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
`

const CardActions = styled.div`
  display:flex; gap:12px;
  padding-top:14px;
  justify-content:flex-end;
`

const ActionBtn = styled.button`
  display:flex; align-items:center; justify-content:center;
  background:transparent;
  border:none;
  color:${({ $color }) => $color};
  padding:6px; cursor:pointer; font-size:1.2rem;
  transition:opacity 0.18s;
  &:hover { opacity:0.8; }
`

const DotsPattern = styled.div`
  position:absolute; bottom:16px; left:-16px;
  width:80px; height:40px; opacity:0.3;
  transform:rotate(-10deg); pointer-events:none; z-index:1;
  svg { width:100%; height:100%; }
`
const AccentShape = styled.div`
  position:absolute; width:20px; height:20px;
  background:#00e0ff18; border:1.5px solid #00e0ff33; border-radius:3px;
  transform:rotate(45deg); bottom:-10px; right:20px; z-index:0;
  transition:transform 0.3s;
  ${StyledCard}:hover & { transform:rotate(55deg) scale(1.1); }
`
const CornerSlice = styled.div`
  position:absolute; bottom:0; left:0;
  width:12px; height:12px;
  background:#0f1117;
  border-right:2px solid #1e2235;
  border-top:2px solid #1e2235;
  border-radius:0 4px 0 0; z-index:1;
`

/* ─── Modal ─── */
const ModalOverlay = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:200;
  display:flex; align-items:center; justify-content:center; padding:16px;
  backdrop-filter:blur(2px);
`
const Modal = styled.div`
  background:#13161f; border:1px solid #2d3748; border-radius:16px;
  width:100%; max-width:420px;
`
const ModalHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 24px; border-bottom:1px solid #1e2235;
  h3 { font-size:1.05rem; font-weight:600; color:#e2e8f0; }
`
const CloseBtn = styled.button`
  background:none; border:none; color:#4a5568; font-size:1.3rem; cursor:pointer;
  &:hover { color:#e2e8f0; }
`
const FormBody = styled.div`
  padding:20px 24px; display:flex; flex-direction:column; gap:16px;
`
const FormGroup = styled.div`
  display:flex; flex-direction:column; gap:6px;
  label { font-size:0.82rem; color:#8892b0; font-weight:500; }
  input {
    background:#0f1117; border:1px solid #2d3748; border-radius:8px;
    padding:10px 12px; color:#e2e8f0; font-size:0.9rem; outline:none;
    &:focus { border-color:#00e0ff; }
  }
`
const ErrorText = styled.div`font-size:0.75rem; color:#ff6b6b;`
const ModalFooter = styled.div`
  display:flex; justify-content:flex-end; gap:10px;
  padding:14px 24px; border-top:1px solid #1e2235;
`
const CancelBtn = styled.button`
  background:#1a1d2e; border:1px solid #2d3748; color:#8892b0;
  padding:9px 20px; border-radius:8px; cursor:pointer; font-size:0.9rem;
  &:hover { color:#e2e8f0; }
`
const SaveBtn = styled.button`
  background:#00e0ff18; border:1px solid #00e0ff44; color:#00e0ff;
  padding:9px 20px; border-radius:8px; cursor:pointer; font-size:0.9rem; font-weight:600;
  &:hover { background:#00e0ff28; }
`
const ConfirmModal = styled.div`
  background:#13161f; border:1px solid #2d3748; border-radius:16px;
  padding:28px; max-width:380px; width:100%;
  h3 { font-size:1.05rem; font-weight:600; color:#e2e8f0; margin-bottom:8px; }
  p { color:#8892b0; font-size:0.88rem; line-height:1.5; }
`
const ConfirmBtns = styled.div`display:flex; gap:10px; margin-top:20px; justify-content:flex-end;`
const DeleteBtn = styled.button`
  background:rgba(255,107,107,0.12); border:1px solid rgba(255,107,107,0.35);
  color:#ff6b6b; padding:9px 20px; border-radius:8px; cursor:pointer; font-size:0.9rem; font-weight:600;
  &:hover { background:rgba(255,107,107,0.22); }
`
