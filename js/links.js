class Links {
	constructor() {
		this.items = UserStorage.get('fun-links', [])
		this.filter = 'all'
		this.search = ''
		this.init()
	}
	save() {
		UserStorage.set('fun-links', this.items)
	}
	init() {
		this.render()
		document.getElementById('addLinkBtn').onclick = () => this.showModal()
		document.getElementById('cancelLinkBtn').onclick = () => this.hideModal()
		document.getElementById('saveLinkBtn').onclick = () => this.saveItem()
		document.getElementById('linkSearch').oninput = () => {
			this.search = document.getElementById('linkSearch').value.toLowerCase()
			this.render()
		}
		document.querySelectorAll('#page-links .fun-filter-btn').forEach(
			b =>
				(b.onclick = () => {
					document
						.querySelectorAll('#page-links .fun-filter-btn')
						.forEach(x => x.classList.remove('active'))
					b.classList.add('active')
					this.filter = b.dataset.filter
					this.render()
				})
		)
	}
	showModal(i = null) {
		document.getElementById('linkModalTitle').textContent = i
			? 'Редактировать'
			: 'Новая ссылка'
		document.getElementById('linkTitle').value = i ? i.title : ''
		document.getElementById('linkUrl').value = i ? i.url : ''
		document.getElementById('linkCategory').value = i ? i.category : 'tools'
		document.getElementById('linkTags').value = i
			? (i.tags || []).join(', ')
			: ''
		document.getElementById('linkNote').value = i ? i.note || '' : ''
		document.getElementById('linkTitle').dataset.editId = i ? i.id : ''
		document.getElementById('linkModal').classList.add('active')
	}
	hideModal() {
		document.getElementById('linkModal').classList.remove('active')
	}
	saveItem() {
		const t = document.getElementById('linkTitle').value.trim()
		let u = document.getElementById('linkUrl').value.trim()
		const c = document.getElementById('linkCategory').value,
			tags = document
				.getElementById('linkTags')
				.value.split(',')
				.map(x => x.trim())
				.filter(Boolean),
			n = document.getElementById('linkNote').value.trim(),
			eid = document.getElementById('linkTitle').dataset.editId
		if (!t) {
			alert('Введите название')
			return
		}
		if (u && !u.startsWith('http')) u = 'https://' + u
		if (eid) {
			const i = this.items.find(x => x.id === eid)
			if (i) {
				i.title = t
				i.url = u
				i.category = c
				i.tags = tags
				i.note = n
			}
		} else
			this.items.unshift({
				id: Date.now().toString(),
				title: t,
				url: u,
				category: c,
				tags: tags,
				note: n,
				added: new Date().toISOString(),
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
	openLink(u) {
		if (u) window.open(u, '_blank')
	}
	copyLink(u) {
		if (u) {
			navigator.clipboard.writeText(u)
			alert('Ссылка скопирована!')
		}
	}
	render() {
		const list = document.getElementById('linksList')
		if (!list) return
		let items = [...this.items]
		if (this.search)
			items = items.filter(
				i =>
					i.title.toLowerCase().includes(this.search) ||
					(i.tags || []).some(t => t.toLowerCase().includes(this.search)) ||
					(i.note || '').toLowerCase().includes(this.search)
			)
		if (this.filter !== 'all')
			items = items.filter(i => i.category === this.filter)
		if (!items.length) {
			list.innerHTML = '<p class="fun-empty">Ничего не найдено</p>'
			return
		}
		const cats = {
			tools: '🛠️ Инструменты',
			articles: '📄 Статьи',
			video: '🎥 Видео',
			dev: '💻 Разработка',
			design: '🎨 Дизайн',
			social: '📱 Соцсети',
			other: '📌 Другое',
		}
		list.innerHTML = items
			.map(
				i =>
					`<div class="fun-card"><div class="fun-card-header"><span class="fun-card-title" style="cursor:pointer;color:var(--accent-light)" onclick="window.links.openLink('${
						i.url
					}')">🔗 ${this.esc(i.title)}</span><span class="fun-card-badge">${
						cats[i.category] || i.category
					}</span></div>${
						i.url
							? `<div class="fun-card-desc" style="font-size:0.7rem;color:var(--text-secondary)">${this.esc(
									i.url
							  )}</div>`
							: ''
					}${
						i.note ? `<div class="fun-card-desc">${this.esc(i.note)}</div>` : ''
					}${
						i.tags && i.tags.length
							? `<div style="display:flex;gap:4px;flex-wrap:wrap">${i.tags
									.map(
										t =>
											`<span style="font-size:0.6rem;padding:1px 6px;border-radius:6px;background:var(--bg-secondary);color:var(--text-secondary)">#${t}</span>`
									)
									.join('')}</div>`
							: ''
					}<div class="fun-card-actions"><button class="fun-card-btn" onclick="window.links.openLink('${
						i.url
					}')">🔗 Открыть</button><button class="fun-card-btn" onclick="window.links.copyLink('${
						i.url
					}')">📋 Копировать</button><button class="fun-card-btn" onclick="window.links.showModal(window.links.items.find(x=>x.id==='${
						i.id
					}'))">✏️</button><button class="fun-card-btn delete-btn" onclick="window.links.deleteItem('${
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
	window.links = new Links()
})
