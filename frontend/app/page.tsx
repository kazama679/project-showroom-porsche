'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  Globe,
  User,
  Facebook,
  Instagram,
  Share2,
  Youtube,
  Linkedin,
} from 'lucide-react'
import { carSeriesService, CarSeries } from '@/lib/car-series'

/* =========================
   HERO
========================= */
const HeroSection = () => (
  <section className="relative w-full h-screen overflow-hidden bg-black">
    <video
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
    >
      <source src="/home/porsche.mp4" type="video/mp4" />
    </video>

    {/* Header */}
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-8 bg-gradient-to-b from-black/70 to-transparent">
      <button className="text-white flex items-center gap-2 md:hidden">
        <Menu size={20} />
        <span className="text-xs tracking-[0.15em]">MENU</span>
      </button>

      <div className="flex-1 text-center">
        <h1 className="text-white text-base tracking-[0.22em] font-medium">
          PORSCHE
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-white hidden md:block">
          <Globe size={18} />
        </button>

        <button className="text-white">
          <User size={18} />
        </button>
      </div>
    </header>

    {/* Content */}
    <div className="absolute inset-0 flex items-center pl-6 md:pl-20">
      <div className="text-white max-w-2xl">
        <h2 className="text-6xl md:text-7xl font-light leading-[1.08] mb-8">
          The new 911
          <br />
          GT3 S/C.
        </h2>

        <button className="px-5 py-3 bg-white text-black text-sm tracking-[0.15em] font-medium hover:bg-neutral-200 transition">
          DISCOVER NOW
        </button>
      </div>
    </div>
  </section>
)

/* =========================
   CARDS
========================= */
const CardsSection = () => {
  const cards = [
    {
      title: 'Cayenne.',
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%202-oUaZMP2zdDN2Sam4Jaqt80Sgs8Hsaw.png',
    },
    {
      title: 'Phụ kiện Porsche cho mùa xuân.',
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%202-oUaZMP2zdDN2Sam4Jaqt80Sgs8Hsaw.png',
    },
    {
      title: 'Panamera GTS.',
      img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%202-oUaZMP2zdDN2Sam4Jaqt80Sgs8Hsaw.png',
    },
  ]

  return (
    <section className="bg-white py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {cards.map((item, i) => (
            <div
              key={i}
              className="relative h-72 overflow-hidden group cursor-pointer"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <h3 className="text-white text-xl font-light">
                  {item.title}
                </h3>

                <span className="text-white text-xl">→</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-5xl md:text-7xl font-light text-center leading-[1.1] max-w-4xl mx-auto">
          Your Porsche journey starts now.
        </h2>
      </div>
    </section>
  )
}

/* =========================
   MODEL CARD
========================= */
const ModelCard = ({
  title,
  isGasoline,
  description,
  price,
  videoSrc,
  imageSrc,
  active,
  href,
}: any) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <Link
      href={href || '#'}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative h-[600px] w-full block overflow-hidden cursor-pointer"
    >
      {/* image */}
      <img
        src={imageSrc}
        alt={title}
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-all duration-700 ease-out
          ${active ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}
        `}
      />

      {/* video */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        playsInline
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-700
          ${active ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

      {/* title */}
      <div className="absolute top-10 left-10">
        <h2 className="text-white text-6xl font-light">{title}</h2>
      </div>

      {/* content */}
      <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
        <div className="mb-5">
          <span className="bg-white/15 backdrop-blur-sm px-3 py-1 text-xs tracking-wide">
            {isGasoline ? 'Gasoline' : 'Model currently unavailable'}
          </span>
        </div>

        <p className="text-lg font-light leading-relaxed mb-4 max-w-md">
          {description}
        </p>

        <div className="flex justify-between">
          {price && (
            <p className="text-2xl font-light mb-4">
              {price}
            </p>
          )}
          <span
            className="
              text-xl text-white
              hover:text-white/60
              transition-colors duration-300
            "
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}

/* =========================
   MODELS SECTION
   HOVER PHÌNH NGANG
========================= */
const ModelsSection = () => {
  const [active, setActive] = useState<number | null>(null)
  const [seriesList, setSeriesList] = useState<CarSeries[]>([])

  useEffect(() => {
    async function loadSeries() {
      try {
        const res = await carSeriesService.findAll('', 0, 100)
        let data = res.content
        if (data.length % 2 !== 0) {
          data = data.slice(0, data.length - 1)
        }
        setSeriesList(data)
      } catch (error) {
        console.error('Failed to load series', error)
      }
    }
    loadSeries()
  }, [])

  const pairs: CarSeries[][] = []
  for (let i = 0; i < seriesList.length; i += 2) {
    pairs.push(seriesList.slice(i, i + 2))
  }

  return (
    <section className="bg-black text-white py-24 px-6 md:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-4">
        {pairs.map((pair, index) => (
          <div
            key={index}
            className="flex gap-4"
            onMouseLeave={() => setActive(null)}
          >
            {pair.map((series) => (
              <div
                key={series.id}
                onMouseEnter={() => setActive(series.id)}
                className={`
                  transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${active === series.id
                    ? 'flex-[1.1]'
                    : active
                      ? 'flex-[0.9]'
                      : 'flex-1'}
                `}
              >
                <ModelCard
                  title={series.name}
                  isGasoline={true}
                  description={series.description || "Precise mid-engine sports car."}
                  price={series.price ? `From $${series.price.toLocaleString()}*` : "Price TBD"}
                  videoSrc={series.videoUrl || "https://videos.porsche.com/id/911Desktop54Final/hls.m3u8"}
                  imageSrc={series.imageUrl || "https://a.storyblok.com/f/338913/1280x1024/b7f3c2d593/911-desktop_5-4.jpg/m/1200x0/filters:format(webp):quality(80)"}
                  active={active === series.id}
                  href={`/models?seriesId=${series.id}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

/* =========================
   DEALERSHIP
========================= */
const DealershipSection = () => (
  <section className="bg-white">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-black text-white p-12 md:p-20 flex flex-col justify-center">
        <h3 className="text-5xl font-light leading-tight mb-8">
          Tìm đại lý Porsche gần bạn
        </h3>

        <p className="text-neutral-300 leading-relaxed mb-10 max-w-md">
          Trung tâm Porsche và chiếc xe Porsche trong mơ của bạn có thể gần hơn
          bạn nghĩ. Hãy tìm kiếm trong mạng lưới các Trung tâm Porsche của chúng
          tôi để tìm địa điểm gần bạn nhất.
        </p>

        <button className="bg-white text-black px-5 py-3 text-sm tracking-[0.15em] font-medium w-fit">
          TÌM KIẾM NGAY
        </button>
      </div>

      <div className="md:w-1/2 h-[500px]">
        <img
          src="https://a.storyblok.com/f/338913/1920x1080/1378ad4037/contentinfo_wide-16-9.jpg/m/1584x891/filters:format(webp):quality(45)"
          alt="dealership"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </section>
)

/* =========================
   FOOTER
========================= */
const Footer = () => (
  <footer className="bg-black text-white py-24 px-6 md:px-16">
    <div className="max-w-7xl mx-auto">
      <div
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }
        className="text-center mb-16 cursor-pointer "
      >
        <div className="text-xl mb-3">↑</div>
        <p className="text-neutral-500 text-sm">Scroll up</p>
      </div>

      <div className="grid md:grid-cols-3 gap-14 border-t border-white/10 pt-16">
        <div>
          <h4 className="mb-6 text-sm tracking-[0.15em] uppercase">
            Locations
          </h4>

          <ul className="space-y-3 text-neutral-400 text-sm">
            <li>Get in touch</li>
            <li>Newsletter</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm tracking-[0.15em] uppercase">
            Company
          </h4>

          <ul className="space-y-3 text-neutral-400 text-sm">
            <li>Career</li>
            <li>Compliance</li>
            <li>Sustainability</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm tracking-[0.15em] uppercase">
            Follow Us
          </h4>

          <div className="flex gap-5 text-neutral-400">
            <Facebook size={18} />
            <Instagram size={18} />
            <Share2 size={18} />
            <Youtube size={18} />
            <Linkedin size={18} />
          </div>
        </div>
      </div>

      <div className="text-center text-neutral-500 text-sm mt-20">
        © 2026 Porsche
      </div>
    </div>
  </footer>
)

/* =========================
   PAGE
========================= */
export default function Home() {
  return (
    <main className="w-full overflow-hidden">
      <HeroSection />
      <CardsSection />
      <ModelsSection />
      <DealershipSection />
      <Footer />
    </main>
  )
}