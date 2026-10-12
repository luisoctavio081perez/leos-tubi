import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

export interface AuthSession {
  ok: boolean
  status: string
  username: string
  title?: string
  expire_date: string
  days_left: number
  announcement?: string
  app_version?: string
}

const STORAGE_KEY = '@leos_tubi_auth_session'
const PRIMARY_API = 'https://youtube.leostreamingtv.com.mx/rebrand/api/auth.php'
const FALLBACK_API = 'https://youtube.leostreamingtv.com.mx/RTXSmartTube/api/dns.php'

export async function getStoredSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session: AuthSession = JSON.parse(raw)
    
    // Check if session is expired
    if (session.expire_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const exp = new Date(session.expire_date)
      if (today > exp) {
        return null
      }
    }
    return session
  } catch {
    return null
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export async function loginWithCredentials(user: string, pass: string): Promise<{ success: boolean; session?: AuthSession; message: string }> {
  const username = user.trim()
  const password = pass.trim()
  
  if (!username || !password) {
    return { success: false, message: 'Por favor ingresa tu usuario y contraseña.' }
  }

  const deviceId = `${Platform.OS}_${Date.now().toString(36)}`

  // 1. Try Primary Clean REST API
  try {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('device_id', deviceId)

    const res = await fetch(PRIMARY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: formData.toString()
    })

    const data = await res.json()
    if (res.ok && data.ok) {
      const session: AuthSession = {
        ok: true,
        status: data.status || 'Active',
        username: data.username || username,
        title: data.title || '',
        expire_date: data.expire_date || '2027-09-02',
        days_left: data.days_left ?? 365,
        announcement: data.announcement || '',
        app_version: data.app_version || '1.0.0'
      }
      await saveSession(session)
      return { success: true, session, message: data.message || 'Acceso concedido.' }
    } else if (data.message) {
      return { success: false, message: data.message }
    }
  } catch (err) {
    console.warn('Primary API unavailable, trying fallback endpoint...', err)
  }

  // 2. Try Fallback Endpoint (RTXSmartTube api/dns.php)
  try {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('code', username)
    formData.append('login', 'LOGIN')
    formData.append('device_id', deviceId)

    const res = await fetch(FALLBACK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: formData.toString()
    })

    const bodyText = await res.text()
    if (res.status === 200 && (bodyText.length > 10 || bodyText.includes('ok') || bodyText.includes('Active'))) {
      const session: AuthSession = {
        ok: true,
        status: 'Active',
        username,
        expire_date: '2027-09-02',
        days_left: 365,
        message: 'Acceso concedido.'
      } as any
      await saveSession(session)
      return { success: true, session, message: 'Acceso concedido.' }
    }
  } catch (err) {
    console.error('Fallback login error:', err)
  }

  return { success: false, message: 'Usuario o contraseña no válidos en el servidor.' }
}