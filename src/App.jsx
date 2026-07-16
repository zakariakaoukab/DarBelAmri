import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

import p250 from './assets/p250.png'
import p500 from './assets/p500.png'
import p1l  from './assets/p1l.png'

/* ─────────────────────────────────────────────
   THREE.JS PARTICLE BACKGROUND
   600 golden pollen particles, mouse-parallax
───────────────────────────────────────────── */
function Background3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 50

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Particle cloud
    const count     = 600
    const positions = []
    const sizes     = []
    for (let i = 0; i < count; i++) {
      positions.push((Math.random() - 0.5) * 200) // x
      positions.push((Math.random() - 0.5) * 200) // y
      positions.push((Math.random() - 0.5) * 200) // z
      sizes.push(Math.random() * 2)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('size',     new THREE.Float32BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      color:          0xD4AF37, // Gold
      size:           0.5,
      transparent:    true,
      opacity:        0.6,
      sizeAttenuation:true,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // Mouse parallax
    let mouseX = 0, mouseY = 0
    const onMouse = (e) => {
      mouseX = (e.clientX - window.innerWidth  / 2) * 0.05
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05
    }
    window.addEventListener('mousemove', onMouse)

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      particles.rotation.x += 0.0005
      particles.rotation.y += 0.001
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="hero-canvas" />
}

/* ─────────────────────────────────────────────
   ICONS (inline SVG, no library needed)
───────────────────────────────────────────── */
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

/* ─────────────────────────────────────────────
   MARQUEE (doubles content so it loops seamlessly)
───────────────────────────────────────────── */
const marqueeItems = [
  'DAR BEL AMRI', '✦', 'SOCIÉTÉ FLEURS D\'ORANGER', '✦',
  'EAU ALIMENTAIRE', '✦', 'DAR BEL AMRI', '✦',
  'SOCIÉTÉ FLEURS D\'ORANGER', '✦', 'EAU ALIMENTAIRE', '✦',
]

function Marquee() {
  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          item === '✦'
            ? <span key={i} className="divider">{item}</span>
            : <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  // Navbar scroll effect
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('active')),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const products = [
    {
      vol: '250 ml',
      title: 'Format Classique',
      desc: 'Idéal pour la pâtisserie quotidienne et les infusions marocaines.',
      img: p250,
    },
    {
      vol: '500 ml',
      title: 'Format Familial',
      desc: 'Le choix parfait pour les grands événements et les célébrations.',
      img: p500,
    },
    {
      vol: '1 Litre',
      title: 'Format Professionnel',
      desc: 'Pensé pour les artisans, chefs et passionnés les plus exigeants.',
      img: p1l,
    },
  ]

  return (
    <>
      {/* ── 3-D BACKGROUND ── */}
      <Background3D />

      {/* ── NAVBAR ── */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <a href="#hero" className="navbar-brand">
          Dar Bel Amri.
        </a>
        <ul className="navbar-links">
          <li><a href="#about">À Propos</a></li>
          <li><a href="#products">Produits</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <main style={{ position: 'relative', zIndex: 10, width: '100%' }}>

        {/* ── HERO ── */}
        <section className="hero" id="hero">
          <div className="hero-inner">
            <p className="hero-eyebrow reveal">Maison Fondée au Maroc</p>

            <h1 className="hero-title reveal" style={{ transitionDelay: '0.2s' }}>
              L'Authenticité de<br />
              <em>l'Eau de Fleurs d'Oranger</em>
            </h1>

            <p className="hero-subtitle reveal" style={{ transitionDelay: '0.4s' }}>
              Distillée avec passion selon les traditions marocaines.
              Une qualité alimentaire exceptionnelle signée Dar Bel Amri.
            </p>

            <a
              href="#products"
              className="hero-cta reveal"
              style={{ transitionDelay: '0.6s' }}
            >
              Découvrir Nos Produits <ArrowRightIcon />
            </a>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="about">
          {/* Editorial marquee */}
          <Marquee />

          <div className="about-inner" style={{ marginTop: '6rem' }}>
            {/* Image column (Now Logo) */}
            <div className="about-logo-wrap reveal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/logo.png" alt="Société Fleurs d'Oranger — Dar Bel Amri" style={{ width: '100%', maxWidth: '500px', filter: 'drop-shadow(0 10px 20px rgba(27,20,100,0.1))' }} />
            </div>

            {/* Text column */}
            <div className="about-text reveal" style={{ transitionDelay: '0.2s' }}>
              <p className="about-eyebrow">Notre Histoire</p>
              <h2 className="about-heading">
                L'Héritage de la<br />
                <em>Distillation Artisanale</em>
              </h2>
              <div className="about-body">
                <p>
                  Nichée au cœur du Maroc, la Société Fleurs d'Oranger perpétue un
                  savoir-faire ancestral sous la prestigieuse signature de Dar Bel Amri.
                </p>
                <p>
                  Notre eau de fleurs d'oranger est strictement de qualité alimentaire.
                  Extraite par une lente distillation à la vapeur des pétales fraîchement
                  cueillis, elle capture l'essence pure du printemps marocain pour sublimer
                  vos créations culinaires.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section id="products" className="products">
          <div className="products-inner">
            <div className="products-header reveal">
              <div>
                <p className="products-eyebrow">La Collection</p>
                <h2 className="products-heading">L'Eau Alimentaire</h2>
              </div>
              <p className="products-subtext">
                Une pureté garantie, sans additifs artificiels,
                embouteillée avec soin.
              </p>
            </div>

            <div className="products-grid">
              {products.map((p, i) => (
                <div
                  key={i}
                  className="product-card reveal"
                  style={{ transitionDelay: `${0.2 * i}s` }}
                >
                  {/* Product image */}
                  <div className="product-img-wrap">
                    <img src={p.img} alt={p.title} />
                  </div>

                  <div className="product-card-body">
                    <div className="product-vol">{p.vol}</div>
                    <div className="product-title">{p.title}</div>
                    <p className="product-desc">{p.desc}</p>
                    <div className="product-divider" />
                    <span className="product-link">
                      Détails <ArrowRightIcon />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER / CONTACT ── */}
        <footer id="contact" className="footer">
          <div className="footer-inner">
            <div className="contact-grid">
              {/* Left — contact info */}
              <div className="reveal">
                <h2 className="contact-heading">Contactez-nous</h2>
                <p className="contact-intro">
                  Pour toute demande de commande, partenariat ou information
                  sur nos procédés de distillation.
                </p>

                <div className="contact-detail">
                  <div className="contact-icon"><MapPinIcon /></div>
                  <div>
                    <p className="contact-label">Adresse</p>
                    <p className="contact-value">
                      Quartier Industriel Rahma, N° 1244 Secteur D,<br />
                      Hay Rahma, Salé, Maroc
                    </p>
                    <p className="contact-arabic contact-value">
                      الحي الصناعي الرحمة رقم 1244 قطاع د حي الرحمة سلا
                    </p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon"><MailIcon /></div>
                  <div>
                    <p className="contact-label">Email</p>
                    <p className="contact-value">
                      <a href="mailto:darbelamri.rabat@gmail.com">
                        darbelamri.rabat@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon"><InstagramIcon /></div>
                  <div>
                    <p className="contact-label">Instagram</p>
                    <p className="contact-value">
                      <a href="https://instagram.com/fleursdoranger_darbelamri" target="_blank" rel="noreferrer">
                        @fleursdoranger_darbelamri
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right — contact form */}
              <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                <form className="contact-form-card" onSubmit={e => e.preventDefault()}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="name">Nom Complet</label>
                    <input id="name" type="text" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" type="email" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="message">Message</label>
                    <textarea id="message" rows="4" className="form-textarea" />
                  </div>
                  <button type="submit" className="form-submit">
                    Envoyer le message
                  </button>
                </form>
              </div>
            </div>

            {/* Legal bar */}
            <div className="footer-bar">
              <p>© {new Date().getFullYear()} Société Fleurs d'Oranger. Tous droits réservés.</p>
              <div className="footer-legal">
                <span>IF: 3342747</span>
                <span className="sep">•</span>
                <span>Patente: 28414774</span>
                <span className="sep">•</span>
                <span>R.C: 16573</span>
                <span className="sep">•</span>
                <span>ICE: 000193479000002</span>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
