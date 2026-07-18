class Calendar {
	constructor() {
		this.currentDate = new Date()
		this.selectedDate = new Date()
		this.events = UserStorage.get('calendar-events', {})
		this.calendarGrid = document.getElementById('calendarGrid')
		this.currentMonthYear = document.getElementById('currentMonthYear')
		this.selectedDayInfo = document.getElementById('selectedDayInfo')
		this.init()
	}

	init() {
		this.renderCalendar()
		this.updateMonthStats()
		this.updateTodayWidget()
		this.startTimeUpdate()
		document
			.getElementById('prevMonth')
			?.addEventListener('click', () => this.navigateMonth(-1))
		document
			.getElementById('nextMonth')
			?.addEventListener('click', () => this.navigateMonth(1))
		document
			.getElementById('todayBtn')
			?.addEventListener('click', () => this.goToToday())
		document.querySelectorAll('.quick-action-btn').forEach(btn => {
			btn.addEventListener('click', e =>
				this.setSelectedDayType(btn.getAttribute('data-type'))
			)
		})
		window.addEventListener('themeChanged', () => this.renderCalendar())
	}

	getDateKey(date) {
		const d = new Date(date)
		return (
			d.getFullYear() +
			'-' +
			String(d.getMonth() + 1).padStart(2, '0') +
			'-' +
			String(d.getDate()).padStart(2, '0')
		)
	}

	getEvent(date) {
		return this.events[this.getDateKey(date)] || null
	}
	getEventIcon(type) {
		const icons = {
			work: '💼',
			study: '📚',
			exam: '📝',
			session: '🎓',
			diploma: '🏆',
			dayoff: '🏖️',
		}
		return icons[type] || ''
	}

	setEvent(date, type) {
		const key = this.getDateKey(date)
		if (type === 'none' || !type) delete this.events[key]
		else this.events[key] = type
		UserStorage.set('calendar-events', this.events)
		this.renderCalendar()
		this.updateMonthStats()
		this.updateTodayWidget()
		this.updateSelectedDayInfo()
	}

	navigateMonth(delta) {
		this.currentDate.setMonth(this.currentDate.getMonth() + delta)
		this.renderCalendar()
		this.updateMonthStats()
	}
	goToToday() {
		this.currentDate = new Date()
		this.selectedDate = new Date()
		this.renderCalendar()
		this.updateMonthStats()
		this.updateSelectedDayInfo()
	}
	selectDay(date) {
		this.selectedDate = new Date(date)
		this.renderCalendar()
		this.updateSelectedDayInfo()
	}
	getDaysInMonth(y, m) {
		return new Date(y, m + 1, 0).getDate()
	}
	getFirstDayOfMonth(y, m) {
		let d = new Date(y, m, 1).getDay()
		return d === 0 ? 6 : d - 1
	}

	getMonthStats(y, m) {
		const days = this.getDaysInMonth(y, m)
		const stats = {
			work: 0,
			study: 0,
			exam: 0,
			session: 0,
			diploma: 0,
			dayoff: 0,
		}
		for (let d = 1; d <= days; d++) {
			const e = this.getEvent(new Date(y, m, d))
			if (e && stats.hasOwnProperty(e)) stats[e]++
		}
		return stats
	}

	renderCalendar() {
		const y = this.currentDate.getFullYear(),
			m = this.currentDate.getMonth()
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
		if (this.currentMonthYear)
			this.currentMonthYear.textContent = months[m] + ' ' + y
		const daysIn = this.getDaysInMonth(y, m),
			first = this.getFirstDayOfMonth(y, m)
		const today = new Date(),
			todayKey = this.getDateKey(today)
		let html = ''
		for (let i = 0; i < first; i++)
			html += '<div class="calendar-day empty"></div>'
		for (let d = 1; d <= daysIn; d++) {
			const date = new Date(y, m, d),
				key = this.getDateKey(date),
				event = this.getEvent(date)
			const hasTasks =
				window.taskManager && window.taskManager.hasTasksForDate(key)
			let classes = ['calendar-day']
			if (key === todayKey) classes.push('today')
			if (key === this.getDateKey(this.selectedDate)) classes.push('selected')
			if (event) classes.push(event)
			if (hasTasks) classes.push('has-tasks')
			html += `<div class="${classes.join(
				' '
			)}" data-date="${key}" data-day="${d}" title="${
				event ? this.getEventLabel(event) : ''
			}">
                <span class="day-number">${d}</span>${
				event ? `<span class="day-icon">${this.getEventIcon(event)}</span>` : ''
			}
            </div>`
		}
		if (this.calendarGrid) {
			this.calendarGrid.innerHTML = html
			this.calendarGrid
				.querySelectorAll('.calendar-day:not(.empty)')
				.forEach(cell => {
					cell.addEventListener('click', () => {
						const [yy, mm, dd] = cell
							.getAttribute('data-date')
							.split('-')
							.map(Number)
						this.selectDay(new Date(yy, mm - 1, dd))
					})
				})
		}
	}

	getEventLabel(type) {
		const l = {
			work: '💼 Работа',
			study: '📚 Учёба',
			exam: '📝 Экзамен',
			session: '🎓 Сессия',
			diploma: '🏆 Диплом',
			dayoff: '🏖️ Выходной',
		}
		return l[type] || ''
	}

	updateMonthStats() {
		const s = this.getMonthStats(
			this.currentDate.getFullYear(),
			this.currentDate.getMonth()
		)
		const map = {
			work: 'statWork',
			study: 'statStudy',
			exam: 'statExam',
			session: 'statSession',
			diploma: 'statDiploma',
			dayoff: 'statDayoff',
		}
		Object.keys(map).forEach(k => {
			const el = document.getElementById(map[k])
			if (el) el.textContent = s[k]
		})
		this.updateMainSummary(s)
	}

	updateMainSummary(s) {
		const ss = document.getElementById('summaryStats'),
			ml = document.getElementById('summaryMonthLabel')
		if (!ss) return
		if (ml) {
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
			ml.textContent =
				months[new Date().getMonth()] + ' ' + new Date().getFullYear()
		}
		const items = [
			{ k: 'work', i: '💼', l: 'Раб.', c: '#3b82f6' },
			{ k: 'study', i: '📚', l: 'Учёба', c: '#8b5cf6' },
			{ k: 'exam', i: '📝', l: 'Экз.', c: '#ef4444' },
			{ k: 'session', i: '🎓', l: 'Сесс.', c: '#f59e0b' },
			{ k: 'diploma', i: '🏆', l: 'Дипл.', c: '#10b981' },
			{ k: 'dayoff', i: '🏖️', l: 'Вых.', c: '#9ca3af' },
		]
		const active = items.filter(x => s[x.k] > 0)
		ss.innerHTML = active.length
			? active
					.map(
						x =>
							`<div class="summary-item"><span class="summary-count" style="color:${
								x.c
							}">${s[x.k]}</span><span class="summary-label">${x.i} ${
								x.l
							}</span></div>`
					)
					.join('')
			: '<div class="summary-item"><span class="summary-label">Нет отметок</span></div>'
	}

	updateSelectedDayInfo() {
		if (!this.selectedDayInfo) return
		const key = this.getDateKey(this.selectedDate),
			event = this.getEvent(this.selectedDate)
		const tasks = window.taskManager
			? window.taskManager.getTasksForDate(key)
			: []
		const opts = [
			{ v: 'none', l: '— Нет —' },
			{ v: 'work', l: '💼 Работа' },
			{ v: 'study', l: '📚 Учёба' },
			{ v: 'exam', l: '📝 Экзамен' },
			{ v: 'session', l: '🎓 Сессия' },
			{ v: 'diploma', l: '🏆 Диплом' },
			{ v: 'dayoff', l: '🏖️ Выходной' },
		]
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
		const days = [
			'Воскресенье',
			'Понедельник',
			'Вторник',
			'Среда',
			'Четверг',
			'Пятница',
			'Суббота',
		]
		this.selectedDayInfo.innerHTML = `<h3 class="stats-title">📋 Выбранный день</h3><div class="selected-day-details">
            <div class="selected-day-date">${this.selectedDate.getDate()} ${
			months[this.selectedDate.getMonth()]
		} ${this.selectedDate.getFullYear()}<div style="font-size:0.7rem;color:var(--text-secondary);">${
			days[this.selectedDate.getDay()]
		}</div></div>
            ${
							event
								? `<div class="selected-day-type-display">${this.getEventLabel(
										event
								  )}</div>`
								: ''
						}
            ${
							tasks.length
								? `<div class="tasks-link" onclick="document.querySelector('.nav-item[data-page=tasks]').click()">📋 ${tasks.length} задач</div>`
								: ''
						}
            <div class="type-selector"><label>Тип дня:</label><select id="dayTypeSelect">${opts
							.map(
								o =>
									`<option value="${o.v}" ${
										event === o.v || (!event && o.v === 'none')
											? 'selected'
											: ''
									}>${o.l}</option>`
							)
							.join('')}</select></div></div>`
		document
			.getElementById('dayTypeSelect')
			?.addEventListener('change', e => this.setSelectedDayType(e.target.value))
	}

	setSelectedDayType(type) {
		this.setEvent(this.selectedDate, type === 'none' ? null : type)
	}

	updateTodayWidget() {
		const today = new Date(),
			event = this.getEvent(today)
		const days = [
			'Воскресенье',
			'Понедельник',
			'Вторник',
			'Среда',
			'Четверг',
			'Пятница',
			'Суббота',
		]
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
		const el = id => document.getElementById(id)
		if (el('todayDayNumber')) el('todayDayNumber').textContent = today.getDate()
		if (el('todayMonth'))
			el('todayMonth').textContent = months[today.getMonth()]
		if (el('todayYear')) el('todayYear').textContent = today.getFullYear()
		if (el('todayDayName'))
			el('todayDayName').textContent = days[today.getDay()]
		const dot = el('todayStatus')?.querySelector('.status-dot')
		const txt = el('todayStatus')?.querySelector('.status-text')
		if (dot && txt) {
			dot.className = 'status-dot'
			if (event) {
				dot.classList.add(event)
				txt.textContent = this.getEventLabel(event)
			} else txt.textContent = 'Нет отметки'
		}
	}

	startTimeUpdate() {
		const update = () => {
			const el = document.getElementById('todayTime')
			if (el)
				el.textContent = new Date().toLocaleTimeString('ru-RU', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
				})
		}
		update()
		setInterval(update, 1000)
	}
}

document.addEventListener('DOMContentLoaded', () => {
	if (document.getElementById('calendarGrid')) window.calendar = new Calendar()
})
