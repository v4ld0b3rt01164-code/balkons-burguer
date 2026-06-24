import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  /* ===== HERO ===== */
  const heroTrack = document.getElementById('hero-track')
  const heroSection = document.getElementById('hero-section')
  const heroVideo = document.getElementById('hero-video')

  if (heroTrack && heroSection && heroVideo) {
    /* Height = 3x viewport → 10s video scrub distance */
    const trackHeight = window.innerHeight * 3
    heroTrack.style.height = trackHeight + 'px'

    const loadBar = document.getElementById('load-bar')
    const loadPct = document.getElementById('load-pct')
    const loading = document.getElementById('hero-loading')

    /* Choose source based on screen width */
    let loaded = false
    const setVideoSrc = () => {
      const isMobile = window.innerWidth < 768
      heroVideo.src = isMobile ? heroVideo.dataset.srcMobile : heroVideo.dataset.srcPc
      loaded = false
      if (loading) { loading.style.opacity = '1'; loading.style.display = '' }
      heroVideo.load()
    }
    setVideoSrc()
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 768
      const current = heroVideo.src
      const target = isMobile ? heroVideo.dataset.srcMobile : heroVideo.dataset.srcPc
      if (!current.includes(target)) setVideoSrc()
    })

    /* Hide loading when ready */
    const hideLoad = () => {
      if (loaded) return
      loaded = true
      loading.style.opacity = '0'
      setTimeout(() => { loading.style.display = 'none' }, 500)
    }
    heroVideo.addEventListener('canplay', hideLoad)
    heroVideo.addEventListener('loadeddata', hideLoad)

    /* Buffering progress */
    setInterval(() => {
      if (heroVideo.readyState >= 2) { hideLoad(); return }
      if (heroVideo.buffered.length > 0) {
        const pct = Math.round((heroVideo.buffered.end(0) / heroVideo.duration) * 100)
        loadBar.style.width = pct + '%'
        if (loadPct) loadPct.textContent = String(pct)
      }
    }, 200)

    /* Seek first frame */
    heroVideo.addEventListener('loadedmetadata', () => { heroVideo.currentTime = 0 })

    /* Scroll scrub */
    const tick = () => {
      const rect = heroTrack.getBoundingClientRect()
      const max = heroTrack.offsetHeight - window.innerHeight
      const p = max <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / max))

      if (heroVideo.duration && heroVideo.readyState >= 2) {
        heroVideo.currentTime = p * heroVideo.duration
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

  /* ===== CARDAPIO TABS ===== */
  const tabs = document.querySelectorAll('.cardapio-tab')
  const categories = document.querySelectorAll('.cardapio-category')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      const target = tab.dataset.tab
      categories.forEach(cat => {
        cat.style.display = cat.dataset.category === target ? 'block' : 'none'
      })
    })
  })

  if (tabs.length > 0) tabs[0].click()

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
