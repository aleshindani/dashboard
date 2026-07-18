class Watch {
	constructor() {
		this.items = UserStorage.get('fun-watch', [])
		this.filter = 'all'
		this.search = ''
		this.init()
	}
	save() {
		UserStorage.set('fun-watch', this.items)
	}
	init() {
		this.render()
		document.getElementById('addWatchBtn').onclick = () => this.showModal()
		document.getElementById('cancelWatchBtn').onclick = () => this.hideModal()
		document.getElementById('saveWatchBtn').onclick = () => this.saveItem()
		document.getElementById('watchSearch').oninput = () => {
			this.search = document.getElementById('watchSearch').value.toLowerCase()
			this.render()
		}
		document.querySelectorAll('#page-watch .fun-filter-btn').forEach(
			b =>
				(b.onclick = () => {
					document
						.querySelectorAll('#page-watch .fun-filter-btn')
						.forEach(x => x.classList.remove('active'))
					b.classList.add('active')
					this.filter = b.dataset.filter
					this.render()
				})
		)
	}
	showModal(i = null) {
		document.getElementById('watchModalTitle').textContent = i
			? 'Редактировать'
			: 'Добавить'
		document.getElementById('watchName').value = i ? i.name : ''
		document.getElementById('watchType').value = i ? i.type : 'movie'
		document.getElementById('watchDesc').value = i ? i.desc || '' : ''
		document.getElementById('watchName').dataset.editId = i ? i.id : ''
		document.getElementById('watchModal').classList.add('active')
	}
	hideModal() {
		document.getElementById('watchModal').classList.remove('active')
	}
	saveItem() {
		const n = document.getElementById('watchName').value.trim(),
			t = document.getElementById('watchType').value,
			d = document.getElementById('watchDesc').value.trim(),
			eid = document.getElementById('watchName').dataset.editId
		if (!n) {
			alert('Введите название')
			return
		}
		if (eid) {
			const i = this.items.find(x => x.id === eid)
			if (i) {
				i.name = n
				i.type = t
				i.desc = d
			}
		} else
			this.items.unshift({
				id: Date.now().toString(),
				name: n,
				type: t,
				desc: d,
				watched: false,
			})
		this.save()
		this.render()
		this.hideModal()
	}
	toggleWatched(id) {
		const i = this.items.find(x => x.id === id)
		if (i) {
			i.watched = !i.watched
			this.save()
			this.render()
		}
	}
	deleteItem(id) {
		if (!confirm('Удалить?')) return
		this.items = this.items.filter(x => x.id !== id)
		this.save()
		this.render()
	}
	render() {
		const list = document.getElementById('watchList')
		if (!list) return
		let items = [...this.items]
		if (this.search)
			items = items.filter(
				i =>
					i.name.toLowerCase().includes(this.search) ||
					(i.desc || '').toLowerCase().includes(this.search)
			)
		if (this.filter === 'want') items = items.filter(i => !i.watched)
		else if (this.filter === 'watched') items = items.filter(i => i.watched)
		else if (
			['movie', 'series', 'anime', 'cartoon', 'video'].includes(this.filter)
		)
			items = items.filter(i => i.type === this.filter)
		if (!items.length) {
			list.innerHTML = '<p class="fun-empty">Ничего не найдено</p>'
			return
		}
		const types = {
			movie: '🎥 Фильм',
			series: '📺 Сериал',
			anime: '🗾 Аниме',
			cartoon: '🐱 Мультфильм',
			video: '📹 Видео',
		}
		list.innerHTML = items
			.map(
				i =>
					`<div class="fun-card ${
						i.watched ? 'visited' : ''
					}"><div class="fun-card-header"><span class="fun-card-title">${this.esc(
						i.name
					)}</span><span class="fun-card-badge">${
						types[i.type] || i.type
					}</span></div>${
						i.desc ? `<div class="fun-card-desc">${this.esc(i.desc)}</div>` : ''
					}<div class="fun-card-actions"><button class="fun-card-btn visited-btn ${
						i.watched ? 'was' : ''
					}" onclick="window.watch.toggleWatched('${i.id}')">${
						i.watched ? '✅ Просмотрено' : '👁️ Смотреть'
					}</button><button class="fun-card-btn" onclick="window.watch.showModal(window.watch.items.find(x=>x.id==='${
						i.id
					}'))">✏️</button><button class="fun-card-btn delete-btn" onclick="window.watch.deleteItem('${
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
	window.watch = new Watch()
})
