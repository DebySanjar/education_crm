import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTIONS = {
  STUDENTS:   'students',
  PAYMENTS:   'payments',
  ATTENDANCE: 'attendance',
  EXPENSES:   'expenses',
  GROUPS:     'groups',
  BALANCE:    'balance'
}

// ═══════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════

export const subscribeToStudents = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.STUDENTS), orderBy('joinDate', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => { callback([]) })
  } catch {
    callback([])
    return () => {}
  }
}

export const addStudent = async (studentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
      ...studentData, createdAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateStudent = async (id, data) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.STUDENTS, id), {
      ...data, updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteStudent = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════

export const subscribeToPayments = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.PAYMENTS), orderBy('date', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => { callback([]) })
  } catch {
    callback([])
    return () => {}
  }
}

export const addPayment = async (paymentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
      ...paymentData, createdAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════

export const fetchAttendance = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE))
    const attendance = {}
    snapshot.docs.forEach(d => { attendance[d.id] = d.data() })
    return { success: true, data: attendance }
  } catch {
    return { success: false, data: {} }
  }
}

export const markAttendance = async (date, studentId, value) => {
  try {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, date)
    const attendanceData = { [studentId]: value }
    await updateDoc(docRef, attendanceData).catch(async (err) => {
      if (err.code === 'not-found') {
        await setDoc(docRef, attendanceData)
      } else {
        throw err
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const saveAttendanceForDate = async (date, attendanceMap) => {
  try {
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, date), attendanceMap, { merge: true })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════

export const subscribeToExpenses = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.EXPENSES), orderBy('date', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => { callback([]) })
  } catch {
    callback([])
    return () => {}
  }
}

export const addExpense = async (expenseData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), {
      ...expenseData, createdAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateExpense = async (id, data) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.EXPENSES, id), {
      ...data, updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════
// BALANCE
// ═══════════════════════════════════════════════════════════

export const subscribeToBalance = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.BALANCE), orderBy('date', 'asc'))
    return onSnapshot(q, (snapshot) => {
      const balance = {}
      snapshot.docs.forEach(d => { balance[d.id] = d.data() })
      callback(balance)
    }, () => { callback({}) })
  } catch {
    callback({})
    return () => {}
  }
}

export const updateDailyBalance = async (dateStr, totalRevenue) => {
  try {
    const [, month, day] = dateStr.split('-')
    const docRef = doc(db, COLLECTIONS.BALANCE, `dailyProfit${day}${month}`)
    await setDoc(docRef, {
      date: dateStr, totalRevenue, updatedAt: serverTimestamp()
    }, { merge: true })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════════════════════

export const subscribeToGroups = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.GROUPS), orderBy('name', 'asc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => { callback([]) })
  } catch {
    callback([])
    return () => {}
  }
}

export const addGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.GROUPS), {
      ...groupData, createdAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteGroup = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GROUPS, id))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════
// DATA CLEANUP
// ═══════════════════════════════════════════════════════════

export const clearAllData = async () => {
  try {
    const cols = [
      COLLECTIONS.STUDENTS, COLLECTIONS.PAYMENTS, COLLECTIONS.ATTENDANCE,
      COLLECTIONS.EXPENSES,  COLLECTIONS.GROUPS,   COLLECTIONS.BALANCE
    ]
    let totalDeleted = 0
    for (const name of cols) {
      const snapshot = await getDocs(collection(db, name))
      await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)))
      totalDeleted += snapshot.size
    }
    return { success: true, deletedCount: totalDeleted }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
