/**
 * ThemeManager - Управление темами дашборда
 * Обеспечивает переключение тем на всех страницах и вкладках
 */
class ThemeManager {
	constructor() {
		this.html = document.documentElement

		// Все кнопки переключения темы (могут быть на разных страницах)
		this.themeToggles = document.querySelectorAll('.theme-toggle')

		// Радиокнопки выбора темы в настройках
		this.themeRadios = document.querySelectorAll('input[name="theme"]')

		// Доступные темы
		this.themes = ['dark', 'light', 'ocean', 'forest']

		this.init()
	}

	/**
	 * Инициализация
	 */
	init() {
		// Загружаем сохранённую тему или используем тёмную по умолчанию
		const savedTheme = localStorage.getItem('dashboard-theme') || 'dark'
		this.setTheme(savedTheme, false)

		// Обработчики для всех кнопок переключения темы
		this.themeToggles.forEach(toggle => {
			// Удаляем старые обработчики (на случай повторной инициализации)
			const newToggle = toggle.cloneNode(true)
			toggle.parentNode.replaceChild(newToggle, toggle)

			newToggle.addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()
				this.toggleDarkLight()
			})
		})

		// Обновляем список кнопок после замены
		this.themeToggles = document.querySelectorAll('.theme-toggle')

		// Обработчики для радиокнопок в настройках
		this.themeRadios.forEach(radio => {
			radio.addEventListener('change', e => {
				this.setTheme(e.target.value, true)
			})
		})

		// Синхронизация между вкладками браузера
		window.addEventListener('storage', e => {
			if (e.key === 'dashboard-theme' && e.newValue) {
				this.setTheme(e.newValue, false)
				this.updateRadioButtons(e.newValue)
				this.updateAllToggleIcons()
			}
		})

		// Устанавливаем начальное состояние иконок
		this.updateAllToggleIcons()
	}

	/**
	 * Установить тему
	 * @param {string} theme - Название темы (dark, light, ocean, forest)
	 * @param {boolean} save - Сохранять ли в localStorage
	 */
	setTheme(theme, save = true) {
		// Проверяем, что тема существует
		if (!this.themes.includes(theme)) {
			console.warn(`Тема "${theme}" не найдена, используется dark`)
			theme = 'dark'
		}

		// Устанавливаем атрибут на html
		this.html.setAttribute('data-theme', theme)

		// Сохраняем в localStorage
		if (save) {
			localStorage.setItem('dashboard-theme', theme)
		}

		// Обновляем радиокнопки в настройках
		this.updateRadioButtons(theme)

		// Обновляем иконки на всех кнопках
		this.updateAllToggleIcons()

		// Диспатчим событие для других компонентов
		window.dispatchEvent(
			new CustomEvent('themeChanged', {
				detail: { theme: theme },
			})
		)

		console.log(`🎨 Тема изменена на: ${theme}`)
	}

	/**
	 * Переключение между тёмной и светлой темой
	 * Если текущая тёмная/океан/лес → переключаем на светлую
	 * Если текущая светлая → переключаем на тёмную
	 */
	toggleDarkLight() {
		const currentTheme = this.html.getAttribute('data-theme') || 'dark'

		// Все тёмные темы (включая ocean и forest) переключаем на light
		const darkThemes = ['dark', 'ocean', 'forest']

		if (darkThemes.includes(currentTheme)) {
			this.setTheme('light', true)
		} else {
			this.setTheme('dark', true)
		}
	}

	/**
	 * Обновить состояние радиокнопок в настройках
	 * @param {string} theme - Текущая тема
	 */
	updateRadioButtons(theme) {
		this.themeRadios = document.querySelectorAll('input[name="theme"]')
		this.themeRadios.forEach(radio => {
			radio.checked = radio.value === theme
		})
	}

	/**
	 * Обновить иконки на всех кнопках переключения темы
	 */
	updateAllToggleIcons() {
		const currentTheme = this.html.getAttribute('data-theme') || 'dark'
		const darkThemes = ['dark', 'ocean', 'forest']
		const isDark = darkThemes.includes(currentTheme)

		// Обновляем все кнопки переключения темы
		this.themeToggles = document.querySelectorAll('.theme-toggle')
		this.themeToggles.forEach(toggle => {
			const darkIcon = toggle.querySelector('.theme-icon-dark')
			const lightIcon = toggle.querySelector('.theme-icon-light')

			if (darkIcon && lightIcon) {
				if (isDark) {
					darkIcon.style.display = 'inline'
					lightIcon.style.display = 'none'
				} else {
					darkIcon.style.display = 'none'
					lightIcon.style.display = 'inline'
				}
			}

			// Обновляем title (всплывающую подсказку)
			toggle.title = isDark ? 'Включить светлую тему' : 'Включить тёмную тему'
		})
	}

	/**
	 * Получить текущую тему
	 * @returns {string} Название темы
	 */
	getCurrentTheme() {
		return this.html.getAttribute('data-theme') || 'dark'
	}
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
	window.themeManager = new ThemeManager()
})
