// AWaves 自定义元素（index.html 和 history.html 通用）
class AWaves extends HTMLElement {
  connectedCallback() {
    this.svg = this.querySelector('svg')
    this.time = 0
    this.waves = []
    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      lx: window.innerWidth / 2,
      ly: window.innerHeight / 2,
      v: 0
    }
    this.animationProgress = 0
    this.bindEvents()
    this.setSize()
    this.createWaves()
    requestAnimationFrame(this.tick.bind(this))
  }
  bindEvents() {
    window.addEventListener('resize', () => {
      this.setSize()
      this.createWaves()
    })
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
    window.addEventListener('touchmove', (e) => {
      this.mouse.x = e.touches[0].clientX
      this.mouse.y = e.touches[0].clientY
    })
  }
  setSize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
  }
  createWaves() {
    this.svg.innerHTML = ''
    this.waves = []
    const waveCount = 5
    const colors = [
      { color: '#0a3d62', opacity: 0.8 },
      { color: '#0e5a8a', opacity: 0.7 },
      { color: '#1e88c7', opacity: 0.6 },
      { color: '#3da5e0', opacity: 0.5 },
      { color: '#60c5f1', opacity: 0.4 }
    ]
    for (let i = 0; i < waveCount; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const colorInfo = colors[i]
      path.setAttribute('fill', colorInfo.color)
      path.setAttribute('opacity', colorInfo.opacity)
      this.svg.appendChild(path)
      const points = []
      const pointCount = 150
      for (let j = 0; j <= pointCount; j++) {
        points.push({
          x: (this.width / pointCount) * j,
          offset: 0,
          velocity: 0
        })
      }
      this.waves.push({
        path: path,
        amplitude: 20 + i * 8,
        frequency: 0.004 + i * 0.0008,
        speed: 0.06 + i * 0.03,
        yOffset: this.height * 0.85 - i * 60,
        initialYOffset: this.height + 100,
        points: points,
        index: i,
        delay: i * 0.15
      })
    }
  }
  drawWave(wave, time) {
    let pathData = ''
    pathData = `M 0 ${this.height}`
    const yCoords = []
    const delayedProgress = Math.max(0, this.animationProgress - wave.delay)
    const easedProgress = this.easeOutCubic(Math.min(delayedProgress, 1))
    const currentYOffset = wave.initialYOffset + (wave.yOffset - wave.initialYOffset) * easedProgress
    wave.points.forEach((point, i) => {
      let y = currentYOffset + 
              Math.sin((point.x * wave.frequency) + (time * wave.speed)) * wave.amplitude +
              Math.sin((point.x * wave.frequency * 1.5) - (time * wave.speed * 0.7)) * (wave.amplitude * 0.3)
      const dx = point.x - this.mouse.x
      const dy = y - this.mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const influenceRadius = 250
      if (distance < influenceRadius && this.mouse.v > 0.1) {
        const force = (1 - distance / influenceRadius) * this.mouse.v * 0.3
        const angle = Math.atan2(dy, dx)
        point.velocity -= Math.sin(angle) * force
      }
      point.velocity += (0 - point.offset) * 0.008
      point.velocity *= 0.95
      point.offset += point.velocity
      point.offset = Math.max(-50, Math.min(50, point.offset))
      y += point.offset
      yCoords.push(y)
    })
    pathData += ` L 0 ${yCoords[0]}`
    for (let i = 0; i < wave.points.length; i++) {
      const point = wave.points[i]
      const y = yCoords[i]
      if (i === 0) {
        pathData += ` L ${point.x} ${y}`
      } else {
        const prevPoint = wave.points[i - 1]
        const prevY = yCoords[i - 1]
        const cpX = (prevPoint.x + point.x) / 2
        const cpY = (prevY + y) / 2
        pathData += ` Q ${prevPoint.x} ${prevY}, ${cpX} ${cpY}`
        if (i === wave.points.length - 1) {
          pathData += ` Q ${cpX} ${cpY}, ${point.x} ${y}`
        }
      }
    }
    pathData += ` L ${this.width} ${this.height} Z`
    wave.path.setAttribute('d', pathData)
  }
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }
  tick(time) {
    this.time += 0.05
    if (this.animationProgress < 2.5) {
      this.animationProgress += 0.01
    }
    const dx = this.mouse.x - this.mouse.lx
    const dy = this.mouse.y - this.mouse.ly
    this.mouse.v = Math.sqrt(dx * dx + dy * dy)
    this.mouse.lx = this.mouse.x
    this.mouse.ly = this.mouse.y
    this.waves.forEach(wave => {
      this.drawWave(wave, this.time)
    })
    requestAnimationFrame(this.tick.bind(this))
  }
}
customElements.define('a-waves', AWaves)
