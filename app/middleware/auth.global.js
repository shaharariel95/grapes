export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip on server-side to prevent hydration mismatches
    // if (process.server) return

    const { user, fetchUser } = useAuth()

    // If user state is not initialized, try to fetch user
    if (!user.value) {
        await fetchUser()
    }

    // If still no user and trying to access a protected route
    if (!user.value && to.path !== '/login') {
        return navigateTo('/login')
    }

    // If user is logged in and trying to access login page
    if (user.value && to.path === '/login') {
        return navigateTo('/')
    }
})
