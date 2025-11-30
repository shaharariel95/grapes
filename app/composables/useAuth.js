export const useAuth = () => {
    const user = useState('user', () => null)
    const router = useRouter()

    const login = async (username, password) => {
        try {
            await $fetch('/api/auth/login', {
                method: 'POST',
                body: { username, password }
            })
            // Fetch user details after successful login
            await fetchUser()
            router.push('/')
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', { method: 'POST' })
            user.value = null
            router.push('/login')
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    const fetchUser = async () => {
        try {
            const { user: loggedInUser } = await $fetch('/api/auth/user')
            user.value = loggedInUser
        } catch (error) {
            // Silently handle - user will be null (not logged in)
            user.value = null
            // Don't log on server to avoid noise
            if (process.client) {
                console.debug('Not authenticated')
            }
        }
    }

    return {
        user,
        login,
        logout,
        fetchUser
    }
}
