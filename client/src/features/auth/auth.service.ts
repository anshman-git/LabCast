import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from '../../lib/firebase'
import type { LoginInput, RegisterInput } from './types'

function auth() {
  if (!firebaseAuth || !isFirebaseConfigured) throw new Error('Firebase Authentication is not configured. Set the VITE_FIREBASE_* environment variables.')
  return firebaseAuth
}

export const authService = {
  async signIn({ email, password }: LoginInput) {
    return signInWithEmailAndPassword(auth(), email.trim(), password)
  },
  async register({ email, password, displayName }: RegisterInput) {
    const credential = await createUserWithEmailAndPassword(auth(), email.trim(), password)
    await updateProfile(credential.user, { displayName: displayName.trim() })
    return credential
  },
  resetPassword(email: string) {
    return sendPasswordResetEmail(auth(), email.trim())
  },
  signOut() {
    return signOut(auth())
  },
}
