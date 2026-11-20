import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// دمج classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ✅ تنسيق الوقت — يقبل string أو Date
export function formatTime(timeInput) {
  if (!timeInput) return '-'

  // Date object
  if (timeInput instanceof Date) {
    return timeInput.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // string
  if (typeof timeInput !== 'string') return '-'
  if (timeInput.includes('ص') || timeInput.includes('م')) return timeInput

  try {
    const [hoursStr, minutes] = timeInput.split(':')
    let hours = parseInt(hoursStr)
    const ampm = hours >= 12 ? 'م' : 'ص'
    if (hours > 12) hours -= 12
    else if (hours === 0) hours = 12
    return `${hours}:${minutes} ${ampm}`
  } catch {
    return timeInput
  }
}

// تنسيق التاريخ
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '-'
  return new Date(dateInput).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

// تنسيق التاريخ + الوقت
export function formatDateTime(dateString, timeString) {
  return `${formatDate(dateString)} - ${formatTime(timeString)}`
}

// ثوابت
export const DEGREE_NAMES = {
  '1st': 'درجة أولى',
  '2nd': 'درجة ثانية',
  '3rd': 'درجة ثالثة',
  International: 'دولي',
  New: 'جدد',
}

export const JOB_NAMES = {
  referee: 'حكم',
  assistant: 'حكم مساعد',
  both: 'حكم ومساعد',
}

export const ROLE_NAMES = {
  main: 'رئيسي',
  assistant1: 'مساعد 1',
  assistant2: 'مساعد 2',
  fourth: 'رابع',
  var: 'VAR',
  avar: 'AVAR',
}

// حساب العمر
export function calculateAge(birthDate) {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// تنسيق المبلغ
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00 ج.م'
  return `${Number(amount).toFixed(2)} ج.م`
}