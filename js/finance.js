class Finance {
	constructor() {
		this.transactions = UserStorage.get('fin-transactions', [])
		this.bills = UserStorage.get('fin-bills', [])
		this.init()
	}

	init() {
		this.setDefaultDate()
		this.renderAll()
		this.renderBillsWidget()
		this.attachEvents()
	}

	attachEvents() {
		document.getElementById('addTransBtn').onclick = () => this.addTransaction()
		document.getElementById('addBillBtn').onclick = () => this.addBill()
		const bc = document.getElementById('billCategory')
		const cn = document.getElementById('billCustomName')
		if (bc && cn)
			bc.onchange = () => {
				cn.style.display = bc.value === 'custom' ? 'block' : 'none'
			}
	}

	setDefaultDate() {
		const today = new Date().toISOString().slice(0, 10)
		const fd = document.getElementById('finDate')
		if (fd) fd.value = today
		const bd = document.getElementById('billDate')
		if (bd) bd.value = today
	}

	addTransaction() {
		const title = document.getElementById('finTitle')?.value.trim()
		const amount = parseInt(document.getElementById('finAmount')?.value)
		const type = document.getElementById('finType')?.value || 'expense'
		const date =
			document.getElementById('finDate')?.value ||
			new Date().toISOString().slice(0, 10)
		const category = document.getElementById('finCategory')?.value || 'other'
		if (!title) {
			alert('Введите описание')
			return
		}
		if (!amount || amount <= 0) {
			alert('Введите сумму')
			return
		}
		this.transactions.unshift({
			id: Date.now(),
			title,
			amount,
			type,
			date,
			category,
		})
		if (this.transactions.length > 100)
			this.transactions = this.transactions.slice(0, 100)
		UserStorage.set('fin-transactions', this.transactions)
		this.renderAll()
		document.getElementById('finTitle').value = ''
		document.getElementById('finAmount').value = ''
	}

	deleteTransaction(id) {
		this.transactions = this.transactions.filter(t => t.id !== id)
		UserStorage.set('fin-transactions', this.transactions)
		this.renderAll()
	}

	addBill() {
		const category = document.getElementById('billCategory')?.value || 'other'
		const amount = parseInt(document.getElementById('billAmount')?.value)
		const date =
			document.getElementById('billDate')?.value ||
			new Date().toISOString().slice(0, 10)
		const priority = document.getElementById('billPriority')?.value || 'medium'
		if (!amount || amount <= 0) {
			alert('Введите сумму платежа')
			return
		}
		const names = {
			internet: 'Интернет',
			mobile: 'Мобильная связь',
			rent: 'Квартплата',
			electricity: 'Электричество',
			water: 'Вода',
			heating: 'Отопление',
			credit: 'Кредит',
			insurance: 'Страховка',
			subscription: 'Подписка',
			taxes: 'Налоги',
			other: 'Другой платёж',
		}
		let name
		if (category === 'custom') {
			const ci = document.querySelector('#billCustomName input')
			const cv = ci ? ci.value.trim() : ''
			if (!cv) {
				alert('Введите название')
				return
			}
			name = cv
		} else {
			name = names[category] || 'Платёж'
		}
		this.bills.push({
			id: Date.now(),
			name,
			category,
			amount,
			date,
			priority,
			paid: false,
		})
		UserStorage.set('fin-bills', this.bills)
		this.renderAll()
		this.renderBillsWidget()
		document.getElementById('billAmount').value = ''
		const ci = document.querySelector('#billCustomName input')
		if (ci) ci.value = ''
		document.getElementById('billCustomName').style.display = 'none'
		document.getElementById('billCategory').value = 'internet'
	}

	toggleBill(id) {
		const bill = this.bills.find(b => b.id === id)
		if (bill) {
			bill.paid = !bill.paid
			UserStorage.set('fin-bills', this.bills)
			this.renderAll()
			this.renderBillsWidget()
		}
	}

	deleteBill(id) {
		if (!confirm('Удалить платёж?')) return
		this.bills = this.bills.filter(b => b.id !== id)
		UserStorage.set('fin-bills', this.bills)
		this.renderAll()
		this.renderBillsWidget()
	}

	isUrgent(ds) {
		const t = new Date()
		t.setHours(0, 0, 0, 0)
		const d = new Date(ds)
		d.setHours(0, 0, 0, 0)
		const diff = Math.ceil((d - t) / 86400000)
		return diff <= 3 && diff >= 0
	}
	isOverdue(ds) {
		const t = new Date()
		t.setHours(0, 0, 0, 0)
		return new Date(ds) < t
	}
	getDaysLeft(ds) {
		const t = new Date()
		t.setHours(0, 0, 0, 0)
		const d = new Date(ds)
		d.setHours(0, 0, 0, 0)
		return Math.ceil((d - t) / 86400000)
	}

	getTotals() {
		let inc = 0,
			exp = 0
		this.transactions.forEach(t =>
			t.type === 'income' ? (inc += t.amount) : (exp += t.amount)
		)
		const unpaid = this.bills
			.filter(b => !b.paid)
			.reduce((s, b) => s + b.amount, 0)
		return {
			income: inc,
			expense: exp + unpaid,
			balance: inc - exp - unpaid,
			billsUnpaid: unpaid,
		}
	}

	getUrgentBills() {
		return this.bills
			.filter(b => !b.paid && this.isUrgent(b.date))
			.sort((a, b) => a.date.localeCompare(b.date))
	}

	renderAll() {
		this.renderBalance()
		this.renderTransactions()
		this.renderBills()
	}

	renderBalance() {
		const t = this.getTotals()
		document.getElementById('currentBalance').textContent = this.fmt(t.balance)
		document.getElementById('totalIncome').textContent =
			'+' + this.fmt(t.income)
		document.getElementById('totalExpense').textContent =
			'-' + this.fmt(t.expense)
	}

	renderTransactions() {
		const list = document.getElementById('financeList')
		if (!list) return
		const items = this.transactions.slice(0, 20)
		if (!items.length) {
			list.innerHTML =
				'<div class="fin-empty"><div class="fin-empty-icon">📋</div>Нет операций</div>'
			return
		}
		const icons = {
			salary: '💼',
			food: '🍕',
			transport: '🚗',
			utilities: '💡',
			entertainment: '🎮',
			health: '💊',
			education: '📚',
			other: '📌',
		}
		list.innerHTML = items
			.map(
				t =>
					`<div class="fin-trans-item"><div class="fin-trans-icon ${t.type}">${
						icons[t.category] || '📌'
					}</div><div class="fin-trans-info"><div class="fin-trans-name">${this.esc(
						t.title
					)}</div><div class="fin-trans-meta">${
						t.date
					}</div></div><span class="fin-trans-amount ${t.type}">${
						t.type === 'income' ? '+' : '-'
					}${this.fmt(
						t.amount
					)}</span><button class="fin-trans-del" onclick="finance.deleteTransaction(${
						t.id
					})">✕</button></div>`
			)
			.join('')
	}

	renderBills() {
		const list = document.getElementById('billsList')
		if (!list) return
		const unpaid = this.bills
			.filter(b => !b.paid)
			.sort((a, b) => a.date.localeCompare(b.date))
		const paid = this.bills.filter(b => b.paid)
		if (!unpaid.length && !paid.length) {
			list.innerHTML =
				'<div class="fin-empty"><div class="fin-empty-icon">📅</div>Нет платежей</div>'
			return
		}
		const us = unpaid.reduce((s, b) => s + b.amount, 0)
		let html =
			us > 0
				? `<div style="display:flex;justify-content:space-between;padding:8px 12px;margin-bottom:8px;background:rgba(239,68,68,0.08);border-radius:8px;font-size:0.85rem;font-weight:600;"><span>📅 К оплате:</span><span style="color:#f87171;">${this.fmt(
						us
				  )}</span></div>`
				: ''
		html += [
			...unpaid.map(b => this.billHTML(b)),
			...paid.map(b => this.billHTML(b)),
		].join('')
		list.innerHTML = html
	}

	billHTML(b) {
		const icons = {
			internet: '🌐',
			mobile: '📱',
			rent: '🏠',
			electricity: '⚡',
			water: '💧',
			heating: '🔥',
			credit: '🏦',
			insurance: '🛡️',
			subscription: '🔄',
			taxes: '📄',
			other: '📌',
			custom: '📝',
		}
		const overdue = this.isOverdue(b.date),
			urgent = this.isUrgent(b.date),
			days = this.getDaysLeft(b.date)
		let status = b.paid
			? '✓ Оплачен'
			: overdue
			? '⚠️ Просрочен'
			: urgent
			? '⚡ ' + days + ' дн.'
			: days + ' дн.'
		return `<div class="fin-bill ${
			(urgent || overdue) && !b.paid ? 'urgent' : ''
		} ${b.paid ? 'paid-bill' : ''}"><div class="fin-bill-icon">${
			icons[b.category] || '📌'
		}</div><div class="fin-bill-info"><div class="fin-bill-name">${this.esc(
			b.name
		)}</div><div class="fin-bill-meta">📅 ${
			b.date
		} · ${status}</div></div><span class="fin-bill-amount">-${this.fmt(
			b.amount
		)}</span><button class="fin-bill-status-btn ${
			b.paid ? 'paid' : ''
		}" onclick="finance.toggleBill(${b.id})">${
			b.paid ? '✓' : 'Оплатить'
		}</button><button class="fin-bill-del" onclick="finance.deleteBill(${
			b.id
		})">✕</button></div>`
	}

	renderBillsWidget() {
		const w = document.getElementById('billsWidget')
		if (!w) return
		const urgent = this.getUrgentBills()
		const us = this.bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0)
		let html =
			us > 0
				? `<div style="display:flex;justify-content:space-between;padding:6px 10px;margin-bottom:6px;background:rgba(239,68,68,0.08);border-radius:6px;font-size:0.8rem;font-weight:600;"><span>📅 К оплате:</span><span style="color:#f87171;">${this.fmt(
						us
				  )}</span></div>`
				: ''
		if (!urgent.length)
			html +=
				'<p style="color:var(--text-secondary);font-size:0.8rem;">Нет срочных платежей ✅</p>'
		else
			html += urgent
				.slice(0, 3)
				.map(
					b =>
						`<div class="fin-bill urgent" style="padding:8px 12px;margin-bottom:4px;font-size:0.8rem;"><div class="fin-bill-info"><div class="fin-bill-name">${this.esc(
							b.name
						)}</div><div class="fin-bill-meta">📅 ${
							b.date
						} · ${this.getDaysLeft(
							b.date
						)} дн.</div></div><span class="fin-bill-amount">-${this.fmt(
							b.amount
						)}</span></div>`
				)
				.join('')
		w.innerHTML = html
	}

	esc(t) {
		const d = document.createElement('div')
		d.textContent = t
		return d.innerHTML
	}
	fmt(n) {
		return new Intl.NumberFormat('ru-RU').format(Math.abs(n)) + ' ₽'
	}
}
document.addEventListener('DOMContentLoaded', () => {
	window.finance = new Finance()
})
