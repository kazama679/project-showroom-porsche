'use client'

import { useState, useRef, useEffect } from 'react'
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image'
import {
  Facebook,
  Instagram,
  Share2,
  Youtube,
  Linkedin,
} from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { carSeriesService, CarSeries } from '@/lib/car-series'
import { homeBannerService, HomeBannerItem } from '@/lib/home-banner'

/* =========================
   HERO (Ảnh 1 in user text)
   Matches full screen, Cayenne design
========================= */
interface HeroSectionProps {
  banner: HomeBannerItem | null
}

const HeroSection = ({ banner }: HeroSectionProps) => {
  const t = useTranslations('home');
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Fallbacks if no banner is seeded yet
  const title = banner?.title || "Cayenne S E-Hybrid."
  const videoSrc = banner?.videoUrl || "/home/porsche.mp4"
  const modelId = banner?.carModelId || 2

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex flex-col justify-between">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={videoSrc}
      />

      {/* Vignette Overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none" />



      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center pl-6 md:pl-20">
        <div className="text-white max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-semibold leading-[1.08] mb-8 tracking-tight drop-shadow-md whitespace-pre-line">
            {title}
          </h2>

          <Link
            href={`/models/${modelId}`}
            className="inline-block px-6 py-3.5 bg-neutral-800/60 backdrop-blur-md text-white text-xs tracking-wider font-semibold rounded hover:bg-neutral-700/80 transition border border-white/5 shadow-xl"
          >
            {t('discover_more')}
          </Link>
        </div>
      </div>

      {/* Bottom Bar Controls */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-16 pb-12">
        <div className="w-12"></div> {/* Left spacer */}

        {/* Center Bounce Arrow */}
        <div className="animate-bounce text-white/80 hover:text-white cursor-pointer transition">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>

        {/* Right Pause/Play button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition shadow-lg"
        >
          {isPlaying ? (
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  )
}

/* =========================
   CARDS (Ảnh 2 in user text)
   Matches rounded card grid, Panamera design
========================= */
interface CardsSectionProps {
  banners: HomeBannerItem[]
}

const CardsSection = ({ banners }: CardsSectionProps) => {
  const t = useTranslations('home');
  // Fallbacks if banners are empty
  const defaultCards = [
    {
      title: 'Panamera GTS.',
      carModelId: 2,
      imageUrl: 'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif',
    },
    {
      title: 'Porsche "There is no substitute" Collection.',
      carModelId: 4,
      imageUrl: 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661011/porsche/305482cb-a5b2-48cc-8c64-2826fdc29d3b.avif',
    },
    {
      title: '911 Carrera.',
      carModelId: 5,
      imageUrl: 'https://res.cloudinary.com/dfireq2op/image/upload/v1778661051/porsche/7c590c2e-342d-4688-9b32-fef59d3850bc.avif',
    },
  ]

  const displayBanners = banners.length >= 3 ? banners.slice(0, 3) : defaultCards

  return (
    <section className="bg-white py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {displayBanners.map((item, i) => (
            <Link
              key={i}
              href={`/models/${item.carModelId || 2}`}
              className="relative h-[300px] rounded-[2.5rem] overflow-hidden group cursor-pointer block shadow-sm hover:shadow-lg transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
              <Image
                src={item.imageUrl || 'https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif'}
                alt={item.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition duration-700 ease-out"
              />

              {/* Dark overlay for typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              {/* Title & Arrow Button container */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end gap-4 z-10">
                <h3 className="text-white text-lg md:text-xl font-medium tracking-tight leading-tight max-w-[75%]">
                  {item.title}
                </h3>

                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/35 transition duration-300 transform group-hover:translate-x-1">
                  <span className="text-base">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-5xl md:text-7xl font-light text-neutral-900 leading-[1.1] max-w-4xl tracking-tight pt-10">
          {t('journey_starts')}
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
  const t = useTranslations('models')
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
      <Image
        src={imageSrc}
        alt={title}
        fill
        unoptimized
        className={`
          object-cover
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
            {isGasoline ? t('gasoline') : t('unavailable')}
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
========================= */
const ModelsSection = () => {
  const [active, setActive] = useState<number | null>(null)
  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const tHome = useTranslations('home')
  const tModels = useTranslations('models')

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
                  price={series.price ? `${tHome('from')} $${series.price.toLocaleString()}*` : tModels('price_tbd')}
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
const DealershipSection = () => {
  const t = useTranslations('home')
  return (
  <section className="bg-white">
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-black text-white p-12 md:p-20 flex flex-col justify-center">
        <h3 className="text-5xl font-light leading-tight mb-8">
          {t('find_dealer_title')}
        </h3>

        <p className="text-neutral-300 leading-relaxed mb-10 max-w-md">
          {t('find_dealer_desc')}
        </p>

        <button className="bg-white text-black px-5 py-3 text-sm tracking-[0.15em] font-medium w-fit">
          {t('search_now')}
        </button>
      </div>

      <div className="md:w-1/2 h-[500px] relative">
        <Image
          src="https://a.storyblok.com/f/338913/1920x1080/1378ad4037/contentinfo_wide-16-9.jpg/m/1584x891/filters:format(webp):quality(45)"
          alt="dealership"
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    </div>
  </section>
)
}

/* =========================
   FOOTER
========================= */
const Footer = () => {
  const t = useTranslations('home')
  return (
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
        <p className="text-neutral-500 text-sm">{t('scroll_up')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-14 border-t border-white/10 pt-16">
        <div>
          <h4 className="mb-6 text-sm tracking-[0.15em] uppercase">
            {t('locations')}
          </h4>

          <ul className="space-y-3 text-neutral-400 text-sm">
            <li>{t('get_in_touch')}</li>
            <li>{t('newsletter')}</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm tracking-[0.15em] uppercase">
            {t('company')}
          </h4>

          <ul className="space-y-3 text-neutral-400 text-sm">
            <li>{t('career')}</li>
            <li>{t('compliance')}</li>
            <li>{t('sustainability')}</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm tracking-[0.15em] uppercase">
            {t('follow_us')}
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
        © {new Date().getFullYear()} Porsche
      </div>
    </div>
  </footer>
)
}

/* =========================
   PAGE
========================= */
export default function Home() {
  const [heroBanner, setHeroBanner] = useState<HomeBannerItem | null>(null)
  const [cardBanners, setCardBanners] = useState<HomeBannerItem[]>([])

  useEffect(() => {
    async function loadBanners() {
      try {
        const activeHeroes = await homeBannerService.findActiveByType('HERO')
        if (activeHeroes && activeHeroes.length > 0) {
          setHeroBanner(activeHeroes[0])
        }

        const activeCards = await homeBannerService.findActiveByType('CARD')
        setCardBanners(activeCards)
      } catch (error) {
        console.error('Failed to load active banners from DB', error)
      }
    }
    loadBanners()
  }, [])

  return (
    <main className="w-full overflow-hidden">
      <SiteHeader logoHref="/" variant="transparent" />
      <HeroSection banner={heroBanner} />
      <CardsSection banners={cardBanners} />
      <ModelsSection />
      <DealershipSection />
      <Footer />
    </main>
  )
}