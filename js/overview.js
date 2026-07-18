class OverviewWidgets {
	constructor() {
		this.init()
	}
	init() {
		this.loadQuote()
		this.loadUpcomingEvents()
		this.loadQuickNote()
		this.loadTodayWidget()
	}

	loadQuote() {
		const quotes = [
			{
				text: 'Единственный способ делать великие дела — любить то, что вы делаете.',
				author: 'Стив Джобс',
			},
			{
				text: 'Будущее зависит от того, что вы делаете сегодня.',
				author: 'Махатма Ганди',
			},
			{ text: 'Не считайте дни, пусть дни считаются.', author: 'Мохаммед Али' },
			{
				text: 'Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма.',
				author: 'Уинстон Черчилль',
			},
			{
				text: 'Всё, что вы можете представить — реально.',
				author: 'Пабло Пикассо',
			},
			{
				text: 'Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сегодня.',
				author: 'Китайская пословица',
			},
			{
				text: 'Делай сегодня то, что другие не хотят. Завтра будешь жить так, как другие не могут.',
				author: 'Джаред Лето',
			},
			{
				text: 'Маленькие дела — каждый день. Большой результат — через год.',
				author: 'Народная мудрость',
			},
			{
				text: 'Не бойтесь ошибок. Бойтесь только отсутствия движения.',
				author: 'Джон Вуден',
			},
			{
				text: 'Ваше время ограничено. Не тратьте его, живя чужой жизнью.',
				author: 'Стив Джобс',
			},
		]
		const now = new Date(),
			doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000),
			q = quotes[doy % quotes.length]
		document.getElementById('quoteText').textContent = `"${q.text}"`
		document.getElementById('quoteAuthor').textContent = `— ${q.author}`
	}

	loadUpcomingEvents() {
		const list = document.getElementById('upcomingEventsList')
		if (!list) return
		const events = UserStorage.get('calendar-events', {})
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const labels = {
			work: { icon: '💼', text: 'Работа' },
			study: { icon: '📚', text: 'Учёба' },
			exam: { icon: '📝', text: 'Экзамен' },
			session: { icon: '🎓', text: 'Сессия' },
			diploma: { icon: '🏆', text: 'Диплом' },
			dayoff: { icon: '🏖️', text: 'Выходной' },
		}
		const upcoming = []
		for (let i = 0; i <= 1; i++) {
			const d = new Date(today)
			d.setDate(d.getDate() + i)
			const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
				2,
				'0'
			)}-${String(d.getDate()).padStart(2, '0')}`
			const t = events[k]
			if (t && t !== 'none' && labels[t])
				upcoming.push({ date: i === 0 ? 'Сегодня' : 'Завтра', ...labels[t] })
		}
		if (!upcoming.length) {
			list.innerHTML = '<p class="empty-text">Нет событий</p>'
			return
		}
		list.innerHTML = upcoming
			.map(
				e =>
					`<div class="event-item"><span class="event-item-icon">${e.icon}</span><span class="event-item-date">${e.date}</span><span class="event-item-text">${e.text}</span></div>`
			)
			.join('')
	}

	loadQuickNote() {
		const input = document.getElementById('quickNoteInput')
		if (!input) return
		const saved = UserStorage.get('quick-note', '')
		if (saved) input.value = saved
		let timeout
		input.addEventListener('input', () => {
			clearTimeout(timeout)
			timeout = setTimeout(
				() => UserStorage.set('quick-note', input.value),
				500
			)
		})
	}

	loadTodayWidget() {
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
	window.overviewWidgets = new OverviewWidgets()
})
