import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTIONS = {
  STUDENTS:   'students',
  PAYMENTS:   'payments',
  ATTENDANCE: 'attendance',
  EXPENSES:   'expenses',
  GROUPS:     'groups',
  BALANCE:    'balance',
  SURVEYS:    'surveys',
  SUBMISSIONS: 'submissions'
}

// ═══════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════

// Barcha o'quvchilar — faqat Dashboard/Payments/Statistics uchun
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

// Guruh bo'yicha — faqat Students sahifasi uchun (performance)
export const fetchStudentsByGroup = async (groupName) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where('group', '==', groupName),
      orderBy('joinDate', 'desc')
    )
    const snapshot = await getDocs(q)
    return { success: true, data: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) }
  } catch (error) {
    return { success: false, data: [], error: error.message }
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

export const updateGroup = async (id, data, oldName = null) => {
  try {
    // Update group itself
    await updateDoc(doc(db, COLLECTIONS.GROUPS, id), {
      ...data, updatedAt: serverTimestamp()
    })

    // If group name changed, update all students in that group
    if (oldName && data.name && oldName !== data.name) {
      const q = query(collection(db, COLLECTIONS.STUDENTS), where('group', '==', oldName))
      const snapshot = await getDocs(q)
      
      if (snapshot.docs.length > 0) {
        const batch = writeBatch(db)
        snapshot.docs.forEach(docSnap => {
          batch.update(docSnap.ref, { group: data.name, updatedAt: serverTimestamp() })
        })
        await batch.commit()
      }
    }

    return { success: true }
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
      COLLECTIONS.EXPENSES,  COLLECTIONS.GROUPS,   COLLECTIONS.BALANCE,
      COLLECTIONS.SURVEYS,  COLLECTIONS.SUBMISSIONS
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

// ═══════════════════════════════════════════════════════════
// SURVEYS (Sorovnomalar)
// ═══════════════════════════════════════════════════════════

export const subscribeToSurveys = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.SURVEYS), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => { callback([]) })
  } catch {
    callback([])
    return () => {}
  }
}

export const addSurvey = async (surveyData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.SURVEYS), {
      ...surveyData,
      views: 0,
      submissions: 0,
      createdAt: serverTimestamp()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateSurvey = async (id, data) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.SURVEYS, id), {
      ...data, updatedAt: serverTimestamp()
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteSurvey = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SURVEYS, id))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const incrementSurveyViews = async (id) => {
  try {
    const surveyRef = doc(db, COLLECTIONS.SURVEYS, id)
    const docSnap = await getDoc(surveyRef)
    if (docSnap.exists()) {
      await updateDoc(surveyRef, {
        views: docSnap.data().views + 1
      })
    }
    return { success: true }
  } catch {
    return { success: false }
  }
}

// ═══════════════════════════════════════════════════════════
// SUBMISSIONS (Arizachilar)
// ═══════════════════════════════════════════════════════════

export const subscribeToSubmissions = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.SUBMISSIONS), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => { callback([]) })
  } catch {
    callback([])
    return () => {}
  }
}

export const addSubmission = async (submissionData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.SUBMISSIONS), {
      ...submissionData,
      isRead: false,
      createdAt: serverTimestamp()
    })
    
    // Sorovnoma submission countini oshirish
    const surveyRef = doc(db, COLLECTIONS.SURVEYS, submissionData.surveyId)
    const docSnap = await getDoc(surveyRef)
    if (docSnap.exists()) {
      await updateDoc(surveyRef, {
        submissions: docSnap.data().submissions + 1
      })
    }
    
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Barcha o'qilmagan submissionlarni o'qilgan deb belgilash
export const markAllSubmissionsAsRead = async () => {
  try {
    // Barcha submissionlarni olamiz (isRead maydoni bo'lmaganlar ham)
    const q = query(collection(db, COLLECTIONS.SUBMISSIONS))
    const snapshot = await getDocs(q)
    
    const unreadDocs = snapshot.docs.filter(doc => !doc.data().isRead)
    
    if (unreadDocs.length > 0) {
      // Batch update - samaraliroq
      const batch = writeBatch(db)
      unreadDocs.forEach(doc => {
        batch.update(doc.ref, { isRead: true })
      })
      await batch.commit()
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getSurveyById = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.SURVEYS, id))
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    }
    return { success: false, data: null }
  } catch (error) {
    return { success: false, data: null, error: error.message }
  }
}

export const deleteSubmission = async (id, surveyId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SUBMISSIONS, id))
    // Update survey submission count
    if (surveyId) {
      const surveyRef = doc(db, COLLECTIONS.SURVEYS, surveyId)
      const docSnap = await getDoc(surveyRef)
      if (docSnap.exists()) {
        const currentSubmissions = docSnap.data().submissions || 0
        await updateDoc(surveyRef, {
          submissions: Math.max(0, currentSubmissions - 1)
        })
      }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}


