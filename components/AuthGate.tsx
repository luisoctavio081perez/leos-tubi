import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'
import { getStoredSession, loginWithCredentials, AuthSession } from '@/lib/auth'

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('Sala')
  const [password, setPassword] = useState('Sala')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    checkInitialAuth()
  }, [])

  const checkInitialAuth = async () => {
    try {
      const activeSession = await getStoredSession()
      if (activeSession) {
        setSession(activeSession)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Ingresa tu usuario y contraseña.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    const result = await loginWithCredentials(username, password)
    setSubmitting(false)

    if (result.success && result.session) {
      setSession(result.session)
    } else {
      setErrorMessage(result.message)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Iniciando Leo's Tubi...</Text>
      </View>
    )
  }

  // If authenticated, render app
  if (session) {
    return <>{children}</>
  }

  // Otherwise, render login portal
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#090a0f" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Brand Header */}
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Leo's Tubi</Text>
          <Text style={styles.subtitle}>Leo Streaming TV • Acceso Premium</Text>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>USUARIO</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#64748b"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Servicio de streaming privado • Leo Streaming TV
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090a0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090a0f',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#11131a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 24,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#090a0f',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#e50914',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
  },
})