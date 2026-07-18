class PhotoDiary {
	constructor() {
		this.photos = UserStorage.get('photodiary', [])
		this.currentPhoto = null
		this.init()
	}
	save() {
		UserStorage.set('photodiary', this.photos)
	}
	init() {
		this.render()
		document.getElementById('photoDate').value = new Date()
			.toISOString()
			.slice(0, 10)
		document.getElementById('photoUploadArea').onclick = () =>
			document.getElementById('photoInput').click()
		document.getElementById('photoInput').onchange = e => this.previewPhoto(e)
		document.getElementById('savePhotoBtn').onclick = () => this.savePhoto()
	}
	previewPhoto(e) {
		const file = e.target.files[0]
		if (!file) return
		if (file.size > 5 * 1024 * 1024) {
			alert('Фото слишком большое (макс 5MB)')
			return
		}
		const reader = new FileReader()
		reader.onload = ev => {
			this.currentPhoto = ev.target.result
			document.getElementById(
				'photoPreview'
			).innerHTML = `<img src="${ev.target.result}">`
		}
		reader.readAsDataURL(file)
	}
	savePhoto() {
		if (!this.currentPhoto) {
			alert('Выберите фото')
			return
		}
		const date = document.getElementById('photoDate').value,
			caption = document.getElementById('photoCaption').value.trim()
		if (!date) {
			alert('Выберите дату')
			return
		}
		const exist = this.photos.findIndex(p => p.date === date)
		const pd = {
			id: Date.now().toString(),
			date,
			caption,
			src: this.currentPhoto,
		}
		if (exist >= 0) {
			if (!confirm('Заменить фото?')) return
			this.photos[exist] = pd
		} else this.photos.unshift(pd)
		this.photos.sort((a, b) => b.date.localeCompare(a.date))
		this.save()
		this.render()
		this.resetForm()
	}
	resetForm() {
		this.currentPhoto = null
		document.getElementById('photoPreview').innerHTML =
			'<span style="font-size:3rem;">📷</span><p>Нажмите чтобы выбрать фото</p>'
		document.getElementById('photoInput').value = ''
		document.getElementById('photoCaption').value = ''
	}
	deletePhoto(id) {
		if (!confirm('Удалить?')) return
		this.photos = this.photos.filter(p => p.id !== id)
		this.save()
		this.render()
	}
	viewPhoto(p) {
		let v = document.getElementById('photoViewer')
		if (!v) {
			v = document.createElement('div')
			v.id = 'photoViewer'
			v.className = 'photo-viewer'
			v.innerHTML =
				'<button class="photo-viewer-close" onclick="this.parentElement.classList.remove(\'active\')">✕</button><img src=""><div class="photo-viewer-caption"></div>'
			document.body.appendChild(v)
		}
		v.querySelector('img').src = p.src
		v.querySelector('.photo-viewer-caption').textContent = `${p.date} — ${
			p.caption || 'Без подписи'
		}`
		v.classList.add('active')
		v.onclick = e => {
			if (e.target === v) v.classList.remove('active')
		}
	}
	render() {
		const grid = document.getElementById('photoGrid')
		if (!grid) return
		if (!this.photos.length) {
			grid.innerHTML = '<p class="empty-text">Нет фото</p>'
			return
		}
		grid.innerHTML = this.photos
			.map(
				p =>
					`<div class="photo-item" onclick="window.photodiary.viewPhoto(window.photodiary.photos.find(x=>x.id==='${
						p.id
					}'))"><img src="${
						p.src
					}" loading="lazy"><div class="photo-item-info"><div class="photo-item-text"><div class="photo-item-date">📅 ${
						p.date
					}</div>${
						p.caption
							? `<div class="photo-item-caption">${this.esc(p.caption)}</div>`
							: ''
					}</div><button class="photo-item-del" onclick="event.stopPropagation();window.photodiary.deletePhoto('${
						p.id
					}')">✕</button></div></div>`
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
	window.photodiary = new PhotoDiary()
})
