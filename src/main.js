import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Constants ─────────────────────────────────────── */
const TRACK_HEIGHT_MULTIPLIER = 3
const NAV_SCROLL_THRESHOLD = 80
const SECTION_VISIBILITY_RATIO = 0.5
const LOADING_HIDE_DELAY_MS = 500
const REVEAL_THRESHOLD = 0.15
const MAX_REVEAL_DELAY = 4
const MOBILE_FRAME_COUNT = 135

/* ─── Helpers ───────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

document.addEventListener('DOMContentLoaded', () => {
  history.scrollRestoration = 'manual'

  /* ===== HERO ===== */
  const heroTrack = document.getElementById('hero-track')
  const heroSection = document.getElementById('hero-section')
  const pcVideo = document.getElementById('hero-video-pc')
  const mobileCanvas = document.getElementById('hero-canvas-mobile')
  const loadBar = document.getElementById('load-bar')
  const loadPct = document.getElementById('load-pct')
  const loading = document.getElementById('hero-loading')

  const isMobile = () => mobileCanvas && getComputedStyle(mobileCanvas).display !== 'none'

  let loadHidden = false
  const hideLoad = () => {
    if (loadHidden) return
    loadHidden = true
    loading.style.opacity = '0'
    setTimeout(() => { loading.style.display = 'none' }, LOADING_HIDE_DELAY_MS)
  }

  if (heroTrack && heroSection) {
    heroTrack.style.height = window.innerHeight * TRACK_HEIGHT_MULTIPLIER + 'px'

    if (isMobile()) {
      /* ── MOBILE: Canvas image sequence + GSAP ScrollTrigger ── */
      document.body.style.overflow = 'hidden'
      const ctx = mobileCanvas.getContext('2d')
      const frames = []
      let loadedCount = 0

      const drawFrame = (idx) => {
        const img = frames[idx]
        if (img && img.complete && img.naturalWidth) {
          mobileCanvas.width = img.naturalWidth
          mobileCanvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)
        }
      }

      for (let i = 1; i <= MOBILE_FRAME_COUNT; i++) {
        const img = new Image()
        const num = String(i).padStart(3, '0')
        img.src = `/hero/mobile/ezgif-frame-${num}.jpg`
        img.onload = () => {
          loadedCount++
          if (loadBar) {
            const pct = Math.round((loadedCount / MOBILE_FRAME_COUNT) * 100)
            loadBar.style.width = pct + '%'
            if (loadPct) loadPct.textContent = String(pct)
          }
          if (loadedCount === MOBILE_FRAME_COUNT) {
            drawFrame(0)
            hideLoad()
            document.body.style.overflow = ''
            initMobileScrub()
          }
        }
        frames.push(img)
      }

      function initMobileScrub() {
        const obj = { frame: 0 }
        gsap.to(obj, {
          frame: MOBILE_FRAME_COUNT - 1,
          ease: 'none',
          scrollTrigger: {
            trigger: heroTrack,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
          onUpdate() {
            drawFrame(Math.round(obj.frame))
          },
        })
      }

    } else if (pcVideo) {
      /* ── DESKTOP: Video scrub via rAF ── */
      pcVideo.src = pcVideo.dataset.src

      const onVidReady = () => {
        if (loadHidden) return
        if (pcVideo.readyState >= 2) hideLoad()
      }
      pcVideo.addEventListener('canplay', onVidReady)
      pcVideo.addEventListener('loadeddata', onVidReady)

      const bufferTimer = setInterval(() => {
        if (loadHidden) { clearInterval(bufferTimer); return }
        if (pcVideo.readyState >= 2) { hideLoad(); clearInterval(bufferTimer); return }
        if (pcVideo.buffered.length > 0 && pcVideo.duration) {
          const pct = Math.round((pcVideo.buffered.end(0) / pcVideo.duration) * 100)
          if (loadBar) loadBar.style.width = pct + '%'
          if (loadPct) loadPct.textContent = String(pct)
        }
      }, 200)

      const tick = () => {
        const rect = heroTrack.getBoundingClientRect()
        const max = heroTrack.offsetHeight - window.innerHeight
        const p = max <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / max))
        if (pcVideo.duration && pcVideo.readyState >= 2) {
          pcVideo.currentTime = p * pcVideo.duration
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  }

  /* ===== SCROLL ARROW ===== */
  const scrollArrow = document.getElementById('scroll-arrow')
  if (scrollArrow) {
    const hideArrow = () => {
      requestAnimationFrame(() => scrollArrow.classList.add('hidden'))
      window.removeEventListener('scroll', hideArrow)
    }
    window.addEventListener('scroll', hideArrow, { passive: true, once: true })
  }

  /* ===== NAV SCROLL ===== */
  const nav = $('.nav')
  const activeClass = 'nav-link-active'

  window.addEventListener('scroll', () => {
    const sy = window.scrollY
    nav?.classList.toggle('scrolled', sy > NAV_SCROLL_THRESHOLD)

    $$('[data-section]').forEach(sec => {
      const rect = sec.getBoundingClientRect()
      const id = sec.getAttribute('data-section')
      const link = $(`.nav-links a[href="#${id}"]`)
      if (!link) return
      const isActive = rect.top < window.innerHeight * SECTION_VISIBILITY_RATIO && rect.bottom > 0
      link.classList.toggle(activeClass, isActive)
    })
  })

  /* ===== MOBILE MENU ===== */
  const menuToggle = $('.menu-toggle')
  const mobileNav = $('.mobile-nav')
  const mobileOverlay = $('.mobile-nav-overlay')

  function toggleMenu(open) {
    menuToggle?.classList.toggle('active', open)
    menuToggle?.setAttribute('aria-expanded', String(open))
    mobileNav?.classList.toggle('open', open)
    mobileOverlay?.classList.toggle('open', open)
    document.body.style.overflow = open ? 'hidden' : ''
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.contains('open')
    toggleMenu(!isOpen)
  })

  mobileOverlay?.addEventListener('click', () => toggleMenu(false))

  $$('.mobile-nav a').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false))
  })

  /* ===== REVEAL ON SCROLL ===== */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: REVEAL_THRESHOLD })

  $$('.reveal').forEach(el => observer.observe(el))

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

    tabsEl.setAttribute('role', 'tablist')

    const tabNames = Object.keys(tabGroup)
    let activeTab = tabNames[0]

    const render = () => {
      tabsEl.innerHTML = ''
      contentEl.innerHTML = ''

      tabNames.forEach((name) => {
        const btn = document.createElement('button')
        btn.className = 'cardapio-tab'
        btn.setAttribute('role', 'tab')
        btn.setAttribute('aria-selected', name === activeTab ? 'true' : 'false')
        if (name === activeTab) btn.classList.add('active')
        btn.textContent = name.toUpperCase()
        btn.addEventListener('click', () => { activeTab = name; render() })
        tabsEl.appendChild(btn)
      })

      const items = data.filter(tabGroup[activeTab])
      const grid = document.createElement('div')
      grid.className = 'cardapio-grid'
      grid.setAttribute('role', 'tabpanel')

      items.forEach((item, idx) => {
        const div = document.createElement('div')
        const delay = Math.min(idx, MAX_REVEAL_DELAY)
        div.className = 'cardapio-item reveal' + (idx > 0 ? ' reveal-delay-' + delay : '')

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

      grid.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    }

    render()
  })()

  /* ===== CARDAPIO TOGGLE ===== */
  const cardapioToggle = document.getElementById('cardapio-toggle')
  const cardapioBody = document.getElementById('cardapio-body')
  if (cardapioToggle && cardapioBody) {
    cardapioToggle.addEventListener('click', () => {
      const isOpen = cardapioBody.classList.toggle('open')
      cardapioToggle.textContent = isOpen ? 'Fechar cardápio' : 'Ver nosso cardápio'
      cardapioToggle.setAttribute('aria-expanded', String(isOpen))
      if (isOpen) {
        setTimeout(() => {
          cardapioBody.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    })
  }
})
