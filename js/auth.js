const USERS_KEY = 'dashboard-users'

// Получить текущего пользователя
function getCurrentUser() {
	try {
		const session = JSON.parse(localStorage.getItem('dashboard-session'))
		return session ? session.username : null
	} catch {
		return null
	}
}

// Получить ключ с префиксом пользователя
function userKey(key) {
	const user = getCurrentUser()
	return user ? `${user}_${key}` : key
}

// Встроенные пользователи
function getDefaultUsers() {
	return [
		{ username: 'admin', password: 'admin123', name: 'Админ', role: 'admin' },
		{
			username: 'user',
			password: 'user123',
			name: 'Пользователь',
			role: 'user',
		},
	]
}

function getUsers() {
	let data = localStorage.getItem(USERS_KEY)
	if (data) {
		try {
			return JSON.parse(data)
		} catch (e) {}
	}
	const def = getDefaultUsers()
	localStorage.setItem(USERS_KEY, JSON.stringify(def))
	return def
}

function saveUsers(users) {
	localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Проверка авторизации
;(function () {
	const session = localStorage.getItem('dashboard-session')

	if (!session) {
		window.location.href = 'login.html'
		return
	}

	try {
		const s = JSON.parse(session)
		const hours = (new Date() - new Date(s.loginTime)) / 3600000

		if (hours > 24) {
			localStorage.removeItem('dashboard-session')
			window.location.href = 'login.html'
			return
		}

		document.addEventListener('DOMContentLoaded', () => {
			const av = document.querySelector('.avatar')
			if (av && s.name) {
				av.textContent = s.name.charAt(0).toUpperCase()
				av.title = s.name
			}

			const mod = document.querySelector('.nav-item[data-page="moderation"]')
			if (mod) {
				mod.style.display = s.role === 'admin' ? 'flex' : 'none'
			}

			const lo = document.querySelector('.nav-item[data-page="logout"]')
			if (lo) {
				lo.addEventListener('click', e => {
					e.preventDefault()
					if (confirm('Выйти из системы?')) {
						localStorage.removeItem('dashboard-session')
						window.location.href = 'login.html'
					}
				})
			}
		})
	} catch (e) {
		localStorage.removeItem('dashboard-session')
		window.location.href = 'login.html'
	}
})()
