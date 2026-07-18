/**
 * Dashboard - Основной контроллер дашборда
 * Отвечает за навигацию между страницами и общую логику
 */
class Dashboard {
	constructor() {
		// DOM элементы
		this.navItems = document.querySelectorAll('.nav-item')
		this.pages = document.querySelectorAll('.page')
		this.sidebar = document.getElementById('sidebar')
		this.overlay = document.getElementById('sidebarOverlay')

		// Текущая страница
		this.currentPage = 'overview'

		this.init()
	}

	/**
	 * Инициализация
	 */
	init() {
		// Навигация по клику на пункты меню
		this.navItems.forEach(item => {
			item.addEventListener('click', e => {
				e.preventDefault()
				const pageName = item.getAttribute('data-page')
				if (pageName) {
					this.navigateTo(pageName)

					// На мобильных устройствах закрываем меню после перехода
					if (window.innerWidth <= 768) {
						this.closeMobileMenu()
					}
				}
			})
		})

		// Обработка хеша в URL (для прямых ссылок)
		this.handleHashChange()
		window.addEventListener('hashchange', () => this.handleHashChange())

		// Горячие клавиши для навигации
		this.initKeyboardShortcuts()
	}

	/**
	 * Переход на страницу
	 * @param {string} pageName - Имя страницы
	 */
	navigateTo(pageName) {
		// Проверяем, существует ли такая страница
		const targetPage = document.getElementById(`page-${pageName}`)
		if (!targetPage) {
			console.warn(`Страница "${pageName}" не найдена`)
			return
		}

		// Обновляем активный пункт меню
		this.navItems.forEach(item => {
			const itemPage = item.getAttribute('data-page')
			if (itemPage === pageName) {
				item.classList.add('active')
			} else {
				item.classList.remove('active')
			}
		})

		// Скрываем все страницы
		this.pages.forEach(page => page.classList.remove('active'))

		// Показываем нужную страницу
		targetPage.classList.add('active')

		// Обновляем текущую страницу
		this.currentPage = pageName

		// Обновляем URL (без перезагрузки)
		window.location.hash = pageName

		// Специфичные действия при переходе на определённые страницы
		this.onPageChange(pageName)

		// Прокручиваем контент наверх
		const mainContent = document.getElementById('mainContent')
		if (mainContent) {
			mainContent.scrollTop = 0
		}
	}

	/**
	 * Действия при смене страницы
	 * @param {string} pageName - Имя страницы
	 */
	onPageChange(pageName) {
		switch (pageName) {
			case 'calendar':
				// Обновляем календарь при переходе на страницу
				if (window.calendar) {
					// Небольшая задержка для анимации перехода
					setTimeout(() => {
						window.calendar.renderCalendar()
						window.calendar.updateMonthStats()
						window.calendar.updateSelectedDayInfo()
					}, 100)
				}
				break

			case 'overview':
				// Обновляем виджет "Сегодня" при возврате на главную
				if (window.calendar) {
					window.calendar.updateTodayWidget()
					// Обновляем сводку за месяц
					const today = new Date()
					const year = today.getFullYear()
					const month = today.getMonth()
					const stats = window.calendar.getMonthStats(year, month)
					window.calendar.updateMainSummary(stats)
				}
				break

			case 'analytics':
				// Здесь можно добавить обновление графиков
				console.log('Перешли на страницу аналитики')
				break

			case 'tasks':
				// Здесь можно добавить загрузку задач
				console.log('Перешли на страницу задач')
				break

			default:
				break
		}
	}

	/**
	 * Обработка хеша URL
	 */
	handleHashChange() {
		const hash = window.location.hash.replace('#', '')
		if (hash && document.getElementById(`page-${hash}`)) {
			this.navigateTo(hash)
		}
	}

	/**
	 * Закрытие мобильного меню
	 */
	closeMobileMenu() {
		if (this.sidebar) {
			this.sidebar.classList.remove('open')
		}
		if (this.overlay) {
			this.overlay.classList.remove('active')
		}
		// Обновляем кнопку меню
		const menuBtn = document.getElementById('mobileMenuBtn')
		if (menuBtn) {
			menuBtn.textContent = '☰'
		}
	}

	/**
	 * Горячие клавиши
	 */
	initKeyboardShortcuts() {
		document.addEventListener('keydown', e => {
			// Ctrl/Cmd + цифра для переключения страниц
			if (e.ctrlKey || e.metaKey) {
				const pageMap = {
					1: 'overview',
					2: 'analytics',
					3: 'messages',
					4: 'calendar',
					5: 'tasks',
					6: 'files',
					7: 'settings',
				}

				const page = pageMap[e.key]
				if (page) {
					e.preventDefault()
					this.navigateTo(page)
				}
			}
		})
	}

	/**
	 * Получить имя текущей страницы
	 * @returns {string}
	 */
	getCurrentPage() {
		return this.currentPage
	}
}

/**
 * Инициализация после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
	// Создаём экземпляр дашборда
	window.dashboard = new Dashboard()

	// Выводим приветствие в консоль
	console.log(
		'%c🚀 Дашборд загружен! %cГотов к работе.',
		'font-size: 1.2em; font-weight: bold;',
		'font-size: 1em;'
	)
	console.log(
		'%c💡 Совет: %cИспользуй Ctrl+1-7 для быстрой навигации.',
		'font-weight: bold; color: #6c63ff;',
		'color: #9ba1b0;'
	)
})
