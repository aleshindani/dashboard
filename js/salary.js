class SalaryCalculator {
	constructor() {
		this.currentDate = new Date()
		this.selectedDate = new Date()
		this.dailyRate = 2500
		this.issuesDeduction = 100
		this.issuesMultiplier = 3
		this.issues = UserStorage.get('salary-issues', {})
		this.init()
	}

	init() {
		this.render()
		document
			.getElementById('salaryPrevMonth')
			?.addEventListener('click', () => {
				this.currentDate.setMonth(this.currentDate.getMonth() - 1)
				this.render()
			})
		document
			.getElementById('salaryNextMonth')
			?.addEventListener('click', () => {
				this.currentDate.setMonth(this.currentDate.getMonth() + 1)
				this.render()
			})
		document.getElementById('salaryTodayBtn')?.addEventListener('click', () => {
			this.currentDate = new Date()
			this.selectedDate = new Date()
			this.render()
		})
		document
			.getElementById('issuesInputPanel')
			?.addEventListener('click', e => {
				if (e.target.id === 'saveIssuesBtn') this.saveCurrentIssues()
			})
		document
			.getElementById('issuesInputPanel')
			?.addEventListener('keydown', e => {
				if (e.key === 'Enter' && e.target.id === 'issuesInput')
					this.saveCurrentIssues()
			})
	}

	getDateKey(date) {
		const d = new Date(date)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
			2,
			'0'
		)}-${String(d.getDate()).padStart(2, '0')}`
	}
	getIssues(dateKey) {
		return this.issues[dateKey] || 0
	}

	saveCurrentIssues() {
		const input = document.getElementById('issuesInput')
		if (!input) return
		const value = parseInt(input.value) || 0
		const dateKey = this.getDateKey(this.selectedDate)
		if (value > 0) this.issues[dateKey] = value
		else delete this.issues[dateKey]
		UserStorage.set('salary-issues', this.issues)
		this.render()
	}

	selectDate(dateKey) {
		const [y, m, d] = dateKey.split('-').map(Number)
		this.selectedDate = new Date(y, m - 1, d)
		this.render()
	}

	getWorkDays() {
		const year = this.currentDate.getFullYear(),
			month = this.currentDate.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()
		const calendarEvents = UserStorage.get('calendar-events', {})
		const workDays = []
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day),
				dateKey = this.getDateKey(date)
			if (calendarEvents[dateKey] === 'work')
				workDays.push({
					date: dateKey,
					day,
					dayOfWeek: date.getDay(),
					isToday: dateKey === this.getDateKey(new Date()),
				})
		}
		return workDays
	}

	calcDaily(issuesCount) {
		const base = this.dailyRate
		const bonus =
			Math.max(0, issuesCount - this.issuesDeduction) * this.issuesMultiplier
		return { base, issuesBonus: bonus, total: base + bonus }
	}

	isWorkDay(dateKey) {
		const ce = UserStorage.get('calendar-events', {})
		return ce[dateKey] === 'work'
	}

	render() {
		this.renderMonthLabel()
		this.renderInputPanel()
		this.renderSummary()
		this.renderDaysList()
	}

	renderMonthLabel() {
		const months = [
			'Январь',
			'Февраль',
			'Март',
			'Апрель',
			'Май',
			'Июнь',
			'Июль',
			'Август',
			'Сентябрь',
			'Октябрь',
			'Ноябрь',
			'Декабрь',
		]
		const el = document.getElementById('salaryMonthYear')
		if (el)
			el.textContent = `${
				months[this.currentDate.getMonth()]
			} ${this.currentDate.getFullYear()}`
	}

	renderInputPanel() {
		const panel = document.getElementById('issuesInputPanel')
		if (!panel) return
		const dateKey = this.getDateKey(this.selectedDate)
		const currentIssues = this.getIssues(dateKey)
		const isToday = dateKey === this.getDateKey(new Date())
		const isWorkDay = this.isWorkDay(dateKey)
		const day = this.selectedDate.getDate()
		const months = [
			'Января',
			'Февраля',
			'Марта',
			'Апреля',
			'Мая',
			'Июня',
			'Июля',
			'Августа',
			'Сентября',
			'Октября',
			'Ноября',
			'Декабря',
		]
		const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
		const dateStr = `${day} ${months[this.selectedDate.getMonth()]}, ${
			days[this.selectedDate.getDay()]
		}`
		panel.innerHTML = `<div class="issues-panel-header"><div class="issues-date-display"><span class="issues-date-icon">${
			isToday ? '📍' : '📅'
		}</span><span class="issues-date-text">${dateStr}</span>${
			isToday ? '<span class="issues-today-badge">Сегодня</span>' : ''
		}${
			!isWorkDay ? '<span class="issues-warn-badge">Не рабочий день</span>' : ''
		}</div></div>
        <div class="issues-input-row"><div class="issues-input-group"><label class="issues-input-label">Количество выдач</label><div class="issues-input-wrap"><input type="number" class="issues-main-input" id="issuesInput" value="${
					currentIssues || ''
				}" placeholder="0" min="0"><button class="issues-save-btn" id="saveIssuesBtn">💾 Сохранить</button></div></div>
        <div class="issues-preview"><div class="issues-preview-label">Расчёт бонуса:</div><div class="issues-preview-formula">(${currentIssues} − 100) × 3₽ = <strong>${this.formatMoney(
			Math.max(0, currentIssues - this.issuesDeduction) * this.issuesMultiplier
		)}</strong></div><div class="issues-preview-total">Итого за день: <strong>${this.formatMoney(
			this.calcDaily(currentIssues).total
		)}</strong></div></div></div>`
	}

	renderSummary() {
		const workDays = this.getWorkDays()
		let totalBase = workDays.length * this.dailyRate,
			totalIssues = 0,
			totalBonus = 0
		workDays.forEach(d => {
			const iss = this.getIssues(d.date)
			totalIssues += iss
			totalBonus +=
				Math.max(0, iss - this.issuesDeduction) * this.issuesMultiplier
		})
		document.getElementById('salaryWorkDays').textContent = workDays.length
		document.getElementById('salaryTotalIssues').textContent = totalIssues
		document.getElementById('salaryIssues').textContent =
			'+' + this.formatMoney(totalBonus)
		document.getElementById('salaryGrandTotal').textContent = this.formatMoney(
			totalBase + totalBonus
		)
	}

	renderDaysList() {
		const list = document.getElementById('salaryDaysList')
		if (!list) return
		const workDays = this.getWorkDays()
		const selKey = this.getDateKey(this.selectedDate)
		const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
		if (!workDays.length) {
			list.innerHTML = '<div class="salary-empty-state">Нет рабочих дней</div>'
			return
		}
		list.innerHTML = workDays
			.map(d => {
				const iss = this.getIssues(d.date),
					calc = this.calcDaily(iss)
				const [y, m, dd] = d.date.split('-')
				const isSel = d.date === selKey
				return `<div class="salary-day-item ${isSel ? 'selected' : ''} ${
					d.isToday ? 'today' : ''
				}" data-date="${d.date}" onclick="window.salaryCalculator.selectDate('${
					d.date
				}')">
                <div class="salary-day-left"><span class="salary-day-date">${parseInt(
									dd
								)}</span><span class="salary-day-weekday">${
					days[d.dayOfWeek]
				}</span></div>
                <div class="salary-day-center"><span class="salary-day-issues">${
									iss > 0 ? iss + ' выд.' : '—'
								}</span>${
					calc.issuesBonus > 0
						? `<span class="salary-day-bonus">+${this.formatMoney(
								calc.issuesBonus
						  )}</span>`
						: ''
				}</div>
                <div class="salary-day-right"><span class="salary-day-total">${this.formatMoney(
									calc.total
								)}</span>${
					isSel ? '<span class="salary-day-edit">✏️</span>' : ''
				}</div></div>`
			})
			.join('')
	}

	formatMoney(n) {
		return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
	}
}
document.addEventListener('DOMContentLoaded', () => {
	window.salaryCalculator = new SalaryCalculator()
})
