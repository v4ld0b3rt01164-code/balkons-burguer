/* ─── Constants ─────────────────────────────────────── */
var NAV_SCROLL_THRESHOLD = 80
var SECTION_VISIBILITY_RATIO = 0.5
var LOADING_HIDE_DELAY_MS = 500
var REVEAL_THRESHOLD = 0.15
var MAX_REVEAL_DELAY = 4
var MOBILE_FRAME_COUNT = 135
var PC_FRAME_COUNT = 202

/* ─── Helpers ───────────────────────────────────────── */
function $(sel, ctx) { return (ctx || document).querySelector(sel) }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)) }

document.addEventListener('DOMContentLoaded', function () {
  history.scrollRestoration = 'manual'

  gsap.registerPlugin(ScrollTrigger)

  /* ===== HERO ===== */
  var heroTrack = document.getElementById('hero-track')
  var heroSection = document.getElementById('hero-section')
  var pcCanvas = document.getElementById('hero-canvas-pc')
  var mobileCanvas = document.getElementById('hero-canvas-mobile')
  var loadBar = document.getElementById('load-bar')
  var loadPct = document.getElementById('load-pct')
  var loading = document.getElementById('hero-loading')

  function isMobile() {
    return mobileCanvas && getComputedStyle(mobileCanvas).display !== 'none'
  }

  var loadHidden = false
  function hideLoad() {
    if (loadHidden) return
    loadHidden = true
    loading.style.opacity = '0'
    setTimeout(function () { loading.style.display = 'none' }, LOADING_HIDE_DELAY_MS)
  }

  function preventScroll(e) { e.preventDefault() }
  function preventKey(e) {
    var keys = [32, 33, 34, 35, 36, 37, 38, 39, 40]
    if (keys.indexOf(e.keyCode) > -1) e.preventDefault()
  }

  var scrollOverlay = null
  function lockScroll() {
    document.documentElement.classList.add('scroll-locked')
    scrollOverlay = document.createElement('div')
    scrollOverlay.className = 'scroll-lock-overlay'
    document.body.appendChild(scrollOverlay)
    window.addEventListener('touchmove', preventScroll, { passive: false })
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('keydown', preventKey, { passive: false })
  }

  function unlockScroll() {
    document.documentElement.classList.remove('scroll-locked')
    if (scrollOverlay && scrollOverlay.parentNode) {
      scrollOverlay.parentNode.removeChild(scrollOverlay)
    }
    scrollOverlay = null
    window.removeEventListener('touchmove', preventScroll)
    window.removeEventListener('wheel', preventScroll)
    window.removeEventListener('keydown', preventKey)
  }

  function initHero(canvas, frameCount) {
    var ctx = canvas.getContext('2d')
    var frames = []
    var loadedCount = 0
    var folder = isMobile() ? 'mobile' : 'desktop'

    function drawFrame(idx) {
      var img = frames[idx]
      if (img && img.complete && img.naturalWidth) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
      }
    }

    for (var i = 1; i <= frameCount; i++) {
      var img = new Image()
      var num = String(i).padStart(3, '0')
      img.src = '/hero/' + folder + '/ezgif-frame-' + num + '.jpg'
      img.onload = function () {
        loadedCount++
        if (loadBar) {
          var pct = Math.round((loadedCount / frameCount) * 100)
          loadBar.style.width = pct + '%'
          if (loadPct) loadPct.textContent = String(pct)
        }
        if (loadedCount === frameCount) {
          drawFrame(0)
          hideLoad()

          var scrollDistance = frameCount * 16
          var obj = { frame: 0 }
          gsap.to(obj, {
            frame: frameCount - 1,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: '+=' + scrollDistance,
              scrub: 0.3,
              pin: true,
              anticipatePin: 1,
            },
            onUpdate: function () {
              drawFrame(Math.round(obj.frame))
            },
          })

          unlockScroll()
        }
      }
      frames.push(img)
    }
  }

  if (heroTrack && heroSection) {
    lockScroll()

    if (isMobile()) {
      initHero(mobileCanvas, MOBILE_FRAME_COUNT)
    } else if (pcCanvas) {
      initHero(pcCanvas, PC_FRAME_COUNT)
    }
  }

  /* ===== SCROLL ARROW ===== */
  var scrollArrow = document.getElementById('scroll-arrow')
  if (scrollArrow) {
    window.addEventListener('scroll', function hideArrow() {
      requestAnimationFrame(function () { scrollArrow.classList.add('hidden') })
      window.removeEventListener('scroll', hideArrow)
    }, { passive: true, once: true })
  }

  /* ===== NAV SCROLL ===== */
  var nav = $('.nav')
  var activeClass = 'nav-link-active'

  window.addEventListener('scroll', function () {
    var sy = window.scrollY
    if (nav) nav.classList.toggle('scrolled', sy > NAV_SCROLL_THRESHOLD)

    $$('[data-section]').forEach(function (sec) {
      var rect = sec.getBoundingClientRect()
      var id = sec.getAttribute('data-section')
      var link = $('.nav-links a[href="#' + id + '"]')
      if (!link) return
      var isActive = rect.top < window.innerHeight * SECTION_VISIBILITY_RATIO && rect.bottom > 0
      link.classList.toggle(activeClass, isActive)
    })
  })

  /* ===== MOBILE MENU ===== */
  var menuToggle = $('.menu-toggle')
  var mobileNav = $('.mobile-nav')
  var mobileOverlay = $('.mobile-nav-overlay')

  function toggleMenu(open) {
    if (menuToggle) {
      menuToggle.classList.toggle('active', open)
      menuToggle.setAttribute('aria-expanded', String(open))
    }
    if (mobileNav) mobileNav.classList.toggle('open', open)
    if (mobileOverlay) mobileOverlay.classList.toggle('open', open)
    document.body.style.overflow = open ? 'hidden' : ''
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileNav && mobileNav.classList.contains('open')
      toggleMenu(!isOpen)
    })
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function () { toggleMenu(false) })
  }

  $$('.mobile-nav a').forEach(function (a) {
    a.addEventListener('click', function () { toggleMenu(false) })
  })

  /* ===== REVEAL ON SCROLL ===== */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: REVEAL_THRESHOLD })

  $$('.reveal').forEach(function (el) { observer.observe(el) })

  /* ===== CARDAPIO ===== */
  fetch('/cardapio.json')
    .then(function (res) { return res.json() })
    .then(function (data) {
      var tabGroup = {
        'Hambúrguers': function (i) { return i.categoria === 'Hambúrguers' || i.categoria === 'Promoção do Dia' },
        'Combos': function (i) { return i.categoria === 'Combos' },
        'Porções': function (i) { return i.categoria === 'Porcões' || i.categoria === 'Batatas' },
        'Sobremesas': function (i) { return i.categoria === 'Sobremesas' },
        'Bebidas': function (i) { return i.categoria === 'Bebidas' },
        'Adicionais': function (i) { return i.categoria === 'Molhos Especiais' || i.categoria === 'Adicionais' },
      }

      var tabsEl = document.getElementById('cardapio-tabs')
      var contentEl = document.getElementById('cardapio-content')
      tabsEl.setAttribute('role', 'tablist')

      var tabNames = Object.keys(tabGroup)
      var activeTab = tabNames[0]

      function render() {
        tabsEl.innerHTML = ''
        contentEl.innerHTML = ''

        tabNames.forEach(function (name) {
          var btn = document.createElement('button')
          btn.className = 'cardapio-tab'
          btn.setAttribute('role', 'tab')
          btn.setAttribute('aria-selected', name === activeTab ? 'true' : 'false')
          if (name === activeTab) btn.classList.add('active')
          btn.textContent = name.toUpperCase()
          btn.addEventListener('click', function () { activeTab = name; render() })
          tabsEl.appendChild(btn)
        })

        var items = data.filter(tabGroup[activeTab])
        var grid = document.createElement('div')
        grid.className = 'cardapio-grid'
        grid.setAttribute('role', 'tabpanel')

        items.forEach(function (item, idx) {
          var div = document.createElement('div')
          var delay = Math.min(idx, MAX_REVEAL_DELAY)
          div.className = 'cardapio-item reveal' + (idx > 0 ? ' reveal-delay-' + delay : '')

          var header = document.createElement('div')
          header.className = 'cardapio-item-header'

          var nameEl = document.createElement('span')
          nameEl.className = 'cardapio-item-name'
          nameEl.textContent = item.item

          var price = document.createElement('span')
          price.className = 'cardapio-item-price'
          price.textContent = 'R$ ' + item.preco.toFixed(2).replace('.', ',')

          header.appendChild(nameEl)
          header.appendChild(price)
          div.appendChild(header)

          if (item.descricao) {
            var desc = document.createElement('p')
            desc.className = 'cardapio-item-desc'
            desc.textContent = item.descricao
            div.appendChild(desc)
          }

          grid.appendChild(div)
        })

        contentEl.appendChild(grid)
        grid.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el) })
      }

      render()
    })

  /* ===== CARDAPIO TOGGLE ===== */
  var cardapioToggle = document.getElementById('cardapio-toggle')
  var cardapioClose = document.getElementById('cardapio-close')
  var cardapioBody = document.getElementById('cardapio-body')
  var cardapioSheet = cardapioBody ? cardapioBody.querySelector('.cardapio-sheet') : null

  function setCardapioOpen(open) {
    if (!cardapioBody) return
    cardapioBody.classList.toggle('open', open)
    if (cardapioToggle) {
      cardapioToggle.textContent = open ? 'Fechar cardápio' : 'Ver nosso cardápio'
      cardapioToggle.setAttribute('aria-expanded', String(open))
    }
    if (open) {
      document.documentElement.classList.add('scroll-locked')
      if (cardapioClose) setTimeout(function () { cardapioClose.focus() }, 100)
    } else {
      document.documentElement.classList.remove('scroll-locked')
      if (cardapioToggle) cardapioToggle.focus()
    }
  }

  if (cardapioToggle && cardapioBody) {
    cardapioToggle.addEventListener('click', function () {
      setCardapioOpen(!cardapioBody.classList.contains('open'))
    })
  }

  if (cardapioClose && cardapioBody) {
    cardapioClose.addEventListener('click', function () { setCardapioOpen(false) })
  }

  if (cardapioBody) {
    cardapioBody.addEventListener('click', function (e) {
      if (e.target === cardapioBody) setCardapioOpen(false)
    })
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cardapioBody && cardapioBody.classList.contains('open')) {
      setCardapioOpen(false)
    }
  })
})
