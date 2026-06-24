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
