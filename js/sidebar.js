class SidebarManager {
	constructor() {
		this.sidebar = document.getElementById('sidebar')
		this.overlay = document.getElementById('sidebarOverlay')

		this.init()
	}

	init() {
		// Кнопки меню (на всех страницах)
		document.querySelectorAll('.menu-toggle').forEach(btn => {
			btn.addEventListener('click', () => this.toggleMenu())
		})

		// Оверлей
		this.overlay?.addEventListener('click', () => this.closeMenu())

		// Закрытие при выборе пункта меню
		document.querySelectorAll('.nav-item').forEach(item => {
			item.addEventListener('click', () => {
				this.closeMenu()
			})
		})

		// Закрытие по Escape
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') this.closeMenu()
		})

		// Свайп для открытия (мобильные)
		let touchStartX = 0
		document.addEventListener('touchstart', e => {
			touchStartX = e.touches[0].clientX
		})
		document.addEventListener('touchend', e => {
			const diff = e.changedTouches[0].clientX - touchStartX
			if (diff > 80 && touchStartX < 30) {
				this.openMenu()
			}
		})
	}

	toggleMenu() {
		if (this.sidebar?.classList.contains('open')) {
			this.closeMenu()
		} else {
			this.openMenu()
		}
	}

	openMenu() {
		this.sidebar?.classList.add('open')
		this.overlay?.classList.add('active')
	}

	closeMenu() {
		this.sidebar?.classList.remove('open')
		this.overlay?.classList.remove('active')
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new SidebarManager()
})
