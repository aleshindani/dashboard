class Analytics {
	constructor() {
		this.init()
	}
	init() {
		this.renderFinanceChart()
		this.renderCalendarChart()
		this.renderTasksChart()
		this.renderSalaryChart()
		this.renderHealthChart()
		this.renderFunStats()
	}

	load(key) {
		return UserStorage.get(key, [])
	}

	renderFinanceChart() {
		const c = document.getElementById('financeBars')
		if (!c) return
		const tr = this.load('fin-transactions'),
			bills = this.load('fin-bills')
		const months = {}
		const now = new Date()
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
			const k = d.toISOString().slice(0, 7)
			months[k] = { income: 0, expense: 0, label: this.monthName(d) }
		}
		tr.forEach(t => {
			const k = t.date.slice(0, 7)
			if (months[k]) {
				if (t.type === 'income') months[k].income += t.amount
				else months[k].expense += t.amount
			}
		})
		bills.forEach(b => {
			const k = b.date.slice(0, 7)
			if (months[k] && !b.paid) months[k].expense += b.amount
		})
		const data = Object.values(months)
		const max = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1)
		if (data.every(d => d.income === 0 && d.expense === 0)) {
			c.innerHTML = '<div class="analytics-empty">Нет данных</div>'
			return
		}
		c.innerHTML = data
			.map(d => {
				const iw = Math.max((d.income / max) * 100, 0),
					ew = Math.max((d.expense / max) * 100, 0)
				return `<div style="margin-bottom:12px"><div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:4px">${
					d.label
				}</div><div class="chart-bar-row"><span class="chart-bar-label">Доход</span><div class="chart-bar-track"><div class="chart-bar-fill income" style="width:${iw}%">${
					iw > 15 ? this.fmt(d.income) : ''
				}</div></div><span class="chart-bar-value">${this.fmt(
					d.income
				)}</span></div><div class="chart-bar-row"><span class="chart-bar-label">Расход</span><div class="chart-bar-track"><div class="chart-bar-fill expense" style="width:${ew}%">${
					ew > 15 ? this.fmt(d.expense) : ''
				}</div></div><span class="chart-bar-value">${this.fmt(
					d.expense
				)}</span></div></div>`
			})
			.join('')
	}

	renderCalendarChart() {
		const c = document.getElementById('calendarDonut')
		if (!c) return
		const events = UserStorage.get('calendar-events', {})
		const now = new Date(),
			y = now.getFullYear(),
			m = now.getMonth(),
			days = new Date(y, m + 1, 0).getDate()
		const stats = {
			work: 0,
			study: 0,
			exam: 0,
			session: 0,
			diploma: 0,
			dayoff: 0,
			none: 0,
		}
		for (let d = 1; d <= days; d++) {
			const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(
				2,
				'0'
			)}`
			const t = events[k] || 'none'
			stats[t]++
		}
		const colors = {
			work: '#3b82f6',
			study: '#8b5cf6',
			exam: '#ef4444',
			session: '#f59e0b',
			diploma: '#10b981',
			dayoff: '#6b7280',
			none: '#374151',
		}
		const labels = {
			work: '💼 Работа',
			study: '📚 Учёба',
			exam: '📝 Экзамен',
			session: '🎓 Сессия',
			diploma: '🏆 Диплом',
			dayoff: '🏖️ Выходной',
			none: '❔ Без отметки',
		}
		const active = Object.entries(stats).filter(([_, v]) => v > 0)
		if (!active.length) {
			c.innerHTML = '<div class="analytics-empty">Нет данных</div>'
			return
		}
		c.innerHTML = `<div class="donut-legend">${active
			.map(
				([t, v]) =>
					`<div class="donut-legend-item"><span class="donut-dot" style="background:${
						colors[t]
					}"></span><span>${
						labels[t]
					}</span><strong style="margin-left:auto">${v} дн.</strong><span style="color:var(--text-secondary);font-size:0.7rem">(${Math.round(
						(v / days) * 100
					)}%)</span></div>`
			)
			.join('')}</div>`
	}

	renderTasksChart() {
		const c = document.getElementById('tasksProgress')
		if (!c) return
		const tasks = this.load('dashboard-tasks')
		const total = tasks.length,
			completed = tasks.filter(t => t.completed).length,
			active = total - completed,
			percent = total ? Math.round((completed / total) * 100) : 0,
			overdue = tasks.filter(
				t => !t.completed && t.date < new Date().toISOString().slice(0, 10)
			).length
		if (!total) {
			c.innerHTML = '<div class="analytics-empty">Нет задач</div>'
			return
		}
		c.innerHTML = `<div class="progress-circle" style="--progress:${percent}%"><div class="progress-inner"><div class="progress-value">${percent}%</div><div class="progress-label">выполнено</div></div></div><div class="progress-details"><div class="progress-stat"><div class="progress-stat-value">${completed}</div><div class="progress-stat-label">✅ Выполнено</div></div><div class="progress-stat"><div class="progress-stat-value">${active}</div><div class="progress-stat-label">📋 В работе</div></div><div class="progress-stat"><div class="progress-stat-value" style="color:#ef4444">${overdue}</div><div class="progress-stat-label">⚠️ Просрочено</div></div></div>`
	}

	renderSalaryChart() {
		const c = document.getElementById('salaryAvg')
		if (!c) return
		const issues = UserStorage.get('salary-issues', {}),
			events = UserStorage.get('calendar-events', {})
		const now = new Date()
		let total = 0,
			months = 0
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1),
				y = d.getFullYear(),
				m = d.getMonth(),
				days = new Date(y, m + 1, 0).getDate()
			let wd = 0,
				ms = 0
			for (let day = 1; day <= days; day++) {
				const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(
					day
				).padStart(2, '0')}`
				if (events[k] === 'work') {
					wd++
					const iss = issues[k] || 0
					ms += 2500 + Math.max(0, iss - 100) * 3
				}
			}
			if (wd > 0) {
				total += ms
				months++
			}
		}
		const avg = months ? Math.round(total / months) : 0
		if (!avg) {
			c.innerHTML = '<div class="analytics-empty">Нет данных</div>'
			return
		}
		c.innerHTML = `<div class="big-number-value">${this.fmt(
			avg
		)}</div><div class="big-number-label">средняя зарплата</div><div class="big-number-sub">за ${months} мес.</div>`
	}

	renderHealthChart() {
		const grid = document.querySelector('.analytics-grid')
		if (!grid) return
		const records = UserStorage.get('health-records', [])
		const today = new Date().toISOString().slice(0, 10),
			todayRecords = records.filter(r => r.date === today)
		let avgSugar = '--',
			status = 'Нет данных',
			color = 'var(--text-secondary)'
		if (todayRecords.length) {
			avgSugar = (
				todayRecords.reduce((s, r) => s + r.sugar, 0) / todayRecords.length
			).toFixed(1)
			const s = parseFloat(avgSugar)
			if (s < 4) {
				status = 'Низкий ⚠️'
				color = '#3b82f6'
			} else if (s <= 7) {
				status = 'Норма ✅'
				color = '#4ade80'
			} else if (s <= 10) {
				status = 'Повышен ⚡'
				color = '#f59e0b'
			} else {
				status = 'Высокий 🔴'
				color = '#ef4444'
			}
		}
		if (!document.getElementById('healthAnalyticsCard')) {
			const card = document.createElement('div')
			card.className = 'analytics-card'
			card.id = 'healthAnalyticsCard'
			card.innerHTML =
				'<div class="analytics-card-title">🩸 Здоровье</div><div class="analytics-chart" id="healthAnalytics"></div>'
			grid.appendChild(card)
		}
		const cont = document.getElementById('healthAnalytics')
		if (!cont) return
		cont.innerHTML = `<div style="text-align:center"><div style="font-size:2.5rem;font-weight:800;color:${color}">${avgSugar}</div><div style="font-size:0.8rem;color:${color};margin-bottom:12px">${status}</div><div class="progress-details"><div class="progress-stat"><div class="progress-stat-value">${todayRecords.reduce(
			(s, r) => s + r.insulin,
			0
		)}</div><div class="progress-stat-label">💉 Инсулин</div></div><div class="progress-stat"><div class="progress-stat-value">${todayRecords.reduce(
			(s, r) => s + r.bread,
			0
		)}</div><div class="progress-stat-label">🍞 ХЕ</div></div><div class="progress-stat"><div class="progress-stat-value">${
			todayRecords.length
		}</div><div class="progress-stat-label">📊 Замеров</div></div></div></div>`
	}

	renderFunStats() {
		const grid = document.querySelector('.analytics-grid')
		if (!grid) return
		const places = UserStorage.get('fun-places', []),
			food = UserStorage.get('fun-food', []),
			watch = UserStorage.get('fun-watch', []),
			shopping = UserStorage.get('fun-shopping', [])
		if (!document.getElementById('funAnalyticsCard')) {
			const card = document.createElement('div')
			card.className = 'analytics-card'
			card.id = 'funAnalyticsCard'
			card.innerHTML =
				'<div class="analytics-card-title">🎯 Развлечения</div><div class="analytics-chart" id="funAnalytics"></div>'
			grid.appendChild(card)
		}
		const cont = document.getElementById('funAnalytics')
		if (!cont) return
		cont.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%"><div style="text-align:center;padding:8px;background:var(--bg-secondary);border-radius:8px"><div style="font-size:1.5rem">📍</div><div style="font-weight:700">${
			places.filter(p => p.visited).length
		}/${
			places.length
		}</div><div style="font-size:0.65rem;color:var(--text-secondary)">Мест</div></div><div style="text-align:center;padding:8px;background:var(--bg-secondary);border-radius:8px"><div style="font-size:1.5rem">🍽️</div><div style="font-weight:700">${
			food.filter(f => f.rating === 'tasty').length
		}/${
			food.length
		}</div><div style="font-size:0.65rem;color:var(--text-secondary)">Вкусно</div></div><div style="text-align:center;padding:8px;background:var(--bg-secondary);border-radius:8px"><div style="font-size:1.5rem">🎬</div><div style="font-weight:700">${
			watch.filter(w => w.watched).length
		}/${
			watch.length
		}</div><div style="font-size:0.65rem;color:var(--text-secondary)">Просмотрено</div></div><div style="text-align:center;padding:8px;background:var(--bg-secondary);border-radius:8px"><div style="font-size:1.5rem">🛍️</div><div style="font-weight:700">${
			shopping.filter(s => s.bought).length
		}/${
			shopping.length
		}</div><div style="font-size:0.65rem;color:var(--text-secondary)">Куплено</div></div></div>`
	}

	monthName(d) {
		const n = [
			'Янв',
			'Фев',
			'Мар',
			'Апр',
			'Май',
			'Июн',
			'Июл',
			'Авг',
			'Сен',
			'Окт',
			'Ноя',
			'Дек',
		]
		return n[d.getMonth()] + ' ' + d.getFullYear()
	}
	fmt(n) {
		if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M ₽'
		if (n >= 1000) return (n / 1000).toFixed(1) + 'K ₽'
		return new Intl.NumberFormat('ru-RU').format(Math.abs(n)) + ' ₽'
	}
}
document.addEventListener('DOMContentLoaded', () => {
	window.analytics = new Analytics()
})
