import React, { useState, useEffect, useRef } from 'react';

// Injecting custom fonts and editorial styles
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=Montserrat:wght@300;400;500&display=swap');

  :root {
    --color-cream: #FDFBF7;
    --color-royal: #1B1464;
    --color-fuchsia: #E6007E;
    --color-gold: #D4AF37;
  }

  body {
    background-color: var(--color-cream);
    color: var(--color-royal);
    font-family: 'Montserrat', sans-serif;
    margin: 0;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, .font-serif {
    font-family: 'Playfair Display', serif;
  }

  .editorial-border {
    border: 1px solid rgba(27, 20, 100, 0.15);
  }

  .gold-border {
    border: 1px solid var(--color-gold);
  }

  /* Smooth scroll behavior */
  html {
    scroll-behavior: smooth;
  }

  /* Marquee Animation */
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }

  /* Reveal Animation */
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .reveal.active {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Custom Selection */
  ::selection {
    background: var(--color-fuchsia);
    color: white;
  }
`;

const Background3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, particles;
    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId;

    const initThreeJS = () => {
      const THREE = window.THREE;
      if (!THREE) return;

      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // Create golden particles (pollen/blossom dust effect)
      const particleCount = 600;
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const sizes = [];

      for (let i = 0; i < particleCount; i++) {
        positions.push((Math.random() - 0.5) * 200); // x
        positions.push((Math.random() - 0.5) * 200); // y
        positions.push((Math.random() - 0.5) * 200); // z
        sizes.push(Math.random() * 2);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        color: 0xD4AF37, // Gold
        size: 0.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Mouse interaction
      const handleMouseMove = (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;

        // Subtle parallax
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
    };

    // Dynamically load Three.js
    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = initThreeJS;
      document.body.appendChild(script);
    } else {
      initThreeJS();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer && mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

const Icons = {
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>,
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
};

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center z-10 px-6 pt-20">
      <div className="text-center max-w-5xl mx-auto">
        <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm md:text-base mb-6 font-medium reveal">
          Maison Fondée au Maroc
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#1B1464] leading-tight mb-8 reveal" style={{ transitionDelay: '0.2s' }}>
          L'Authenticité de<br/>
          <span className="italic font-light">l'Eau de Fleurs d'Oranger</span>
        </h1>
        <p className="text-lg md:text-xl text-[#1B1464] opacity-80 max-w-2xl mx-auto mb-12 font-light reveal" style={{ transitionDelay: '0.4s' }}>
          Distillée avec passion selon les traditions marocaines. 
          Une qualité alimentaire exceptionnelle signée Dar Bel Amri.
        </p>
        <a 
          href="#products" 
          className="inline-flex items-center gap-4 bg-[#E6007E] text-white px-8 py-4 rounded-full uppercase tracking-widest text-sm font-semibold hover:bg-[#1B1464] transition-colors duration-500 reveal"
          style={{ transitionDelay: '0.6s' }}
        >
          Découvrir Nos Produits <Icons.ArrowRight />
        </a>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 reveal" style={{ transitionDelay: '0.8s' }}>
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-[#1B1464]"></div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="relative z-10 w-full bg-[#FDFBF7] py-24">
      {/* Editorial Marquee */}
      <div className="w-full overflow-hidden border-y border-[rgba(27,20,100,0.1)] py-4 mb-24 bg-[#FDFBF7]">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl font-serif text-[#D4AF37] opacity-60">
          <span>DAR BEL AMRI</span>
          <span className="text-[#1B1464]">✦</span>
          <span>SOCIÉTÉ FLEURS D'ORANGER</span>
          <span className="text-[#1B1464]">✦</span>
          <span>EAU ALIMENTAIRE</span>
          <span className="text-[#1B1464]">✦</span>
          <span>DAR BEL AMRI</span>
          <span className="text-[#1B1464]">✦</span>
          <span>SOCIÉTÉ FLEURS D'ORANGER</span>
          <span className="text-[#1B1464]">✦</span>
          <span>EAU ALIMENTAIRE</span>
          <span className="text-[#1B1464]">✦</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 reveal">
          <div className="aspect-[4/5] bg-[#1B1464] relative p-1">
            {/* Placeholder for actual image */}
            <div className="w-full h-full border border-[#D4AF37] flex items-center justify-center bg-[#FDFBF7] overflow-hidden group">
               <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1615846152435-0b04c8fbb1a5?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-80"></div>
            </div>
            {/* Decorative block */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E6007E] -z-10"></div>
          </div>
        </div>
        
        <div className="md:col-span-6 md:col-start-7 reveal">
          <h2 className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">Notre Histoire</h2>
          <h3 className="font-serif text-4xl md:text-5xl text-[#1B1464] leading-tight mb-8">
            L'Héritage de la <br/><span className="italic">Distillation Artisanale</span>
          </h3>
          <div className="space-y-6 text-[#1B1464] opacity-80 font-light leading-relaxed text-lg">
            <p>
              Nichée au cœur du Maroc, la Société Fleurs d'Oranger perpétue un savoir-faire ancestral sous la prestigieuse signature de Dar Bel Amri. 
            </p>
            <p>
              Notre eau de fleurs d'oranger est strictement de qualité alimentaire. Extraite par une lente distillation à la vapeur des pétales fraîchement cueillis, elle capture l'essence pure du printemps marocain pour sublimer vos créations culinaires.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Products = () => {
  const products = [
    { title: "Format Classique", vol: "250 ml", desc: "Idéal pour la pâtisserie quotidienne et les infusions." },
    { title: "Format Familial", vol: "500 ml", desc: "Le choix parfait pour les grands événements et célébrations." },
    { title: "Format Professionnel", vol: "1 Litre", desc: "Pensé pour les artisans, chefs et passionnés exigeants." }
  ];

  return (
    <section id="products" className="relative z-10 w-full bg-[#1B1464] text-[#FDFBF7] py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 reveal">
          <div>
            <h2 className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">La Collection</h2>
            <h3 className="font-serif text-4xl md:text-6xl">L'Eau Alimentaire</h3>
          </div>
          <p className="max-w-xs font-light opacity-80 mt-6 md:mt-0">
            Une pureté garantie, sans additifs artificiels, embouteillée avec soin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((prod, i) => (
            <div 
              key={i} 
              className="group border border-[rgba(253,251,247,0.2)] p-8 hover:border-[#D4AF37] transition-colors duration-500 cursor-pointer reveal"
              style={{ transitionDelay: `${0.2 * i}s` }}
            >
              <div className="text-[#E6007E] font-serif text-3xl mb-4">{prod.vol}</div>
              <h4 className="text-xl font-medium mb-4 uppercase tracking-wider">{prod.title}</h4>
              <p className="font-light opacity-70 leading-relaxed mb-8">{prod.desc}</p>
              
              <div className="w-full h-[1px] bg-[rgba(253,251,247,0.2)] mb-6 group-hover:bg-[#D4AF37] transition-colors"></div>
              <span className="text-[#D4AF37] text-sm uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Détails <Icons.ArrowRight />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactAndFooter = () => {
  return (
    <footer id="contact" className="relative z-10 w-full bg-[#FDFBF7] pt-24 pb-8 border-t border-[rgba(27,20,100,0.1)]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="reveal">
            <h2 className="font-serif text-4xl md:text-5xl text-[#1B1464] mb-8">Contactez-nous</h2>
            <p className="text-[#1B1464] opacity-80 font-light mb-12 max-w-md">
              Pour toute demande de commande, partenariat ou information sur nos procédés de distillation.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4 text-[#1B1464]">
                <div className="text-[#E6007E] mt-1"><Icons.MapPin /></div>
                <div>
                  <h5 className="font-semibold uppercase tracking-wider text-sm mb-1">Adresse</h5>
                  <p className="font-light opacity-80 leading-relaxed">
                    Quartier Industriel Rahma, N° 1244 Secteur D,<br/>
                    Hay Rahma, Salé, Maroc
                  </p>
                  <p className="font-light opacity-80 leading-relaxed mt-2 text-sm" dir="rtl">
                    الحي الصناعي الرحمة رقم 1244 قطاع د حي الرحمة سلا
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[#1B1464]">
                <div className="text-[#E6007E]"><Icons.Mail /></div>
                <div>
                  <h5 className="font-semibold uppercase tracking-wider text-sm mb-1">Email</h5>
                  <a href="mailto:darbelamri.rabat@gmail.com" className="font-light opacity-80 hover:text-[#E6007E] transition-colors">
                    darbelamri.rabat@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <form className="bg-white p-8 md:p-12 border border-[rgba(27,20,100,0.1)] shadow-xl shadow-[rgba(27,20,100,0.03)]">
              <div className="mb-8">
                <label className="block text-[#1B1464] text-xs font-semibold uppercase tracking-wider mb-2">Nom Complet</label>
                <input type="text" className="w-full border-b border-[rgba(27,20,100,0.2)] py-3 bg-transparent outline-none focus:border-[#E6007E] transition-colors rounded-none" />
              </div>
              <div className="mb-8">
                <label className="block text-[#1B1464] text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                <input type="email" className="w-full border-b border-[rgba(27,20,100,0.2)] py-3 bg-transparent outline-none focus:border-[#E6007E] transition-colors rounded-none" />
              </div>
              <div className="mb-10">
                <label className="block text-[#1B1464] text-xs font-semibold uppercase tracking-wider mb-2">Message</label>
                <textarea rows="3" className="w-full border-b border-[rgba(27,20,100,0.2)] py-3 bg-transparent outline-none focus:border-[#E6007E] transition-colors resize-none rounded-none"></textarea>
              </div>
              <button type="button" className="w-full bg-[#1B1464] text-[#FDFBF7] py-4 uppercase tracking-widest text-sm font-semibold hover:bg-[#E6007E] transition-colors duration-300">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="border-t border-[rgba(27,20,100,0.1)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[#1B1464] opacity-60 text-xs tracking-wider">
          <p>© {new Date().getFullYear()} Société Fleurs d'Oranger. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <span>IF: 3342747</span>
            <span className="hidden md:inline">•</span>
            <span>Patente: 28414774</span>
            <span className="hidden md:inline">•</span>
            <span>R.C: 16573</span>
            <span className="hidden md:inline">•</span>
            <span>ICE: 000193479000002</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  // Setup reveal animation observer
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>
      
      {/* 3D Canvas Background */}
      <Background3D />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-[#FDFBF7] px-6 py-6 flex justify-between items-center pointer-events-none">
        <div className="font-serif text-xl tracking-wider pointer-events-auto cursor-pointer">
          Dar Bel Amri.
        </div>
        <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-widest pointer-events-auto">
          <a href="#about" className="hover:text-[#E6007E] transition-colors">À Propos</a>
          <a href="#products" className="hover:text-[#E6007E] transition-colors">Produits</a>
          <a href="#contact" className="hover:text-[#E6007E] transition-colors">Contact</a>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="relative z-10 w-full bg-transparent">
        <Hero />
        <About />
        <Products />
        <ContactAndFooter />
      </main>
    </>
  );
}