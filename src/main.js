import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  /* ===== HERO ===== */
  const heroTrack = document.getElementById('hero-track')
  const heroSection = document.getElementById('hero-section')
  const vids = {
    pc: document.getElementById('hero-video-pc'),
    mobile: document.getElementById('hero-video-mobile'),
  }

  if (heroTrack && heroSection && vids.pc && vids.mobile) {
    const trackHeight = window.innerHeight * 3
    heroTrack.style.height = trackHeight + 'px'

    const loadBar = document.getElementById('load-bar')
    const loadPct = document.getElementById('load-pct')
    const loading = document.getElementById('hero-loading')

    /* Init both videos */
    vids.pc.src = vids.pc.dataset.src
    vids.mobile.src = vids.mobile.dataset.src

    /* Get currently active video (visible one) */
    const activeVideo = () => getComputedStyle(vids.pc).display !== 'none' ? vids.pc : vids.mobile

    /* Hide loading when either video is ready */
    let loaded = { pc: false, mobile: false }
    const hideLoad = (vid) => {
      const key = vid === vids.pc ? 'pc' : 'mobile'
      if (loaded[key]) return
      loaded[key] = true
      if (loaded.pc && loaded.mobile) {
        loading.style.opacity = '0'
        setTimeout(() => { loading.style.display = 'none' }, 500)
      }
    }
    vids.pc.addEventListener('canplay', () => hideLoad(vids.pc))
    vids.pc.addEventListener('loadeddata', () => hideLoad(vids.pc))
    vids.mobile.addEventListener('canplay', () => hideLoad(vids.mobile))
    vids.mobile.addEventListener('loadeddata', () => hideLoad(vids.mobile))

    /* Buffering progress (on whichever loads first) */
    setInterval(() => {
      const v = activeVideo()
      if (v.readyState >= 2) { hideLoad(v); return }
      if (v.buffered.length > 0) {
        const pct = Math.round((v.buffered.end(0) / v.duration) * 100)
        loadBar.style.width = pct + '%'
        if (loadPct) loadPct.textContent = String(pct)
      }
    }, 200)

    /* Seek first frame on both */
    const seekFirst = (v) => { v.addEventListener('loadedmetadata', () => { v.currentTime = 0 }, { once: true }) }
    seekFirst(vids.pc)
    seekFirst(vids.mobile)

    /* Scroll scrub */
    const tick = () => {
      const rect = heroTrack.getBoundingClientRect()
      const max = heroTrack.offsetHeight - window.innerHeight
      const p = max <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / max))

      const v = activeVideo()
      if (v.duration && v.readyState >= 2) {
        v.currentTime = p * v.duration
      }

      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /* ===== NAV SCROLL ===== */
  const nav = document.querySelector('.nav')

  window.addEventListener('scroll', () => {
    const sy = window.scrollY
    if (sy > 80) {
      nav?.classList.add('scrolled')
    } else {
      nav?.classList.remove('scrolled')
    }

    const sections = document.querySelectorAll('[data-section]')
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect()
      const id = sec.getAttribute('data-section')
      const link = document.querySelector(`.nav-links a[href="#${id}"]`)
      if (link && rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
        link.style.color = 'var(--orange)'
      } else if (link) {
        link.style.color = ''
      }
    })
  })

  /* ===== MOBILE MENU ===== */
  const menuToggle = document.querySelector('.menu-toggle')
  const mobileNav = document.querySelector('.mobile-nav')
  const mobileOverlay = document.querySelector('.mobile-nav-overlay')

  function toggleMenu(open) {
    menuToggle?.classList.toggle('active', open)
    mobileNav?.classList.toggle('open', open)
    mobileOverlay?.classList.toggle('open', open)
    document.body.style.overflow = open ? 'hidden' : ''
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.contains('open')
    toggleMenu(!isOpen)
  })

  mobileOverlay?.addEventListener('click', () => toggleMenu(false))

  document.querySelectorAll('.mobile-nav a').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false))
  })

  /* ===== CARDAPIO ===== */
  ;(async () => {
    const res = await fetch('/cardapio.json')
    const data = await res.json()

    const tabGroup = {
      'Hambúrguers': (i) => i.categoria === 'Hambúrguers' || i.categoria === 'Promoção do Dia',
      'Combos':       (i) => i.categoria === 'Combos',
      'Porções':      (i) => i.categoria === 'Porcões' || i.categoria === 'Batatas',
      'Sobremesas':   (i) => i.categoria === 'Sobremesas',
      'Bebidas':      (i) => i.categoria === 'Bebidas',
      'Adicionais':   (i) => i.categoria === 'Molhos Especiais' || i.categoria === 'Adicionais',
    }

    const tabsEl = document.getElementById('cardapio-tabs')
    const contentEl = document.getElementById('cardapio-content')

    const tabNames = Object.keys(tabGroup)
    let activeTab = tabNames[0]

    const render = () => {
      tabsEl.innerHTML = ''
      contentEl.innerHTML = ''

      tabNames.forEach((name, idx) => {
        const btn = document.createElement('button')
        btn.className = 'cardapio-tab'
        if (name === activeTab) btn.classList.add('active')
        btn.textContent = name.toUpperCase()
        btn.addEventListener('click', () => { activeTab = name; render() })
        tabsEl.appendChild(btn)
      })

      const items = data.filter(tabGroup[activeTab])
      const grid = document.createElement('div')
      grid.className = 'cardapio-grid'

      items.forEach((item, idx) => {
        const div = document.createElement('div')
        div.className = 'cardapio-item' + (idx === 0 ? ' reveal' : ' reveal reveal-delay-' + Math.min(idx, 4))

        const header = document.createElement('div')
        header.className = 'cardapio-item-header'

        const name = document.createElement('span')
        name.className = 'cardapio-item-name'
        name.textContent = item.item

        const price = document.createElement('span')
        price.className = 'cardapio-item-price'
        price.textContent = 'R$ ' + item.preco.toFixed(2).replace('.', ',')

        header.appendChild(name)
        header.appendChild(price)
        div.appendChild(header)

        if (item.descricao) {
          const desc = document.createElement('p')
          desc.className = 'cardapio-item-desc'
          desc.textContent = item.descricao
          div.appendChild(desc)
        }

        grid.appendChild(div)
      })

      contentEl.appendChild(grid)
    }

    render()
  })()

  /* ===== REVEAL ON SCROLL ===== */
  const revealEls = document.querySelectorAll('.reveal')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  revealEls.forEach(el => observer.observe(el))
})
