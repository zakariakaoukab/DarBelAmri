import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

import p250 from './assets/p250.png'
import p500 from './assets/p500.png'
import p1l from './assets/p1l.png'
import logoImg from './assets/logo1.png'

/* ─────────────────────────────────────────────
   THREE.JS PARTICLE BACKGROUND
   Majestic Trefoil Torus Knot, Smooth & Creative
───────────────────────────────────────────── */

function Background3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene    = new THREE.Scene()
    // Soft fog
    scene.fog = new THREE.FogExp2(0x000000, 0.012)

    const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 45

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 4.0)
    dirLight1.position.set(20, 20, 10)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0xffaadd, 2.0)
    dirLight2.position.set(-20, -10, -10)
    scene.add(dirLight2)

    // Geometry: Delicate tear-drop petal
    const petalGeo = new THREE.SphereGeometry(1, 16, 16)
    const posAttribute = petalGeo.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < posAttribute.count; i++) {
      v.fromBufferAttribute(posAttribute, i)
      v.z *= 0.1
      v.y *= 1.8
      if (v.y < 0) {
        v.x *= Math.max(0, 1 + v.y / 1.8)
      } else {
        v.x *= 1 - (v.y / 1.8) * 0.4
      }
      v.z += Math.pow(v.y, 2) * 0.15
      posAttribute.setXYZ(i, v.x, v.y, v.z)
    }
    petalGeo.computeVertexNormals()

    // Material: Premium translucent velvet
    const petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      transmission: 0.5,
      thickness: 0.5,
      side: THREE.DoubleSide
    })

    const count = 450
    const instancedMesh = new THREE.InstancedMesh(petalGeo, petalMat, count)
    scene.add(instancedMesh)

    const colorFuchsia = new THREE.Color('#E6007E')
    const colorGold = new THREE.Color('#D4AF37')

    // Particle state for Trefoil knot
    const particleData = []
    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.85
      instancedMesh.setColorAt(i, isGold ? colorGold : colorFuchsia)

      // Base parameter along the knot curve (0 to 2PI)
      const baseT = (i / count) * Math.PI * 2

      // Scatter offsets scaled up massively so they form a full-screen ambient cloud
      const tubeAngle = Math.random() * Math.PI * 2
      const tubeRadius = Math.random() * 15 + 2 
      const scatterX = Math.cos(tubeAngle) * tubeRadius
      const scatterY = Math.sin(tubeAngle) * tubeRadius
      const scatterZ = Math.sin(tubeAngle + baseT) * tubeRadius 

      particleData.push({
        baseT,
        scatterX,
        scatterY,
        scatterZ,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        rotation: new THREE.Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: Math.random() * 0.3 + 0.2, // Increased size for better visibility
        phase: Math.random() * Math.PI * 2
      })
    }
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    // Interaction states
    let targetScrollY = window.scrollY
    let currentScrollY = window.scrollY
    const onScroll = () => { targetScrollY = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    const mouse = new THREE.Vector2(0, 0)
    const targetMouse = new THREE.Vector2(0, 0)
    const onMouse = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouse)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let frameId
    const dummy = new THREE.Object3D()
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      // Smooth interpolations
      currentScrollY += (targetScrollY - currentScrollY) * 0.05
      mouse.lerp(targetMouse, 0.05)

      // The entire knot gently tilts with the mouse
      instancedMesh.rotation.y = mouse.x * 0.3 + Math.sin(time * 0.2) * 0.1
      instancedMesh.rotation.x = -mouse.y * 0.3 + Math.cos(time * 0.2) * 0.1
      instancedMesh.position.y = currentScrollY * 0.05

      // Trefoil Knot constants (Scaled up to fill screens)
      const p = 2, q = 3
      const R = 35 // Massive main radius
      const r = 15 // Massive minor radius


      for (let i = 0; i < count; i++) {
        const data = particleData[i]

        // Petals constantly flow along the knot curve
        const t = data.baseT + time * 0.15 

        // Trefoil math
        const rad = R + r * Math.cos(q * t)
        let x = rad * Math.cos(p * t)
        let y = rad * Math.sin(p * t)
        let z = r * Math.sin(q * t)

        // Add "breathing" tube scatter
        const breath = 1.0 + Math.sin(time * 2.0 + data.phase) * 0.2
        x += data.scatterX * breath
        y += data.scatterY * breath
        z += data.scatterZ * breath

        // Apply position
        dummy.position.set(x, y, z)

        // Smooth spin
        data.rotation.x += data.spin.x
        data.rotation.y += data.spin.y
        data.rotation.z += data.spin.z
        dummy.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z)

        dummy.scale.set(data.scale, data.scale, data.scale)
        dummy.updateMatrix()
        instancedMesh.setMatrixAt(i, dummy.matrix)
      }

      instancedMesh.instanceMatrix.needsUpdate = true

      // Cinematic slow camera drift
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02
      camera.position.y += (mouse.y * 3 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      petalGeo.dispose()
      petalMat.dispose()
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
  const [logoLoaded, setLogoLoaded] = useState(false)

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
          <img 
            src={logoImg} 
            alt="Dar Bel Amri" 
            className={`navbar-logo ${logoLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setLogoLoaded(true)}
          />
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
              <img src={logoImg} alt="Société Fleurs d'Oranger — Dar Bel Amri" style={{ width: '100%', maxWidth: '500px', filter: 'drop-shadow(0 10px 20px rgba(27,20,100,0.1))' }} />
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
