// Обёртка для localStorage с префиксом пользователя
const UserStorage = {
	getKey(key) {
		const session = localStorage.getItem('dashboard-session')
		if (session) {
			try {
				const s = JSON.parse(session)
				return `${s.username}_${key}`
			} catch {}
		}
		return key
	},

	get(key, defaultValue = null) {
		try {
			const data = localStorage.getItem(this.getKey(key))
			return data ? JSON.parse(data) : defaultValue
		} catch {
			return defaultValue
		}
	},

	set(key, value) {
		localStorage.setItem(this.getKey(key), JSON.stringify(value))
	},

	remove(key) {
		localStorage.removeItem(this.getKey(key))
	},
}
