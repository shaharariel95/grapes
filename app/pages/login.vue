<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Login</h2>
            <form @submit.prevent="handleLogin">
                <div class="mb-4">
                    <label for="username"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                    <input v-model="username" type="text" id="username"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required />
                </div>
                <div class="mb-6">
                    <label for="password"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <input v-model="password" type="password" id="password"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required />
                </div>
                <div v-if="error" class="mb-4 text-red-500 text-sm text-center">
                    {{ error }}
                </div>
                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    :disabled="loading">
                    {{ loading ? 'Logging in...' : 'Login' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const { login } = useAuth()

const handleLogin = async () => {
    loading.value = true
    error.value = ''
    try {
        await login(username.value, password.value)
    } catch (e) {
        error.value = e.data?.message || 'Login failed'
    } finally {
        loading.value = false
    }
}

useHead({
    title: 'התחבר',
})
</script>
