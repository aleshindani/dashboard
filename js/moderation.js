class Moderation {
	constructor() {
		this.KEY = 'dashboard-users'
		this.users = []
		this.init()
	}

	init() {
		this.load()
		this.render()
		document
			.getElementById('addUserBtn')
			?.addEventListener('click', () => this.open())
		document
			.getElementById('cancelUserBtn')
			?.addEventListener('click', () => this.close())
		document
			.getElementById('saveUserBtn')
			?.addEventListener('click', () => this.save())
		document
			.getElementById('userModalOverlay')
			?.addEventListener('click', e => {
				if (e.target === e.currentTarget) this.close()
			})
	}

	load() {
		const d = localStorage.getItem(this.KEY)
		this.users = d ? JSON.parse(d) : []
	}

	saveData() {
		localStorage.setItem(this.KEY, JSON.stringify(this.users))
		this.render()
	}

	open(user) {
		document.getElementById('userModalTitle').textContent = user
			? 'Редактировать'
			: 'Добавить'
		document.getElementById('modalUsername').value = user ? user.username : ''
		document.getElementById('modalPassword').value = user ? user.password : ''
		document.getElementById('modalName').value = user ? user.name : ''
		document.getElementById('modalRole').value = user ? user.role : 'user'
		document.getElementById('modalUsername').dataset.edit = user
			? user.username
			: ''
		document.getElementById('userModalOverlay').classList.add('active')
	}

	close() {
		document.getElementById('userModalOverlay').classList.remove('active')
	}

	save() {
		const u = document.getElementById('modalUsername').value.trim()
		const p = document.getElementById('modalPassword').value.trim()
		const n = document.getElementById('modalName').value.trim()
		const r = document.getElementById('modalRole').value
		const edit = document.getElementById('modalUsername').dataset.edit

		if (!u || !p || !n) {
			alert('Заполните все поля')
			return
		}

		if (edit) {
			const user = this.users.find(x => x.username === edit)
			if (user) {
				if (u !== edit && this.users.find(x => x.username === u)) {
					alert('Пользователь с таким логином уже есть')
					return
				}
				user.username = u
				user.password = p
				user.name = n
				user.role = r
			}
		} else {
			if (this.users.find(x => x.username === u)) {
				alert('Пользователь с таким логином уже есть')
				return
			}
			this.users.push({ username: u, password: p, name: n, role: r })
		}

		this.saveData()
		this.close()
	}

	del(username) {
		const s = JSON.parse(localStorage.getItem('dashboard-session') || '{}')
		if (username === s.username) {
			alert('Нельзя удалить себя')
			return
		}
		if (!confirm('Удалить ' + username + '?')) return
		this.users = this.users.filter(x => x.username !== username)
		this.saveData()
	}

	render() {
		const t = document.getElementById('usersTableBody')
		if (!t) return
		if (!this.users.length) {
			t.innerHTML =
				'<tr><td colspan="4" style="text-align:center;padding:40px;color:#9ba1b0;">Нет пользователей</td></tr>'
			return
		}
		t.innerHTML = this.users
			.map(
				u => `
            <tr>
                <td><strong>${u.username}</strong></td>
                <td>${u.name}</td>
                <td><span style="padding:3px 10px;border-radius:12px;font-size:.7rem;font-weight:600;background:${
									u.role === 'admin'
										? 'rgba(108,99,255,.2)'
										: 'rgba(107,114,128,.2)'
								};color:${u.role === 'admin' ? '#8b85ff' : '#9ca3af'}">${
					u.role === 'admin' ? 'Админ' : 'Пользователь'
				}</span></td>
                <td>
                    <button onclick="window.moderation.open(window.moderation.users.find(x=>x.username==='${
											u.username
										}'))" style="width:30px;height:30px;border-radius:6px;border:1px solid #2a2d3a;background:#1a1d27;cursor:pointer;margin-right:4px;">✏️</button>
                    <button onclick="window.moderation.del('${
											u.username
										}')" style="width:30px;height:30px;border-radius:6px;border:1px solid #2a2d3a;background:#1a1d27;cursor:pointer;color:#ef4444;">🗑️</button>
                </td>
            </tr>
        `
			)
			.join('')
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (document.getElementById('usersTableBody')) {
		window.moderation = new Moderation()
	}
})
