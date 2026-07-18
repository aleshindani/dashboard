class Shopping {
	constructor() {
		this.items = UserStorage.get('fun-shopping', [])
		this.filter = 'all'
		this.search = ''
		this.init()
	}
	save() {
		UserStorage.set('fun-shopping', this.items)
	}
	init() {
		this.render()
		document.getElementById('addShopBtn').onclick = () => this.showModal()
		document.getElementById('cancelShopBtn').onclick = () => this.hideModal()
		document.getElementById('saveShopBtn').onclick = () => this.saveItem()
		document.getElementById('shopSearch').oninput = () => {
			this.search = document.getElementById('shopSearch').value.toLowerCase()
			this.render()
		}
		document.querySelectorAll('#page-shopping .fun-filter-btn').forEach(
			b =>
				(b.onclick = () => {
					const f = b.dataset.filter
					if (
						[
							'gift',
							'self',
							'electronics',
							'clothes',
							'home',
							'beauty',
							'sport',
							'books',
							'other',
						].includes(f)
					) {
						if (b.classList.contains('active')) {
							b.classList.remove('active')
							this.filter = 'all'
						} else {
							document
								.querySelectorAll('#page-shopping .fun-filter-btn')
								.forEach(x => x.classList.remove('active'))
							b.classList.add('active')
							this.filter = f
						}
					} else {
						document
							.querySelectorAll('#page-shopping .fun-filter-btn')
							.forEach(x => x.classList.remove('active'))
						b.classList.add('active')
						this.filter = f
					}
					this.render()
				})
		)
	}
	showModal(i = null) {
		document.getElementById('shopModalTitle').textContent = i
			? 'Редактировать'
			: 'Новый товар'
		document.getElementById('shopName').value = i ? i.name : ''
		document.getElementById('shopLink').value = i ? i.link || '' : ''
		document.getElementById('shopPrice').value = i ? i.price || '' : ''
		document.getElementById('shopCategory').value = i ? i.category : 'other'
		document.getElementById('shopPurpose').value = i ? i.purpose : 'self'
		document.getElementById('shopRecipient').value = i ? i.recipient || '' : ''
		document.getElementById('shopNote').value = i ? i.note || '' : ''
		document.getElementById('shopName').dataset.editId = i ? i.id : ''
		document.getElementById('shopModal').classList.add('active')
	}
	hideModal() {
		document.getElementById('shopModal').classList.remove('active')
	}
	saveItem() {
		const n = document.getElementById('shopName').value.trim(),
			l = document.getElementById('shopLink').value.trim(),
			p = parseInt(document.getElementById('shopPrice').value) || 0,
			c = document.getElementById('shopCategory').value,
			pu = document.getElementById('shopPurpose').value,
			r = document.getElementById('shopRecipient').value.trim(),
			no = document.getElementById('shopNote').value.trim(),
			eid = document.getElementById('shopName').dataset.editId
		if (!n) {
			alert('Введите название')
			return
		}
		if (eid) {
			const i = this.items.find(x => x.id === eid)
			if (i) {
				i.name = n
				i.link = l
				i.price = p
				i.category = c
				i.purpose = pu
				i.recipient = r
				i.note = no
			}
		} else
			this.items.unshift({
				id: Date.now().toString(),
				name: n,
				link: l,
				price: p,
				category: c,
				purpose: pu,
				recipient: r,
				note: no,
				bought: false,
			})
		this.save()
		this.render()
		this.hideModal()
	}
	toggleBought(id) {
		const i = this.items.find(x => x.id === id)
		if (i) {
			i.bought = !i.bought
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
	openLink(l) {
		if (l) window.open(l, '_blank')
	}
	render() {
		const list = document.getElementById('shopList')
		if (!list) return
		let items = [...this.items]
		if (this.search)
			items = items.filter(
				i =>
					i.name.toLowerCase().includes(this.search) ||
					(i.note || '').toLowerCase().includes(this.search)
			)
		if (this.filter === 'want') items = items.filter(i => !i.bought)
		else if (this.filter === 'bought') items = items.filter(i => i.bought)
		else if (['gift', 'self'].includes(this.filter))
			items = items.filter(i => i.purpose === this.filter)
		else if (
			[
				'electronics',
				'clothes',
				'home',
				'beauty',
				'sport',
				'books',
				'other',
			].includes(this.filter)
		)
			items = items.filter(i => i.category === this.filter)
		if (!items.length) {
			list.innerHTML = '<p class="fun-empty">Ничего не найдено</p>'
			return
		}
		const cats = {
			electronics: '📱 Электроника',
			clothes: '👕 Одежда',
			home: '🏠 Дом',
			beauty: '💄 Красота',
			sport: '⚽ Спорт',
			books: '📚 Книги',
			other: '📌 Другое',
		}
		list.innerHTML = items
			.map(
				i =>
					`<div class="fun-card ${
						i.bought ? 'visited' : ''
					}"><div class="fun-card-header"><span class="fun-card-title" style="cursor:${
						i.link ? 'pointer' : 'default'
					};text-decoration:${
						i.link ? 'underline' : ''
					}" onclick="window.shopping.openLink('${i.link}')">${this.esc(
						i.name
					)}</span><span class="fun-card-badge">${
						cats[i.category] || i.category
					}</span></div><div class="fun-card-meta">${
						i.price > 0 ? `💰 ${i.price.toLocaleString()} ₽` : ''
					}${
						i.purpose === 'gift'
							? ' · 🎁 Подарок' +
							  (i.recipient ? ' для ' + this.esc(i.recipient) : '')
							: ' · 👤 Себе'
					}</div>${
						i.note ? `<div class="fun-card-desc">${this.esc(i.note)}</div>` : ''
					}<div class="fun-card-actions"><button class="fun-card-btn visited-btn ${
						i.bought ? 'was' : ''
					}" onclick="event.stopPropagation();window.shopping.toggleBought('${
						i.id
					}')">${
						i.bought ? '✅ Куплено' : '🛒 Хочу'
					}</button><button class="fun-card-btn" onclick="event.stopPropagation();window.shopping.showModal(window.shopping.items.find(x=>x.id==='${
						i.id
					}'))">✏️</button><button class="fun-card-btn delete-btn" onclick="event.stopPropagation();window.shopping.deleteItem('${
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
	window.shopping = new Shopping()
})
