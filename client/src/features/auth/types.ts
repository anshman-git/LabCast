import type { User } from 'firebase/auth'

export const userRoles = ['teacher', 'student'] as const
export type UserRole = (typeof userRoles)[number]
export type AuthUser = Pick<User, 'uid' | 'email' | 'displayName' | 'emailVerified'>

export type RegisterInput = { email: string; password: string; displayName: string }
export type LoginInput = { email: string; password: string }
