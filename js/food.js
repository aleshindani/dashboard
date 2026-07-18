class Food {
	constructor() {
		this.items = UserStorage.get('fun-food', [])
		this.filter = 'all'
		this.search = ''
		this.init()
	}
	save() {
		UserStorage.set('fun-food', this.items)
	}
	init() {
		this.render()
		document.getElementById('addFoodBtn').onclick = () => this.showModal()
		document.getElementById('cancelFoodBtn').onclick = () => this.hideModal()
		document.getElementById('saveFoodBtn').onclick = () => this.saveItem()
		document.getElementById('foodSearch').oninput = () => {
			this.search = document.getElementById('foodSearch').value.toLowerCase()
			this.render()
		}
		document.querySelectorAll('#page-food .fun-filter-btn').forEach(
			b =>
				(b.onclick = () => {
					document
						.querySelectorAll('#page-food .fun-filter-btn')
						.forEach(x => x.classList.remove('active'))
					b.classList.add('active')
					this.filter = b.dataset.filter
					this.render()
				})
		)
	}
	showModal(i = null) {
		document.getElementById('foodModalTitle').textContent = i
			? 'Редактировать'
			: 'Новый рецепт'
		document.getElementById('foodName').value = i ? i.name : ''
		document.getElementById('foodType').value = i ? i.type : 'main'
		document.getElementById('foodRating').value = i ? i.rating : 'tasty'
		document.getElementById('foodDesc').value = i ? i.desc || '' : ''
		document.getElementById('foodName').dataset.editId = i ? i.id : ''
		document.getElementById('foodModal').classList.add('active')
	}
	hideModal() {
		document.getElementById('foodModal').classList.remove('active')
	}
	saveItem() {
		const n = document.getElementById('foodName').value.trim(),
			t = document.getElementById('foodType').value,
			r = document.getElementById('foodRating').value,
			d = document.getElementById('foodDesc').value.trim(),
			eid = document.getElementById('foodName').dataset.editId
		if (!n) {
			alert('Введите название')
			return
		}
		if (eid) {
			const i = this.items.find(x => x.id === eid)
			if (i) {
				i.name = n
				i.type = t
				i.rating = r
				i.desc = d
			}
		} else
			this.items.unshift({
				id: Date.now().toString(),
				name: n,
				type: t,
				rating: r,
				desc: d,
			})
		this.save()
		this.render()
		this.hideModal()
	}
	deleteItem(id) {
		if (!confirm('Удалить?')) return
		this.items = this.items.filter(x => x.id !== id)
		this.save()
		this.render()
	}
	render() {
		const list = document.getElementById('foodList')
		if (!list) return
		let items = [...this.items]
		if (this.search)
			items = items.filter(
				i =>
					i.name.toLowerCase().includes(this.search) ||
					(i.desc || '').toLowerCase().includes(this.search)
			)
		if (this.filter === 'tasty') items = items.filter(i => i.rating === 'tasty')
		else if (this.filter === 'nottasty')
			items = items.filter(i => i.rating === 'nottasty')
		else if (
			['pp', 'junk', 'drink', 'main', 'dessert', 'other'].includes(this.filter)
		)
			items = items.filter(i => i.type === this.filter)
		if (!items.length) {
			list.innerHTML = '<p class="fun-empty">Ничего не найдено</p>'
			return
		}
		const types = {
			pp: '🥗 ПП',
			junk: '🍔 Джанк-фуд',
			drink: '🥤 Напиток',
			main: '🍝 Основное',
			dessert: '🍰 Десерт',
			other: '📌 Другое',
		}
		list.innerHTML = items
			.map(
				i =>
					`<div class="fun-card"><div class="fun-card-header"><span class="fun-card-title">${this.esc(
						i.name
					)}</span><span class="fun-card-badge">${
						types[i.type] || i.type
					}</span></div>${
						i.desc ? `<div class="fun-card-desc">${this.esc(i.desc)}</div>` : ''
					}<div class="fun-card-meta">${
						i.rating === 'tasty' ? '👍 Вкусно' : '👎 Не вкусно'
					}</div><div class="fun-card-actions"><button class="fun-card-btn" onclick="window.food.showModal(window.food.items.find(x=>x.id==='${
						i.id
					}'))">✏️</button><button class="fun-card-btn delete-btn" onclick="window.food.deleteItem('${
						i.id
					}')">🗑️</button></div></div>`
			)
			.join('')
	}
	esc(t) {
		const d = document.createElement('div')
		d.textContent = t
		return d.innerHTML
	}
}
document.addEventListener('DOMContentLoaded', () => {
	window.food = new Food()
})
