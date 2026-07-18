class TaskManager {
	constructor() {
		this.tasks = this.loadTasks()
		this.currentFilter = 'all'
		this.editingTaskId = null
		this.init()
	}

	init() {
		this.renderTasks()
		this.updateBadge()
		document
			.getElementById('addTaskBtn')
			?.addEventListener('click', () => this.openModal())
		document
			.getElementById('closeModal')
			?.addEventListener('click', () => this.closeModal())
		document
			.getElementById('cancelTask')
			?.addEventListener('click', () => this.closeModal())
		const modal = document.getElementById('taskModal')
		if (modal)
			modal.addEventListener('click', e => {
				if (e.target === modal) this.closeModal()
			})
		document
			.getElementById('saveTask')
			?.addEventListener('click', () => this.saveTask())
		document.getElementById('taskTitle')?.addEventListener('keydown', e => {
			if (e.key === 'Enter' && e.ctrlKey) this.saveTask()
		})
		document.querySelectorAll('.filter-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				document
					.querySelectorAll('.filter-btn')
					.forEach(b => b.classList.remove('active'))
				btn.classList.add('active')
				this.currentFilter = btn.getAttribute('data-filter')
				this.filterDate = null
				const df = document.getElementById('dateFilter')
				if (df) df.value = ''
				this.renderTasks()
			})
		})
		document.getElementById('dateFilter')?.addEventListener('change', e => {
			this.currentFilter = 'date'
			this.filterDate = e.target.value
			document
				.querySelectorAll('.filter-btn')
				.forEach(b => b.classList.remove('active'))
			this.renderTasks()
		})
		window.addEventListener('storage', e => {
			if (e.key && e.key.endsWith('_dashboard-tasks')) {
				this.tasks = this.loadTasks()
				this.renderTasks()
				this.updateBadge()
				this.refreshCalendarAndWidgets()
			}
		})
		window.addEventListener('themeChanged', () => this.renderTasks())
	}

	loadTasks() {
		return UserStorage.get('dashboard-tasks', [])
	}
	saveTasks() {
		UserStorage.set('dashboard-tasks', this.tasks)
	}

	refreshCalendarAndWidgets() {
		if (window.calendar) {
			window.calendar.renderCalendar()
			window.calendar.updateTodayWidget()
			window.calendar.updateMonthStats()
		}
		this.renderTodayTasks()
	}

	getTasksForDate(dateKey) {
		return this.tasks.filter(t => t.date === dateKey)
	}
	hasTasksForDate(dateKey) {
		return this.tasks.some(t => t.date === dateKey && !t.completed)
	}

	getFilteredTasks() {
		const today = new Date()
		const todayKey = this.getDateKey(today)
		let filtered = [...this.tasks]
		const priorityOrder = { high: 0, medium: 1, low: 2 }
		filtered.sort((a, b) => {
			if (a.completed !== b.completed) return a.completed ? 1 : -1
			if (a.date !== b.date) return a.date.localeCompare(b.date)
			if (a.time && b.time) return a.time.localeCompare(b.time)
			if (a.time) return -1
			if (b.time) return 1
			return priorityOrder[a.priority] - priorityOrder[b.priority]
		})
		switch (this.currentFilter) {
			case 'today':
				return filtered.filter(t => t.date === todayKey)
			case 'week':
				const weekEnd = new Date(today)
				weekEnd.setDate(weekEnd.getDate() + 7)
				return filtered.filter(
					t => t.date >= todayKey && t.date <= this.getDateKey(weekEnd)
				)
			case 'overdue':
				return filtered.filter(t => !t.completed && t.date < todayKey)
			case 'high':
				return filtered.filter(t => t.priority === 'high')
			case 'medium':
				return filtered.filter(t => t.priority === 'medium')
			case 'low':
				return filtered.filter(t => t.priority === 'low')
			case 'date':
				return this.filterDate
					? filtered.filter(t => t.date === this.filterDate)
					: filtered
			default:
				return filtered
		}
	}

	renderTasks() {
		const list = document.getElementById('tasksList')
		if (!list) return
		const filtered = this.getFilteredTasks()
		if (!filtered.length) {
			list.innerHTML = '<p class="tasks-empty">Нет задач</p>'
			return
		}
		const grouped = {}
		filtered.forEach(t => {
			if (!grouped[t.date]) grouped[t.date] = []
			grouped[t.date].push(t)
		})
		const showGroups =
			this.currentFilter === 'all' || this.currentFilter === 'week'
		let html = ''
		if (showGroups && Object.keys(grouped).length > 1) {
			Object.keys(grouped)
				.sort()
				.forEach(dk => {
					html += `<div class="tasks-date-group"><div class="tasks-date-header"><span>📅 ${this.formatDateFull(
						dk
					)}</span><span class="tasks-date-count">${
						grouped[dk].length
					} задач</span></div>`
					grouped[dk].forEach(t => (html += this.createTaskCard(t)))
					html += '</div>'
				})
		} else {
			filtered.forEach(t => (html += this.createTaskCard(t)))
		}
		list.innerHTML = html
		this.attachCardEventListeners(list)
		this.renderTodayTasks()
	}

	attachCardEventListeners(list) {
		list.querySelectorAll('.task-card').forEach(card => {
			const taskId = card.getAttribute('data-id')
			if (!taskId) return
			card.addEventListener('click', e => {
				if (
					e.target.closest('.task-action-btn') ||
					e.target.closest('.task-checkbox')
				)
					return
				this.openModal(taskId)
			})
			card.querySelector('.task-checkbox')?.addEventListener('click', e => {
				e.stopPropagation()
				this.toggleTask(taskId)
			})
			card.querySelector('.edit-btn')?.addEventListener('click', e => {
				e.stopPropagation()
				this.openModal(taskId)
			})
			card.querySelector('.delete-btn')?.addEventListener('click', e => {
				e.stopPropagation()
				this.deleteTask(taskId)
			})
		})
	}

	createTaskCard(task) {
		const today = this.getDateKey(new Date())
		const isOverdue = !task.completed && task.date < today
		const priorityLabels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
		return `<div class="task-card ${
			task.completed ? 'completed' : ''
		}" data-id="${task.id}">
            <div class="task-checkbox" title="${
							task.completed ? 'Отменить' : 'Выполнено'
						}"></div>
            <div class="task-content">
                <div class="task-header">
                    <span class="task-title">${this.esc(task.title)}</span>
                    <span class="task-priority ${task.priority}">${
			priorityLabels[task.priority]
		}</span>
                    ${
											task.time
												? `<span class="task-time">🕐 ${task.time}</span>`
												: ''
										}
                </div>
                ${
									task.description
										? `<div class="task-description">${this.esc(
												task.description
										  )}</div>`
										: ''
								}
                <div class="task-date ${
									isOverdue ? 'overdue' : ''
								}">📅 ${this.formatDate(task.date)} ${
			isOverdue ? '(просрочено)' : ''
		}</div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" title="Редактировать">✏️</button>
                <button class="task-action-btn delete-btn" title="Удалить">🗑️</button>
            </div></div>`
	}

	openModal(taskId = null) {
		const modal = document.getElementById('taskModal')
		const title = document.getElementById('modalTitle')
		const tTitle = document.getElementById('taskTitle')
		const tDesc = document.getElementById('taskDescription')
		const tDate = document.getElementById('taskDate')
		const tTime = document.getElementById('taskTime')
		const tPriority = document.getElementById('taskPriority')
		const tCompleted = document.getElementById('taskCompleted')
		if (!modal) return
		this.editingTaskId = taskId
		if (taskId) {
			const task = this.tasks.find(t => t.id === taskId)
			if (task) {
				title.textContent = 'Редактировать задачу'
				tTitle.value = task.title
				tDesc.value = task.description || ''
				tDate.value = task.date
				tTime.value = task.time || ''
				tPriority.value = task.priority
				tCompleted.checked = task.completed
			}
		} else {
			title.textContent = 'Новая задача'
			tTitle.value = ''
			tDesc.value = ''
			tDate.value = this.getDateKey(new Date())
			tTime.value = ''
			tPriority.value = 'medium'
			tCompleted.checked = false
		}
		modal.classList.add('active')
		setTimeout(() => tTitle.focus(), 100)
	}

	closeModal() {
		document.getElementById('taskModal')?.classList.remove('active')
		this.editingTaskId = null
	}

	saveTask() {
		const tTitle = document.getElementById('taskTitle')?.value.trim()
		const tDesc = document.getElementById('taskDescription')?.value.trim()
		const tDate = document.getElementById('taskDate')?.value
		const tTime = document.getElementById('taskTime')?.value
		const tPriority = document.getElementById('taskPriority')?.value
		const tCompleted = document.getElementById('taskCompleted')?.checked
		if (!tTitle) {
			alert('Введите название')
			return
		}
		if (!tDate) {
			alert('Выберите дату')
			return
		}
		if (this.editingTaskId) {
			const task = this.tasks.find(t => t.id === this.editingTaskId)
			if (task) {
				task.title = tTitle
				task.description = tDesc
				task.date = tDate
				task.time = tTime || null
				task.priority = tPriority
				task.completed = tCompleted
			}
		} else {
			this.tasks.push({
				id: Date.now().toString(),
				title: tTitle,
				description: tDesc,
				date: tDate,
				time: tTime || null,
				priority: tPriority,
				completed: tCompleted,
				createdAt: new Date().toISOString(),
			})
		}
		this.saveTasks()
		this.closeModal()
		this.renderTasks()
	}

	toggleTask(taskId) {
		const task = this.tasks.find(t => t.id === taskId)
		if (task) {
			task.completed = !task.completed
			this.saveTasks()
			this.renderTasks()
		}
	}

	deleteTask(taskId) {
		if (!confirm('Удалить задачу?')) return
		this.tasks = this.tasks.filter(t => t.id !== taskId)
		this.saveTasks()
		this.renderTasks()
		this.refreshCalendarAndWidgets()
	}

	updateBadge() {
		const badge = document.getElementById('tasksBadge')
		if (badge) {
			const today = this.getDateKey(new Date())
			const count = this.tasks.filter(
				t => !t.completed && t.date <= today
			).length
			badge.textContent = count
			badge.style.display = count > 0 ? 'inline' : 'none'
		}
	}

	renderTodayTasks() {
		const list = document.getElementById('todayTasksList')
		if (!list) return
		const today = this.getDateKey(new Date())
		const todayTasks = this.tasks
			.filter(t => t.date === today)
			.sort((a, b) => {
				if (a.time && b.time) return a.time.localeCompare(b.time)
				if (a.time) return -1
				if (b.time) return 1
				return 0
			})
		if (!todayTasks.length) {
			list.innerHTML =
				'<p style="color:var(--text-secondary);font-size:0.85rem;">Нет задач на сегодня</p>'
			return
		}
		list.innerHTML = todayTasks
			.map(
				t => `<div class="task-card ${
					t.completed ? 'completed' : ''
				}" style="padding:10px 14px;margin-bottom:8px;cursor:pointer;" data-id="${
					t.id
				}">
            <div class="task-checkbox" style="width:18px;height:18px;"></div>
            <div class="task-content"><div class="task-header"><span class="task-title" style="font-size:0.85rem;">${this.esc(
							t.title
						)}</span>
            ${
							t.time
								? `<span style="font-size:0.75rem;color:var(--accent-light);">🕐 ${t.time}</span>`
								: ''
						}
            <span class="task-priority ${t.priority}">${
					t.priority === 'high' ? '!' : t.priority === 'medium' ? '•' : ''
				}</span></div></div></div>`
			)
			.join('')
		list.querySelectorAll('.task-card').forEach(card => {
			const tid = card.getAttribute('data-id')
			card.addEventListener('click', () => {
				if (window.dashboard) window.dashboard.navigateTo('tasks')
				setTimeout(() => this.openModal(tid), 300)
			})
			card.querySelector('.task-checkbox')?.addEventListener('click', e => {
				e.stopPropagation()
				this.toggleTask(tid)
			})
		})
	}

	getDateKey(date) {
		const d = new Date(date)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
			2,
			'0'
		)}-${String(d.getDate()).padStart(2, '0')}`
	}
	formatDate(dk) {
		if (!dk) return ''
		const [y, m, d] = dk.split('-')
		const ms = [
			'янв',
			'фев',
			'мар',
			'апр',
			'мая',
			'июн',
			'июл',
			'авг',
			'сен',
			'окт',
			'ноя',
			'дек',
		]
		return `${parseInt(d)} ${ms[parseInt(m) - 1]}`
	}
	formatDateFull(dk) {
		if (!dk) return ''
		const [y, m, d] = dk.split('-')
		const ms = [
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
		const ds = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
		const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
		return `${parseInt(d)} ${ms[parseInt(m) - 1]}, ${ds[dt.getDay()]}`
	}
	esc(t) {
		const d = document.createElement('div')
		d.textContent = t
		return d.innerHTML
	}
}
document.addEventListener('DOMContentLoaded', () => {
	window.taskManager = new TaskManager()
})
