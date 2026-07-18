class Goals {
	constructor() {
		this.goals = UserStorage.get('goals-list', [])
		this.xp = UserStorage.get('goals-xp', { xp: 0, level: 1, achievements: [] })
		this.init()
	}
	saveGoals() {
		UserStorage.set('goals-list', this.goals)
	}
	saveXP() {
		UserStorage.set('goals-xp', this.xp)
	}
	xpForLevel(l) {
		return l * 100
	}
	addXP(amount) {
		this.xp.xp += amount
		const needed = this.xpForLevel(this.xp.level)
		if (this.xp.xp >= needed) {
			this.xp.xp -= needed
			this.xp.level++
			this.checkAchievements()
			setTimeout(() => alert(`🎉 Уровень ${this.xp.level}!`), 100)
		}
		this.saveXP()
		this.renderXP()
	}
	checkAchievements() {
		const all = [
			{
				id: 'first_goal',
				name: 'Первая цель',
				desc: 'Создать первую цель',
				icon: '🎯',
				check: () => this.goals.length >= 1,
			},
			{
				id: 'five_goals',
				name: 'Планировщик',
				desc: 'Создать 5 целей',
				icon: '📋',
				check: () => this.goals.length >= 5,
			},
			{
				id: 'first_complete',
				name: 'Готово!',
				desc: 'Выполнить первую цель',
				icon: '✅',
				check: () => this.goals.some(g => g.progress >= 100),
			},
			{
				id: 'level5',
				name: 'Опытный',
				desc: 'Достигнуть 5 уровня',
				icon: '⭐',
				check: () => this.xp.level >= 5,
			},
		]
		all.forEach(a => {
			if (!this.xp.achievements.includes(a.id) && a.check()) {
				this.xp.achievements.push(a.id)
				this.addXP(50)
				setTimeout(() => alert(`🏆 ${a.name}! +50 XP`), 200)
			}
		})
		this.saveXP()
	}
	init() {
		this.renderAll()
		this.renderXP()
		this.checkAchievements()
		document.getElementById('addGoalBtn').onclick = () => this.showModal()
		document.getElementById('cancelGoalBtn').onclick = () => this.hideModal()
		document.getElementById('saveGoalBtn').onclick = () => this.saveGoal()
	}
	showModal() {
		document.getElementById('goalModalTitle').textContent = 'Новая цель'
		document.getElementById('goalName').value = ''
		document.getElementById('goalDesc').value = ''
		document.getElementById('goalProgress').value = '0'
		document.getElementById('goalCategory').value = 'personal'
		document.getElementById('goalName').dataset.editId = ''
		document.getElementById('goalParentGroup').style.display = 'none'
		document.getElementById('goalModal').classList.add('active')
	}
	hideModal() {
		document.getElementById('goalModal').classList.remove('active')
	}
	saveGoal() {
		const n = document.getElementById('goalName').value.trim(),
			d = document.getElementById('goalDesc').value.trim(),
			p = Math.min(
				100,
				Math.max(
					0,
					parseInt(document.getElementById('goalProgress').value) || 0
				)
			),
			c = document.getElementById('goalCategory').value
		if (!n) {
			alert('Введите название')
			return
		}
		this.goals.unshift({
			id: Date.now().toString(),
			name: n,
			desc: d,
			progress: p,
			category: c,
		})
		this.saveGoals()
		this.addXP(15)
		this.checkAchievements()
		this.renderAll()
		this.hideModal()
	}
	updateProgress(id, delta) {
		const g = this.goals.find(x => x.id === id)
		if (g) {
			g.progress = Math.min(100, Math.max(0, g.progress + delta))
			if (g.progress >= 100) this.addXP(30)
			this.saveGoals()
			this.renderAll()
		}
	}
	deleteGoal(id) {
		if (!confirm('Удалить?')) return
		this.goals = this.goals.filter(g => g.id !== id)
		this.saveGoals()
		this.renderAll()
	}
	renderAll() {
		this.renderGoals()
		this.renderAchievements()
	}
	renderXP() {
		const needed = this.xpForLevel(this.xp.level)
		document.getElementById('xpLevel').textContent = `Уровень ${this.xp.level}`
		document.getElementById('xpBar').style.width = `${
			(this.xp.xp / needed) * 100
		}%`
		document.getElementById(
			'xpText'
		).textContent = `${this.xp.xp} / ${needed} XP`
	}
	renderGoals() {
		const list = document.getElementById('goalsList')
		if (!list) return
		if (!this.goals.length) {
			list.innerHTML = '<p class="empty-text">Нет целей</p>'
			return
		}
		const cats = {
			personal: '👤 Личное',
			work: '💼 Работа',
			health: '🩸 Здоровье',
			finance: '💰 Финансы',
			learn: '📚 Обучение',
			other: '📌 Другое',
		}
		list.innerHTML = this.goals
			.map(
				g =>
					`<div class="goal-card ${
						g.progress >= 100 ? 'completed' : ''
					}"><div class="goal-header"><span class="goal-name">${this.esc(
						g.name
					)}</span><span class="goal-category">${
						cats[g.category] || g.category
					}</span></div>${
						g.desc ? `<div class="goal-desc">${this.esc(g.desc)}</div>` : ''
					}<div class="goal-progress-wrap"><div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${
						g.progress
					}%"></div></div><div class="goal-progress-text"><span>Прогресс</span><span>${
						g.progress
					}%</span></div></div><div class="goal-actions"><button class="goal-btn progress-btn" onclick="window.goals.updateProgress('${
						g.id
					}',10)">+10%</button><button class="goal-btn progress-btn" onclick="window.goals.updateProgress('${
						g.id
					}',-10)">-10%</button><button class="goal-btn delete-btn" onclick="window.goals.deleteGoal('${
						g.id
					}')">🗑️</button></div></div>`
			)
			.join('')
	}
	renderAchievements() {
		const list = document.getElementById('achievementsList')
		if (!list) return
		const all = [
			{
				id: 'first_goal',
				name: 'Первая цель',
				desc: 'Создать первую цель',
				icon: '🎯',
			},
			{
				id: 'five_goals',
				name: 'Планировщик',
				desc: 'Создать 5 целей',
				icon: '📋',
			},
			{
				id: 'first_complete',
				name: 'Готово!',
				desc: 'Выполнить первую цель',
				icon: '✅',
			},
			{
				id: 'level5',
				name: 'Опытный',
				desc: 'Достигнуть 5 уровня',
				icon: '⭐',
			},
		]
		list.innerHTML = all
			.map(a => {
				const u = this.xp.achievements.includes(a.id)
				return `<div class="achievement-item ${
					u ? 'unlocked' : 'locked'
				}"><span class="achievement-icon">${
					a.icon
				}</span><div class="achievement-info"><div class="achievement-name">${
					a.name
				}</div><div class="achievement-desc">${a.desc}</div></div>${
					u
						? '<span style="color:#fbbf24;">✓</span>'
						: '<span style="opacity:0.3;">🔒</span>'
				}</div>`
			})
			.join('')
	}
	esc(t) {
		const d = document.createElement('div')
		d.textContent = t
		return d.innerHTML
	}
}
document.addEventListener('DOMContentLoaded', () => {
	window.goals = new Goals()
})
