class Places {
	constructor() {
		this.places = []
		this.filter = 'all'
		this.search = ''
		this.init()
	}

	async init() {
		await this.loadPlaces()
		this.render()
		document.getElementById('addPlaceBtn').onclick = () => this.showModal()
		document.getElementById('cancelPlaceBtn').onclick = () => this.hideModal()
		document.getElementById('savePlaceBtn').onclick = () => this.savePlace()
		document.getElementById('placeSearch').oninput = () => {
			this.search = document.getElementById('placeSearch').value.toLowerCase()
			this.render()
		}
		document.querySelectorAll('#page-places .fun-filter-btn').forEach(
			b =>
				(b.onclick = () => {
					document
						.querySelectorAll('#page-places .fun-filter-btn')
						.forEach(x => x.classList.remove('active'))
					b.classList.add('active')
					this.filter = b.dataset.filter
					this.render()
				}),
		)
	}
	async loadPlaces() {
		const pbData = await UserStorage.loadFromPB('fun-places')
		this.places = pbData || UserStorage.get('fun-places', [])
	}
	save() {
		UserStorage.set('fun-places', this.places)
	}
	showModal(p = null) {
		document.getElementById('placeModalTitle').textContent = p
			? 'Редактировать'
			: 'Новое место'
		document.getElementById('placeName').value = p ? p.name : ''
		document.getElementById('placeCategory').value = p ? p.category : 'cafe'
		document.getElementById('placeDesc').value = p ? p.desc || '' : ''
		document.getElementById('placeName').dataset.editId = p ? p.id : ''
		document.getElementById('placeModal').classList.add('active')
	}
	hideModal() {
		document.getElementById('placeModal').classList.remove('active')
	}
	savePlace() {
		const n = document.getElementById('placeName').value.trim(),
			c = document.getElementById('placeCategory').value,
			d = document.getElementById('placeDesc').value.trim(),
			eid = document.getElementById('placeName').dataset.editId
		if (!n) {
			alert('Введите название')
			return
		}
		if (eid) {
			const p = this.places.find(x => x.id === eid)
			if (p) {
				p.name = n
				p.category = c
				p.desc = d
			}
		} else
			this.places.unshift({
				id: Date.now().toString(),
				name: n,
				category: c,
				desc: d,
				visited: false,
			})
		this.save()
		this.render()
		this.hideModal()
	}
	toggleVisited(id) {
		const p = this.places.find(x => x.id === id)
		if (p) {
			p.visited = !p.visited
			this.save()
			this.render()
		}
	}
	deletePlace(id) {
		if (!confirm('Удалить?')) return
		this.places = this.places.filter(x => x.id !== id)
		this.save()
		this.render()
	}
	render() {
		const list = document.getElementById('placesList')
		if (!list) return
		let items = [...this.places]
		if (this.search)
			items = items.filter(
				p =>
					p.name.toLowerCase().includes(this.search) ||
					(p.desc || '').toLowerCase().includes(this.search),
			)
		if (this.filter === 'want') items = items.filter(p => !p.visited)
		else if (this.filter === 'visited') items = items.filter(p => p.visited)
		else if (
			[
				'cafe',
				'restaurant',
				'park',
				'museum',
				'entertainment',
				'other',
			].includes(this.filter)
		)
			items = items.filter(p => p.category === this.filter)
		if (!items.length) {
			list.innerHTML = '<p class="fun-empty">Ничего не найдено</p>'
			return
		}
		const cats = {
			cafe: '☕ Кафе',
			restaurant: '🍽️ Ресторан',
			park: '🌳 Парк',
			museum: '🏛️ Музей',
			entertainment: '🎮 Развлечения',
			other: '📌 Другое',
		}
		list.innerHTML = items
			.map(
				p =>
					`<div class="fun-card ${
						p.visited ? 'visited' : ''
					}"><div class="fun-card-header"><span class="fun-card-title">${this.esc(
						p.name,
					)}</span><span class="fun-card-badge">${
						cats[p.category] || p.category
					}</span></div>${
						p.desc ? `<div class="fun-card-desc">${this.esc(p.desc)}</div>` : ''
					}<div class="fun-card-actions"><button class="fun-card-btn visited-btn ${
						p.visited ? 'was' : ''
					}" onclick="window.places.toggleVisited('${p.id}')">${
						p.visited ? '✅ Был' : '📍 Хочу'
					}</button><button class="fun-card-btn" onclick="window.places.showModal(window.places.places.find(x=>x.id==='${
						p.id
					}'))">✏️</button><button class="fun-card-btn delete-btn" onclick="window.places.deletePlace('${
						p.id
					}')">🗑️</button></div></div>`,
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
	window.places = new Places()
})
