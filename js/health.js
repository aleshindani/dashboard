class HealthTracker {
	constructor() {
		this.records = UserStorage.get('health-records', [])
		this.init()
	}
	save() {
		UserStorage.set('health-records', this.records)
	}
	init() {
		this.renderAll()
		document.getElementById('addHealthBtn').onclick = () => this.addRecord()
		document.getElementById('sugarTime').value = new Date()
			.toTimeString()
			.slice(0, 5)
	}
	addRecord() {
		const s = parseFloat(document.getElementById('sugarLevel').value),
			t = document.getElementById('sugarTime').value,
			i = parseFloat(document.getElementById('insulinDose').value) || 0,
			b = parseFloat(document.getElementById('breadUnits').value) || 0,
			type = document.getElementById('insulinType').value,
			n = document.getElementById('sugarNote').value.trim()
		if (!s || !t) {
			alert('Введите сахар и время')
			return
		}
		this.records.unshift({
			id: Date.now(),
			sugar: s,
			time: t,
			insulin: i,
			bread: b,
			type,
			note: n,
			date: new Date().toISOString().slice(0, 10),
		})
		if (this.records.length > 500) this.records = this.records.slice(0, 500)
		this.save()
		this.renderAll()
		document.getElementById('sugarLevel').value = ''
		document.getElementById('insulinDose').value = ''
		document.getElementById('breadUnits').value = ''
		document.getElementById('sugarNote').value = ''
	}
	deleteRecord(id) {
		this.records = this.records.filter(r => r.id !== id)
		this.save()
		this.renderAll()
	}
	getTodayRecords() {
		const t = new Date().toISOString().slice(0, 10)
		return this.records
			.filter(r => r.date === t)
			.sort((a, b) => a.time.localeCompare(b.time))
	}
	getSugarClass(s) {
		if (s < 4) return 'low'
		if (s <= 7) return 'normal'
		if (s <= 10) return 'high'
		return 'very-high'
	}
	renderAll() {
		this.renderStats()
		this.renderChart()
		this.renderHistory()
	}
	renderStats() {
		const today = this.getTodayRecords()
		const avg = today.length
			? (today.reduce((s, r) => s + r.sugar, 0) / today.length).toFixed(1)
			: '--'
		document.getElementById('avgSugar').textContent =
			avg !== '--' ? avg + ' ммоль/л' : '--'
		document.getElementById('totalInsulin').textContent =
			today.reduce((s, r) => s + r.insulin, 0) + ' ед.'
		document.getElementById('totalBread').textContent =
			today.reduce((s, r) => s + r.bread, 0) + ' ХЕ'
		document.getElementById('sugarCount').textContent = today.length
	}
	renderChart() {
		const c = document.getElementById('sugarChart')
		if (!c) return
		const today = this.getTodayRecords()
		if (!today.length) {
			c.innerHTML = '<p class="empty-text">Нет данных</p>'
			return
		}
		const max = Math.max(...today.map(r => r.sugar), 10)
		c.innerHTML = today
			.map(
				r =>
					`<div class="sugar-bar-group" title="${r.time} - ${
						r.sugar
					}"><div class="sugar-bar ${this.getSugarClass(
						r.sugar
					)}" style="height:${Math.max(
						(r.sugar / max) * 100,
						5
					)}%"></div><span class="sugar-bar-time">${r.time.slice(
						0,
						5
					)}</span></div>`
			)
			.join('')
	}
	renderHistory() {
		const l = document.getElementById('healthHistory')
		if (!l) return
		const today = this.getTodayRecords()
		if (!today.length) {
			l.innerHTML = '<p class="empty-text">Нет записей</p>'
			return
		}
		l.innerHTML = today
			.map(
				r =>
					`<div class="health-record"><span class="health-record-sugar ${this.getSugarClass(
						r.sugar
					)}">${
						r.sugar
					}</span><div class="health-record-info"><div>🕐 ${r.time.slice(
						0,
						5
					)} ${r.insulin ? '· 💉 ' + r.insulin + ' ед.' : ''} ${
						r.bread ? '· 🍞 ' + r.bread + ' ХЕ' : ''
					}</div>${
						r.note
							? `<div class="health-record-detail">${this.esc(r.note)}</div>`
							: ''
					}</div><button class="health-record-del" onclick="health.deleteRecord(${
						r.id
					})">✕</button></div>`
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
	window.health = new HealthTracker()
})
