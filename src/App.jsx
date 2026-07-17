import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

import p250 from './assets/p250.png'
import p500 from './assets/p500.png'
import p1l from './assets/p1l.png'
import logoImg from './assets/logo1.png'
import founderImage from './assets/founder_image.png'

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

const ShieldCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
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
  'DAR BEL AMRI', '✦', 'شركة دار بلعامري', '✦',
  'ماء الزهر الغذائي', '✦', 'DAR BEL AMRI', '✦',
  'شركة دار بلعامري', '✦', 'ماء الزهر الغذائي', '✦',
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
      title: 'الحجم الكلاسيكي',
      desc: 'مثالي للاستعمال اليومي في الحلويات والمشروبات المغربية.',
      img: p250,
    },
    {
      vol: '500 ml',
      title: 'الحجم العائلي',
      desc: 'الخيار المثالي للمناسبات والاحتفالات الكبيرة.',
      img: p500,
    },
    {
      vol: '1 Litre',
      title: 'الحجم الاحترافي',
      desc: 'مصمم خصيصاً للحرفيين والطهاة وعشاق الجودة.',
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
          <li><a href="#about">من نحن</a></li>
          <li><a href="#products">منتجاتنا</a></li>
          <li><a href="#vision">رؤيتنا</a></li>
          <li><a href="#founder">كلمة المؤسس</a></li>
          <li><a href="#contact">اتصل بنا</a></li>
        </ul>
      </nav>

      <main style={{ position: 'relative', zIndex: 10, width: '100%' }}>

        {/* ── HERO ── */}
        <section className="hero" id="hero">
          <div className="hero-inner">
            
            <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', marginBottom: '2rem', fontFamily: '"Tajawal", sans-serif' }}>
              <ShieldCheckIcon />
              <div style={{ fontSize: '16px', letterSpacing: '0.05em', color: '#1B1464', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, color: '#D32F2F', textShadow: '0 0 1px rgba(211,47,47,0.5)' }}>معتمد من طرف أونسا</span>
                <span style={{ fontWeight: 500, opacity: 0.8, marginRight: '0.75rem' }}>PAR.2.377.26</span>
              </div>
            </div>

            <h1 className="hero-title reveal" style={{ transitionDelay: '0.2s', fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: '1.2' }}>
              Fleur d'Oranger - Dar Bel Amri<br />
              <em style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', display: 'block', marginTop: '1rem' }}>نكهة الأصالة المغربية</em>
            </h1>

            <p className="hero-subtitle reveal" style={{ transitionDelay: '0.4s' }}>
              من قلب المنطقة الصناعية بسلا، نقدم لكم خبرة مغربية أصيلة في عالم النكهات الطبيعية وماء الزهر
            </p>

            <a
              href="#products"
              className="hero-cta reveal"
              style={{ transitionDelay: '0.6s' }}
            >
              اكتشف منتجاتنا <ArrowRightIcon />
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
              <p className="about-eyebrow">قصتنا</p>
              <h2 className="about-heading" style={{ lineHeight: '1.3' }}>
                <em>من نحن</em>
              </h2>
              <div className="about-body">
                <p>
                  شركة مغربية متخصصة في تصنيع وتسويق المواد الأولية للصناعات الغذائية، تأسست سنة 2011 بسلا. تركز الشركة على إنتاج ماء الزهر عالي الجودة، إلى جانب زيوت الزهر للإستعمال الغذائي بكافة الخصوصيات.
                </p>
                <p>
                  بفضل التزامها بمعايير الجودة والسلامة المطابقة للمواصفات المعمول بها، استطاعت أن تحجز مكانة متميزة في السوق المغربي وتزود كبار المصنعين والمستهلكين بمنتجات طبيعية تلبي تطلعاتهم. مما جعل ماء الزهر دار بلعامري سفيرا للأصالة و الجودة المغربية . بشعار: صنع بالمغرب.
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
                <p className="products-eyebrow">منتجاتنا</p>
                <h2 className="products-heading">ماء الزهر الغذائي</h2>
              </div>
              <p className="products-subtext">
                نقاء مضمون، بدون إضافات صناعية، معبأ بعناية فائقة.
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
                      التفاصيل <ArrowRightIcon />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VISION, MISSION & VALUES ── */}
        <section id="vision" className="vision">
          <div className="vision-inner">
            <div className="vision-grid">
              <div className="vision-card reveal">
                <h3 className="vision-card-title">رؤيتنا</h3>
                <p>أن نكون العلامة الرائدة في المغرب في إنتاج ماء الزهر والنكهات الطبيعية، ونمثل الجودة والأصالة المغربية في الأسواق المحلية والدولية.</p>
              </div>
              <div className="vision-card reveal" style={{ transitionDelay: '0.2s' }}>
                <h3 className="vision-card-title">رسالتنا</h3>
                <p>توفير منتجات غذائية طبيعية وآمنة بأعلى معايير الجودة. نلتزم بإنتاج ماء الزهر والنكهات الغذائية التي تلبي احتياجات الأسر، الحرفيين، والصناعيين، مع الحفاظ على التقاليد المغربية وتطويرها بما يواكب متطلبات العصر.</p>
              </div>
              <div className="vision-card reveal" style={{ transitionDelay: '0.4s' }}>
                <h3 className="vision-card-title">قيمنا</h3>
                <ul className="values-list">
                  <li><strong>الجودة:</strong> نلتزم بأعلى معايير السلامة.</li>
                  <li><strong>الأصالة:</strong> نحافظ على النكهة المغربية.</li>
                  <li><strong>الاحترافية:</strong> منهجية عمل احترافية.</li>
                  <li><strong>الثقة:</strong> شفافية ومصداقية تامة.</li>
                  <li><strong>الاستدامة:</strong> مواد طبيعية واحترام للبيئة.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORD FROM THE FOUNDER ── */}
        <section id="founder" className="founder">
          <div className="founder-inner">
            <div className="founder-image-container reveal">
              <div className="founder-portrait-wrapper">
                <div className="founder-portrait-bg"></div>
                <img 
                  src={founderImage} 
                  alt="السيد محمد حنكرار" 
                  className="founder-portrait-img"
                />
              </div>
              <p className="founder-name">السيد محمد حنكرار</p>
            </div>
            <div className="founder-text reveal" style={{ transitionDelay: '0.2s' }}>
              <p className="founder-eyebrow">كلمة المؤسس</p>
              <h2 className="founder-heading">الجمع بين الأصالة والحداثة</h2>
              <div className="founder-body">
                <p>
                  يقود السيد محمد حنكرار مسيرة التميز في قطاع الصناعات الغذائية والمنتجات النباتية بالمغرب، مجسداً رؤية طموحة تضع الجودة والابتكار في قلب العمليات الإنتاجية لشركتي Fleur d'Oranger Dar Bel Amri و Bassatine Dar Bel Amri. يعتمد منهجه على تحديث آليات التصنيع مع صون الهوية المغربية الأصيلة، إلى جانب بناء شراكات استراتيجية متينة تعزز التنمية الاقتصادية. وبفضل التزامه الراسخ بالاستدامة وإرضاء المستهلكين، يحمل بثقة مسؤولية الارتقاء بالمنتج المحلي تحت راية: <span style={{ fontWeight: 600 }}>"صنع في المغرب"</span>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER / CONTACT ── */}
        <footer id="contact" className="footer">
          <div className="footer-inner">
            <div className="contact-grid">
              {/* Left — contact info */}
              <div className="reveal">
                <h2 className="contact-heading">اتصل بنا</h2>
                <p className="contact-intro">
                  لأي طلبات، شراكات، أو استفسارات حول منتجاتنا.
                </p>

                <div className="contact-detail">
                  <div className="contact-icon"><MapPinIcon /></div>
                  <div>
                    <p className="contact-label">العنوان</p>
                    <p className="contact-value" style={{ direction: 'rtl' }}>
                      الحي الصناعي الرحمة رقم 1244 قطاع د حي الرحمة سلا
                    </p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon"><MailIcon /></div>
                  <div>
                    <p className="contact-label">البريد الإلكتروني</p>
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
                    <p className="contact-label">إنستغرام</p>
                    <p className="contact-value">
                      <a href="https://instagram.com/fleursdoranger_darbelamri" target="_blank" rel="noreferrer">
                        @fleursdoranger_darbelamri
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon"><WhatsAppIcon /></div>
                  <div>
                    <p className="contact-label">واتساب</p>
                    <p className="contact-value">
                      <a href="https://wa.me/212661352715" target="_blank" rel="noreferrer" style={{ direction: 'ltr', display: 'inline-block' }}>
                        +212 661 352 715
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon"><FacebookIcon /></div>
                  <div>
                    <p className="contact-label">فيسبوك</p>
                    <p className="contact-value">
                      <a href="#" target="_blank" rel="noreferrer">
                        Société Fleurs d'Oranger
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right — contact form */}
              <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                <form className="contact-form-card" onSubmit={e => e.preventDefault()}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="name">الاسم الكامل</label>
                    <input id="name" type="text" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="email">البريد الإلكتروني</label>
                    <input id="email" type="email" className="form-input" />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="message">الرسالة</label>
                    <textarea id="message" rows="4" className="form-textarea" />
                  </div>
                  <button type="submit" className="form-submit">
                    إرسال الرسالة
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Legal bar */}
          <div className="footer-bar-wrapper">
            <div className="footer-bar">
              <p>© {new Date().getFullYear()} شركة Fleur d'Oranger. جميع الحقوق محفوظة.</p>
              <div className="footer-legal" style={{ color: 'var(--cream)', fontSize: '0.75rem', letterSpacing: '0.05em', direction: 'ltr' }}>
                <span style={{ fontWeight: 600, opacity: 1 }}>ONSSA: PAR.2.377.26</span>
                <span className="sep" style={{ opacity: 0.6 }}>|</span>
                <span style={{ fontWeight: 300, opacity: 0.8 }}>IF: 3342747</span>
                <span className="sep" style={{ opacity: 0.6 }}>|</span>
                <span style={{ fontWeight: 300, opacity: 0.8 }}>Patente: 28414774</span>
                <span className="sep" style={{ opacity: 0.6 }}>|</span>
                <span style={{ fontWeight: 300, opacity: 0.8 }}>R.C: 16573</span>
                <span className="sep" style={{ opacity: 0.6 }}>|</span>
                <span style={{ fontWeight: 300, opacity: 0.8 }}>ICE: 000193479000002</span>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
