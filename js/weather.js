class WeatherWidget {
	constructor() {
		this.city = 'Moscow'
		this.latitude = 55.7558 // Москва по умолчанию
		this.longitude = 37.6173
		this.init()
	}

	async init() {
		// Пробуем получить геолокацию пользователя
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				pos => {
					this.latitude = pos.coords.latitude
					this.longitude = pos.coords.longitude
					this.fetchWeather()
				},
				() => {
					// Если не получилось - используем Москву
					this.fetchWeather()
				}
			)
		} else {
			this.fetchWeather()
		}

		// Обновление каждые 30 минут
		setInterval(() => this.fetchWeather(), 30 * 60 * 1000)
	}

	async fetchWeather() {
		const widget = document.getElementById('weatherWidget')
		if (!widget) return

		try {
			widget.innerHTML = '<div class="weather-loading">⏳ Загрузка...</div>'

			// Используем Open-Meteo API - бесплатный, без ключа
			const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.latitude}&longitude=${this.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`

			const response = await fetch(url)
			const data = await response.json()

			if (!data.current) throw new Error('Нет данных')

			const temp = Math.round(data.current.temperature_2m)
			const humidity = data.current.relative_humidity_2m
			const windSpeed = Math.round(data.current.wind_speed_10m)
			const weatherCode = data.current.weather_code

			// Получаем название города через обратную геолокацию
			const cityName = await this.getCityName(this.latitude, this.longitude)

			// Описание погоды по коду
			const weatherInfo = this.getWeatherByCode(weatherCode)

			widget.innerHTML = `
                <div class="weather-icon">${weatherInfo.emoji}</div>
                <div class="weather-info">
                    <div class="weather-temp">${
											temp > 0 ? '+' : ''
										}${temp}°C</div>
                    <div class="weather-desc">${weatherInfo.description}</div>
                    <div class="weather-city">📍 ${cityName}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">💧 Влажность: ${humidity}%</div>
                    <div class="weather-detail">💨 Ветер: ${windSpeed} м/с</div>
                </div>
            `
		} catch (error) {
			console.log('Ошибка погоды:', error)
			// Показываем заглушку с примерной погодой
			widget.innerHTML = `
                <div class="weather-icon">🌤️</div>
                <div class="weather-info">
                    <div class="weather-temp">+22°C</div>
                    <div class="weather-desc">Переменная облачность</div>
                    <div class="weather-city">📍 Москва</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">💧 Влажность: 65%</div>
                    <div class="weather-detail">💨 Ветер: 4 м/с</div>
                    <div class="weather-detail" style="font-size:0.65rem;color:var(--text-secondary);">(нет интернета)</div>
                </div>
            `
		}
	}

	async getCityName(lat, lon) {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`
			)
			const data = await response.json()

			if (data.address) {
				return (
					data.address.city ||
					data.address.town ||
					data.address.village ||
					data.address.county ||
					'Неизвестно'
				)
			}
			return 'Москва'
		} catch {
			return 'Москва'
		}
	}

	getWeatherByCode(code) {
		const weatherMap = {
			0: { emoji: '☀️', description: 'Ясно' },
			1: { emoji: '🌤️', description: 'Преимущественно ясно' },
			2: { emoji: '⛅', description: 'Переменная облачность' },
			3: { emoji: '☁️', description: 'Пасмурно' },
			45: { emoji: '🌫️', description: 'Туман' },
			48: { emoji: '🌫️', description: 'Изморозь' },
			51: { emoji: '🌧️', description: 'Морось' },
			53: { emoji: '🌧️', description: 'Морось' },
			55: { emoji: '🌧️', description: 'Сильная морось' },
			61: { emoji: '🌦️', description: 'Небольшой дождь' },
			63: { emoji: '🌧️', description: 'Дождь' },
			65: { emoji: '🌧️', description: 'Сильный дождь' },
			71: { emoji: '🌨️', description: 'Небольшой снег' },
			73: { emoji: '🌨️', description: 'Снег' },
			75: { emoji: '❄️', description: 'Сильный снегопад' },
			80: { emoji: '🌦️', description: 'Ливень' },
			81: { emoji: '🌧️', description: 'Ливень' },
			82: { emoji: '⛈️', description: 'Сильный ливень' },
			95: { emoji: '⛈️', description: 'Гроза' },
			96: { emoji: '⛈️', description: 'Гроза с градом' },
			99: { emoji: '⛈️', description: 'Сильная гроза' },
		}

		return weatherMap[code] || { emoji: '🌤️', description: 'Ясно' }
	}
}

document.addEventListener('DOMContentLoaded', () => {
	window.weatherWidget = new WeatherWidget()
})
