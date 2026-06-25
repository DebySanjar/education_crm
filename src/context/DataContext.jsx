import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  subscribeToStudents,
  subscribeToPayments,
  fetchAttendance,
  subscribeToExpenses,
  subscribeToGroups,
  addStudent as addStudentFS,
  updateStudent as updateStudentFS,
  deleteStudent as deleteStudentFS,
  addPayment as addPaymentFS,
  addExpense as addExpenseFS,
  updateExpense as updateExpenseFS,
  addGroup as addGroupFS,
  updateGroup as updateGroupFS,
  deleteGroup as deleteGroupFS,
  markAttendance as markAttendanceFS,
  saveAttendanceForDate as saveAttendanceForDateFS,
  clearAllData as clearAllDataFS,
  subscribeToBalance,
  updateDailyBalance,
  subscribeToSurveys,
  subscribeToSubmissions,
  addSurvey as addSurveyFS,
  updateSurvey as updateSurveyFS,
  deleteSurvey as deleteSurveyFS,
  addSubmission as addSubmissionFS,
  deleteSubmission as deleteSubmissionFS,
  markAllSubmissionsAsRead,
} from '../services/firestoreService'
import { useToast } from './ToastContext'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const toast = useToast()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [payments, setPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [balance, setBalance] = useState({})
  const [surveys, setSurveys] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [unreadSubmissionsCount, setUnreadSubmissionsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Qaysi collectionlar yuklandi — loading ni to'g'ri boshqarish uchun
  const loadedRef = useRef({ students: false, groups: false })

  const checkAllLoaded = () => {
    if (loadedRef.current.students && loadedRef.current.groups) {
      setLoading(false)
    }
  }

  // Barcha subscriptionlarni bir useEffect da boshlash — parallel, tez
  useEffect(() => {
    const unsubStudents = subscribeToStudents((data) => {
      setStudents(data)
      loadedRef.current.students = true
      checkAllLoaded()
    })

    const unsubGroups = subscribeToGroups((data) => {
      setGroups(data)
      loadedRef.current.groups = true
      checkAllLoaded()
    })

    // Payments — real-time (2 admin bir vaqtda ishlashi uchun)
    const unsubPayments = subscribeToPayments(setPayments)

    // Expenses — real-time (2 admin bir vaqtda ishlashi uchun)
    const unsubExpenses = subscribeToExpenses(setExpenses)

    // Balance — real-time
    const unsubBalance = subscribeToBalance(setBalance)

    // Surveys — real-time
    const unsubSurveys = subscribeToSurveys(setSurveys)

    // Submissions — real-time
    const unsubSubmissions = subscribeToSubmissions((data) => {
      setSubmissions(data)
      // O'qilmagan submissionlar sonini hisoblash
      const unreadCount = data.filter(sub => !sub.isRead).length
      setUnreadSubmissionsCount(unreadCount)
    })

    // Attendance — getDocs (bir martalik, read tejash)
    fetchAttendance().then(res => setAttendance(res.data))

    return () => {
      unsubStudents()
      unsubGroups()
      unsubPayments()
      unsubExpenses()
      unsubBalance()
      unsubSurveys()
      unsubSubmissions()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addStudent = async (student) => {
    const result = await addStudentFS(student)
    if (result.success) {
      toast.success("O'quvchi muvaffaqiyatli qo'shildi.")
    } else {
      toast.error("O'quvchi qo'shilmadi. Internetni tekshiring.")
    }
  }

  const updateStudent = async (id, data) => {
    const result = await updateStudentFS(id, data)
    if (result.success) {
      toast.success("O'quvchi ma'lumotlari saqlandi.")
    } else {
      toast.error("O'quvchi ma'lumotlari saqlanmadi.")
    }
  }

  const deleteStudent = async (id) => {
    const result = await deleteStudentFS(id)
    if (result.success) {
      toast.success("O'quvchi o'chirildi.")
    } else {
      toast.error("O'quvchi o'chirilmadi.")
    }
  }

  // Attendance sahifasi ochilganda chaqiriladi — ikkinchi admin o'zgarishlarni ko'rishi uchun
  const refreshAttendance = async () => {
    const res = await fetchAttendance()
    if (res.success) {
      setAttendance(res.data)
    } else {
      toast.error('Davomat ma\'lumotlari yuklanmadi.')
    }
  }

  const markAttendance = async (date, studentId, status) => {
    const result = await markAttendanceFS(date, studentId, status)
    if (result.success) {
      setAttendance(prev => ({
        ...prev,
        [date]: { ...(prev[date] || {}), [studentId]: status }
      }))
    } else {
      toast.error('Davomat saqlanmadi.')
    }
  }

  const saveAttendanceForDate = async (date, attendanceMap) => {
    const result = await saveAttendanceForDateFS(date, attendanceMap)
    if (result.success) {
      setAttendance(prev => ({
        ...prev,
        [date]: { ...(prev[date] || {}), ...attendanceMap }
      }))
    } else {
      toast.error('Davomat saqlanmadi. Internetni tekshiring.')
    }
    return result
  }

  const addPayment = async (payment) => {
    const result = await addPaymentFS(payment)
    if (result.success) {
      const student = students.find(s => s.id === payment.studentId)
      if (student) {
        await updateStudentFS(payment.studentId, {
          paid: student.paid + payment.amount
        })
      }
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0) + payment.amount
      await updateDailyBalance(payment.date, totalRevenue)
      toast.success("To'lov muvaffaqiyatli saqlandi.")
    } else {
      toast.error("To'lov saqlanmadi. Internetni tekshiring.")
    }
  }

  const addExpense = async (expense) => {
    const result = await addExpenseFS(expense)
    if (result.success) {
      toast.success("Chiqim qo'shildi.")
    } else {
      toast.error("Chiqim saqlanmadi. Internetni tekshiring.")
    }
  }

  const updateExpense = async (id, data) => {
    const result = await updateExpenseFS(id, data)
    if (result.success) {
      toast.success("Chiqim yangilandi.")
    } else {
      toast.error("Chiqim yangilanmadi.")
    }
    return result
  }

  const addGroup = async (group) => {
    const result = await addGroupFS(group)
    if (result.success) {
      toast.success("Guruh qo'shildi.")
    } else {
      toast.error("Guruh qo'shilmadi.")
    }
    return result
  }

  const updateGroup = async (id, data) => {
    const result = await updateGroupFS(id, data)
    if (result.success) {
      toast.success("Guruh yangilandi.")
    } else {
      toast.error("Guruh yangilanmadi.")
    }
    return result
  }

  const deleteGroup = async (id) => {
    const result = await deleteGroupFS(id)
    if (result.success) {
      toast.success("Guruh o'chirildi.")
    } else {
      toast.error("Guruh o'chirilmadi.")
    }
    return result
  }

  const addSurvey = async (survey) => {
    const result = await addSurveyFS(survey)
    if (result.success) {
      toast.success("Sorovnoma muvaffaqiyatli qo'shildi.")
    } else {
      toast.error("Sorovnoma qo'shilmadi.")
    }
    return result
  }

  const updateSurvey = async (id, data) => {
    const result = await updateSurveyFS(id, data)
    if (result.success) {
      toast.success("Sorovnoma yangilandi.")
    } else {
      toast.error("Sorovnoma yangilanmadi.")
    }
    return result
  }

  const deleteSurvey = async (id) => {
    const result = await deleteSurveyFS(id)
    if (result.success) {
      toast.success("Sorovnoma o'chirildi.")
    } else {
      toast.error("Sorovnoma o'chirilmadi.")
    }
    return result
  }

  const addSubmission = async (submission) => {
    const result = await addSubmissionFS(submission)
    if (result.success) {
      toast.success("Ariza muvaffaqiyatli yuborildi.")
    }
    return result
  }

  const deleteSubmission = async (id, surveyId) => {
    const result = await deleteSubmissionFS(id, surveyId)
    if (result.success) {
      toast.success("Ariza o'chirildi.")
    } else {
      toast.error("Ariza o'chirilmadi.")
    }
    return result
  }

  const markSubmissionsAsRead = async () => {
    const result = await markAllSubmissionsAsRead()
    return result
  }

  const clearAllData = async () => {
    const result = await clearAllDataFS()
    if (result.success) {
      toast.success(`${result.deletedCount} ta yozuv o'chirildi. Tizim tozalandi.`)
    } else {
      toast.error("Ma'lumotlarni tozalashda xatolik yuz berdi.")
    }
    return result
  }

  return (
    <DataContext.Provider value={{
      students,
      addStudent,
      updateStudent,
      deleteStudent,
      attendance,
      markAttendance,
      saveAttendanceForDate,
      refreshAttendance,
      payments,
      addPayment,
      expenses,
      addExpense,
      updateExpense,
      groups,
      addGroup,
      updateGroup,
      deleteGroup,
      clearAllData,
      loading,
      balance,
      updateDailyBalance,
      surveys,
      addSurvey,
      updateSurvey,
      deleteSurvey,
      submissions,
      addSubmission,
      deleteSubmission,
      unreadSubmissionsCount,
      markSubmissionsAsRead,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
