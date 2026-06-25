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

export const updateGroup = async (id, data) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, id), {
      ...data, updatedAt: serverTimestamp()
    })
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

// ═══════════════════════════════════════════════════════════
// TEST DATA GENERATOR (Performance test uchun)
// ═══════════════════════════════════════════════════════════

const randomName = () => {
  const firstNames = ['Ali', 'Vali', 'Hasan', 'Husan', 'Olim', 'Ziyod', 'Shavkat', 'Ravshan', 'Begzod', 'Muhammad']
  const lastNames = ['Valiyev', 'Karimov', 'Nazarov', 'Qosimov', 'Alimov', 'Turayev', 'Xolmurodov', 'Sobirov']
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

const randomPhone = () => {
  const nums = '0123456789'
  let phone = '+9989'
  for (let i = 0; i < 7; i++) phone += nums[Math.floor(Math.random() * 10)]
  return phone
}

const randomDate = (start, end) => {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return d.toISOString().split('T')[0]
}

export const generateTestData = async () => {
  try {
    console.log('Test ma\'lumotlarini yaratish boshlandi...')
    const batch = writeBatch(db)
    
    // --- 1. Guruhlar (test uchun) ---
    const groupNames = ['A - 1', 'A - 2', 'B - 1', 'B - 2', 'C - 1']
    const groups = []
    for (let i = 0; i < groupNames.length; i++) {
      const groupRef = doc(collection(db, COLLECTIONS.GROUPS))
      groups.push({ id: groupRef.id, name: groupNames[i] })
      batch.set(groupRef, {
        name: groupNames[i],
        openedDate: '2024-01-15',
        price: 1500000,
        createdAt: serverTimestamp()
      })
    }

    // --- 2. 130 ta O'quvchi ---
    const students = []
    for (let i = 0; i < 130; i++) {
      const studentRef = doc(collection(db, COLLECTIONS.STUDENTS))
      const group = groups[Math.floor(Math.random() * groups.length)]
      const contractSum = 1500000
      const paid = Math.floor(Math.random() * (contractSum + 500000))
      const student = {
        id: studentRef.id,
        fullName: `${randomName()} ${i + 1}`,
        phone: randomPhone(),
        passport: `AB${1000000 + Math.floor(Math.random() * 9000000)}`,
        medStatus: Math.random() > 0.3 ? 'Topshirilgan' : 'Topshirilmagan',
        group: group.name,
        contractSum: contractSum,
        paid: paid,
        joinDate: randomDate(new Date(2024, 0, 1), new Date()),
        status: 'Faol'
      }
      students.push(student)
      batch.set(studentRef, { ...student, createdAt: serverTimestamp() })
    }
    console.log('130 ta o\'quvchi tayyor')

    // --- 3. 20 ta Sorovnoma ---
    const surveys = []
    for (let i = 0; i < 20; i++) {
      const surveyRef = doc(collection(db, COLLECTIONS.SURVEYS))
      const survey = {
        id: surveyRef.id,
        name: `Sorovnoma ${i + 1} - 2024`,
        description: 'Test uchun ariza formasi',
        fields: [
          { id: 'fullName', name: 'fullName', label: 'Ism va familiya', type: 'text', required: true },
          { id: 'phone', name: 'phone', label: 'Telefon raqam', type: 'tel', required: true },
          { id: 'age', name: 'age', label: 'Yosh', type: 'number', required: false }
        ],
        views: Math.floor(Math.random() * 500),
        submissions: 0
      }
      surveys.push(survey)
      batch.set(surveyRef, { ...survey, createdAt: serverTimestamp() })
    }
    console.log('20 ta sorovnoma tayyor')

    // --- 4. 80 ta Arizachi (Submissions) ---
    for (let i = 0; i < 80; i++) {
      const submissionRef = doc(collection(db, COLLECTIONS.SUBMISSIONS))
      const survey = surveys[Math.floor(Math.random() * surveys.length)]
      const submissionData = {
        fullName: `${randomName()} ${i + 1}`,
        phone: randomPhone(),
        age: 18 + Math.floor(Math.random() * 30),
        surveyId: survey.id,
        surveyName: survey.name,
        isRead: Math.random() > 0.4
      }
      batch.set(submissionRef, { ...submissionData, createdAt: serverTimestamp() })
      // Har bir sorovnoma uchun submission count ni yangilash (keyin bajariladi, batchda emas)
    }
    console.log('80 ta arizachi tayyor')

    // --- 5. 50 ta Chiqim ---
    const expenseTypes = ['Rent', 'Kitoblar', 'Ofis jihozlari', 'Kommunal to\'lovlar', 'Transport', 'Marketing']
    for (let i = 0; i < 50; i++) {
      const expenseRef = doc(collection(db, COLLECTIONS.EXPENSES))
      batch.set(expenseRef, {
        description: `${expenseTypes[Math.floor(Math.random() * expenseTypes.length)]} - ${i + 1}`,
        amount: 50000 + Math.floor(Math.random() * 2000000),
        date: randomDate(new Date(2024, 0, 1), new Date()),
        createdAt: serverTimestamp()
      })
    }
    console.log('50 ta chiqim tayyor')

    // --- 6. 100 ta To'lov ---
    for (let i = 0; i < 100; i++) {
      const paymentRef = doc(collection(db, COLLECTIONS.PAYMENTS))
      const student = students[Math.floor(Math.random() * students.length)]
      const amount = 100000 + Math.floor(Math.random() * 1500000)
      batch.set(paymentRef, {
        studentId: student.id,
        studentName: student.fullName,
        amount: amount,
        date: randomDate(new Date(2024, 0, 1), new Date()),
        createdAt: serverTimestamp()
      })
    }
    console.log('100 ta to\'lov tayyor')

    // --- 7. 30 kunlik Davomat ---
    const today = new Date()
    for (let d = 0; d < 30; d++) {
      const date = new Date(today)
      date.setDate(today.getDate() - d)
      const dateStr = date.toISOString().split('T')[0]
      const attendanceMap = {}
      students.forEach(st => {
        attendanceMap[st.id] = Math.random() > 0.15 ? 1 : 0 // 85% qatnashgan
      })
      const attRef = doc(db, COLLECTIONS.ATTENDANCE, dateStr)
      batch.set(attRef, attendanceMap)
    }
    console.log('30 kunlik davomat tayyor')

    // --- Batch ni yakunlash ---
    await batch.commit()
    console.log('✅ Barcha test ma\'lumotlar yaratildi!')

    // --- Submissions count ni yangilash (alohida, batch cheklovi tufayli) ---
    for (const survey of surveys) {
      const submissionsForSurvey = Math.floor(Math.random() * 10) + 1
      const surveyRef = doc(db, COLLECTIONS.SURVEYS, survey.id)
      await updateDoc(surveyRef, { submissions: submissionsForSurvey })
    }

    return { success: true, message: 'Barcha test ma\'lumotlar qo\'shildi!' }

  } catch (error) {
    console.error('Xato:', error)
    return { success: false, error: error.message }
  }
}
