interface JwtPayload {
  sess_id: string
  user_id: string
  username: string
  roles: string[]
  exp: number
  iat: number
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export const hasRole = (role: string): boolean => {
  const token = localStorage.getItem('accessToken')
  if (!token) return false

  const payload = decodeJwt(token)
  if (!payload) return false

  return payload.roles.includes(role)
}

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwt(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

export const clearAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
} 