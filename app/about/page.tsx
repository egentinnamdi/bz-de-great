"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronRight,
  ArrowRight,
  Home,
  Car,
  Tag,
  BarChart3,
  Eye,
  Check,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { GalleryViewer } from "@/components/gallery-viewer"
import { SITE_CONFIG } from "@/lib/constants"

const GALLERY_PHOTOS = [
  {
    src: "/photos/gallery-bz-14.jpg",
    alt: "BZ De Great in tailored gold tuxedo",
  },
  {
    src: "/photos/gallery-bz-6.jpg",
    alt: "BZ De Great executive portrait in armchair",
  },
  {
    src: "/photos/gallery-bz-11.jpg",
    alt: "Amb. BZ De Great in traditional royal regalia",
  },
  {
    src: "/photos/gallery-bz-10.jpg",
    alt: "Amb. BZ De Great seated in traditional throne",
  },
  { src: "/photos/gallery-bz-1.jpg", alt: "BZ De Great in navy formal suit" },
  { src: "/photos/gallery-bz-7.jpg", alt: "BZ De Great gold 3-piece suit" },
  {
    src: "/photos/gallery-bz-12.jpg",
    alt: "BZ De Great cultural attire with horse-tail staff",
  },
  {
    src: "/photos/gallery-bz-9.jpg",
    alt: "BZ De Great in modern yellow double-breasted suit",
  },
  {
    src: "/photos/gallery-bz-4.jpg",
    alt: "BZ De Great executive dusk skyline portrait",
  },
]

export default function AboutPage() {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openPhoto = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const waConsultationLink = `https://wa.me/2348139690031?text=${encodeURIComponent(
    "Hello Amb. BZ / BZ Group team, I would like to book an investment consultation."
  )}`

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1b1416]">
      <SiteHeader />

      <main className="flex-1">
        {/* ========================================================
            1. HERO / INTRO SECTION (Figma: Intro [fill=#4e0b13])
           ======================================================== */}
        <section className="w-full border-b border-[#630f1a] bg-[#4e0b13] pt-10 pb-16 text-white lg:pb-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex items-center gap-2 text-[13px] text-[#ebc7cb]"
            >
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[#ebc7cb]" />
              <span className="font-medium text-white">About</span>
            </nav>

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              {/* Left Column: Copy & Stats */}
              <div className="space-y-6 lg:col-span-7">
                <span className="block text-[12px] font-bold tracking-[0.2em] text-[#ebc7cb] uppercase">
                  ABOUT BZ DE GREAT
                </span>

                <h1 className="font-serif text-[42px] leading-[1.08] font-semibold tracking-tight text-white sm:text-[56px] lg:text-[64px]">
                  Visionary. Strategist. Results driven.
                </h1>

                <p className="max-w-xl text-[16px] leading-relaxed font-normal text-[#f6e3e5] sm:text-[18px]">
                  A realtor, investment broker and entrepreneur building wealth
                  for clients across real estate, automobiles, fashion and
                  technology — and the founder behind BZ Group.
                </p>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-4 border-y border-white/15 py-6 sm:grid-cols-4">
                  <div className="border-r border-white/10 pr-2">
                    <div className="font-serif text-[32px] leading-none font-bold text-white sm:text-[38px]">
                      500+
                    </div>
                    <div className="mt-1.5 text-[12px] font-medium text-[#ebc7cb]">
                      Properties sold
                    </div>
                  </div>

                  <div className="border-r border-white/10 pr-2">
                    <div className="font-serif text-[32px] leading-none font-bold text-white sm:text-[38px]">
                      ₦50M+
                    </div>
                    <div className="mt-1.5 text-[12px] font-medium text-[#ebc7cb]">
                      In transactions
                    </div>
                  </div>

                  <div className="border-r border-white/10 pr-2">
                    <div className="font-serif text-[32px] leading-none font-bold text-white sm:text-[38px]">
                      10+
                    </div>
                    <div className="mt-1.5 text-[12px] font-medium text-[#ebc7cb]">
                      Years experience
                    </div>
                  </div>

                  <div>
                    <div className="font-serif text-[32px] leading-none font-bold text-white sm:text-[38px]">
                      4
                    </div>
                    <div className="mt-1.5 text-[12px] font-medium text-[#ebc7cb]">
                      Industries
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href={waConsultationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[50px] cursor-pointer items-center gap-2 rounded-[8px] bg-white px-7 text-[14px] font-semibold text-[#1b1416] shadow-sm transition-colors hover:bg-[#f6e3e5]"
                  >
                    <span>Book a consultation</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </a>

                  <a
                    href="#gallery"
                    className="inline-flex h-[50px] cursor-pointer items-center justify-center rounded-[8px] border border-white/30 px-7 text-[14px] font-semibold text-white transition-colors hover:border-white"
                  >
                    <span>See the gallery</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Arched Founder Portrait */}
              <div className="flex justify-center lg:col-span-5 lg:justify-end">
                <div className="relative h-[520px] w-full max-w-[390px] overflow-hidden rounded-t-[200px] rounded-b-[24px] border-4 border-[#680e18] shadow-2xl">
                  <Image
                    src="/photos/gallery-bz-7.jpg"
                    alt="BZ De Great - Founder & CEO, BZ Group"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover object-top"
                    priority
                  />

                  {/* Name Tag Pill Badge */}
                  <div className="absolute bottom-6 left-6 rounded-[12px] border border-white/60 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md">
                    <div className="font-serif text-[18px] leading-tight font-bold text-[#81141f] italic">
                      BZ De Great
                    </div>
                    <div className="text-[11px] font-medium tracking-tight text-[#716769]">
                      Founder, BZ Group
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. MY STORY SECTION (Figma: Story)
           ======================================================== */}
        <section className="border-b border-[#eae3e4] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left Column: Eyebrow + Heading + Pull Quote */}
              <div className="space-y-6 lg:col-span-5">
                <span className="block text-[12px] font-bold tracking-[0.2em] text-[#81141f] uppercase">
                  MY STORY
                </span>

                <h2 className="font-serif text-[36px] leading-[1.12] font-semibold tracking-tight text-[#1b1416] sm:text-[44px]">
                  Create value. Build wealth. Deliver results.
                </h2>

                {/* Pull Quote Box */}
                <div className="border-l-[3px] border-[#81141f] py-1 pl-5">
                  <p className="font-serif text-[18px] leading-relaxed text-[#4a4245] italic sm:text-[20px]">
                    “My mission is simple: create value, build wealth and
                    deliver results through intelligent investments.”
                  </p>
                  <p className="mt-2 font-sans text-[13px] font-semibold text-[#81141f]">
                    — BZ De Great
                  </p>
                </div>
              </div>

              {/* Right Column: Narrative + Checklist */}
              <div className="space-y-6 text-[15px] leading-relaxed text-[#4a4245] sm:text-[16px] lg:col-span-7">
                <p>
                  I am a professional realtor, investment broker and
                  entrepreneur operating across four dynamic industries. My
                  mission is simple: create value, build wealth and deliver
                  results through intelligent investments.
                </p>

                <p>
                  With over a decade of experience spanning real estate,
                  automobiles, fashion and technology, I bring deep expertise
                  and a network built on trust, performance and excellence. From
                  estates like BZ Okenwa Millennium City and Agidigba Garden
                  City to luxury vehicles and RMB exchange for people and
                  businesses trading with China, BZ Group is how that experience
                  reaches you.
                </p>

                {/* 3 Values Checklist Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f5f5] px-4 py-2 text-[13px] font-semibold text-[#1b1416]">
                    <Check className="h-4 w-4 stroke-[2.5] text-[#81141f]" />
                    <span>Trusted expertise</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f5f5] px-4 py-2 text-[13px] font-semibold text-[#1b1416]">
                    <Check className="h-4 w-4 stroke-[2.5] text-[#81141f]" />
                    <span>Proven results</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f5f5] px-4 py-2 text-[13px] font-semibold text-[#1b1416]">
                    <Check className="h-4 w-4 stroke-[2.5] text-[#81141f]" />
                    <span>Client focused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. MISSION & VISION SECTION (Figma: Mission & vision)
           ======================================================== */}
        <section className="border-b border-[#eae3e4] bg-[#fdfbfb] py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Card 1: Mission (White) */}
              <div className="space-y-4 rounded-[20px] border border-[#eae3e4] bg-white p-8 shadow-xs sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold tracking-[0.2em] text-[#81141f] uppercase">
                    MISSION
                  </span>
                  <span className="font-serif text-[22px] font-bold text-[#ebc7cb] italic">
                    01
                  </span>
                </div>

                <h3 className="font-serif text-[28px] font-semibold tracking-tight text-[#1b1416] sm:text-[32px]">
                  Built to deliver excellence.
                </h3>

                <p className="text-[15px] leading-relaxed font-normal text-[#716769]">
                  To empower individuals and businesses to build lasting wealth
                  through strategic investments in real estate, automobiles,
                  fashion and technology delivering excellence at every
                  touchpoint.
                </p>
              </div>

              {/* Card 2: Vision (Deep Wine #4e0b13) */}
              <div className="space-y-4 rounded-[20px] bg-[#4e0b13] p-8 text-white shadow-md sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold tracking-[0.2em] text-[#ebc7cb] uppercase">
                    VISION
                  </span>
                  <span className="font-serif text-[22px] font-bold text-[#ebc7cb]/60 italic">
                    02
                  </span>
                </div>

                <h3 className="font-serif text-[28px] font-semibold tracking-tight text-white sm:text-[32px]">
                  Africa's most trusted brand.
                </h3>

                <p className="text-[15px] leading-relaxed font-normal text-[#f6e3e5]">
                  To be Africa's most trusted multi-industry investment brand,
                  recognised for transforming lives through smart, diversified
                  wealth creation and uncompromising service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. FOUR PILLARS SECTION (Figma: Four pillars)
           ======================================================== */}
        <section className="border-b border-[#eae3e4] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] space-y-12 px-4 sm:px-6">
            <div className="space-y-2">
              <span className="block text-[12px] font-bold tracking-[0.2em] text-[#81141f] uppercase">
                INDUSTRIES I OPERATE IN
              </span>
              <h2 className="font-serif text-[36px] font-semibold tracking-tight text-[#1b1416] sm:text-[42px]">
                Four pillars of excellence
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Pillar 1: Real Estate */}
              <div className="group overflow-hidden rounded-[16px] border border-[#eae3e4] bg-white shadow-xs transition-all hover:border-[#81141f]">
                <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/photos/house-duplex.jpg"
                    alt="Real estate investments"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center gap-2 text-[#81141f]">
                    <Home className="h-4 w-4 stroke-[2.2]" />
                    <h3 className="text-[16px] font-semibold text-[#1b1416]">
                      Real estate
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed font-normal text-[#716769]">
                    Premium properties in prime locations, built to grow your
                    wealth.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Automobiles */}
              <div className="group overflow-hidden rounded-[16px] border border-[#eae3e4] bg-white shadow-xs transition-all hover:border-[#81141f]">
                <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/photos/car-sedan-black.jpg"
                    alt="Automobile sales and rentals"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center gap-2 text-[#81141f]">
                    <Car className="h-4 w-4 stroke-[2.2]" />
                    <h3 className="text-[16px] font-semibold text-[#1b1416]">
                      Automobiles
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed font-normal text-[#716769]">
                    Luxury cars and premium vehicles to rent, buy or import.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Fashion */}
              <div className="group overflow-hidden rounded-[16px] border border-[#eae3e4] bg-white shadow-xs transition-all hover:border-[#81141f]">
                <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/photos/gallery-bz-9.jpg"
                    alt="Fashion ventures"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center gap-2 text-[#81141f]">
                    <Tag className="h-4 w-4 stroke-[2.2]" />
                    <h3 className="text-[16px] font-semibold text-[#1b1416]">
                      Fashion
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed font-normal text-[#716769]">
                    Style-led ventures and profitable fashion investments.
                  </p>
                </div>
              </div>

              {/* Pillar 4: Technology */}
              <div className="group overflow-hidden rounded-[16px] border border-[#eae3e4] bg-white shadow-xs transition-all hover:border-[#81141f]">
                <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/photos/apartment-interior.jpg"
                    alt="Technology ventures"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center gap-2 text-[#81141f]">
                    <BarChart3 className="h-4 w-4 stroke-[2.2]" />
                    <h3 className="text-[16px] font-semibold text-[#1b1416]">
                      Technology
                    </h3>
                  </div>
                  <p className="text-[13px] leading-relaxed font-normal text-[#716769]">
                    Investing in innovation — the future is digital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. THE BRAND / FULL GALLERY (Figma: Full gallery)
           ======================================================== */}
        <section
          id="gallery"
          className="scroll-mt-20 border-b border-[#eae3e4] bg-[#fdfbfb] py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1200px] space-y-12 px-4 sm:px-6">
            <div className="space-y-2">
              <span className="block text-[12px] font-bold tracking-[0.2em] text-[#81141f] uppercase">
                THE BRAND
              </span>
              <h2 className="font-serif text-[36px] font-semibold tracking-tight text-[#1b1416] sm:text-[42px]">
                A vision in motion
              </h2>
              <p className="text-[15px] text-[#716769]">
                Tap any photo to view it full screen.
              </p>
            </div>

            {/* 3-Column Masonry Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Column 1 */}
              <div className="space-y-6">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => openPhoto(idx)}
                    className="group relative cursor-pointer overflow-hidden rounded-[16px] bg-slate-100 shadow-xs"
                    style={{ height: idx === 1 ? "340px" : "440px" }}
                  >
                    <Image
                      src={GALLERY_PHOTOS[idx].src}
                      alt={GALLERY_PHOTOS[idx].alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-black/20 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#1b1416] shadow-xs backdrop-blur-xs">
                        <Eye className="h-3.5 w-3.5 text-[#81141f]" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                {[3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => openPhoto(idx)}
                    className="group relative cursor-pointer overflow-hidden rounded-[16px] bg-slate-100 shadow-xs"
                    style={{ height: idx === 4 ? "460px" : "380px" }}
                  >
                    <Image
                      src={GALLERY_PHOTOS[idx].src}
                      alt={GALLERY_PHOTOS[idx].alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-black/20 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#1b1416] shadow-xs backdrop-blur-xs">
                        <Eye className="h-3.5 w-3.5 text-[#81141f]" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                {[6, 7, 8].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => openPhoto(idx)}
                    className="group relative cursor-pointer overflow-hidden rounded-[16px] bg-slate-100 shadow-xs"
                    style={{ height: idx === 7 ? "440px" : "360px" }}
                  >
                    <Image
                      src={GALLERY_PHOTOS[idx].src}
                      alt={GALLERY_PHOTOS[idx].alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-black/20 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#1b1416] shadow-xs backdrop-blur-xs">
                        <Eye className="h-3.5 w-3.5 text-[#81141f]" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. BOTTOM CTA (Figma: CTA)
           ======================================================== */}
        <section className="bg-[#4e0b13] py-20 text-white lg:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-3">
                <span className="block text-[12px] font-bold tracking-[0.2em] text-[#ebc7cb] uppercase">
                  LET'S BUILD YOUR LEGACY
                </span>
                <h2 className="font-serif text-[36px] leading-tight font-semibold tracking-tight text-white sm:text-[44px]">
                  Ready to make your next move?
                </h2>
                <p className="text-[15px] leading-relaxed text-[#f6e3e5] sm:text-[16px]">
                  Whether it's your dream home, a smart investment or a luxury
                  vehicle — let's start the conversation today.
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                <a
                  href="tel:07064482628"
                  className="inline-flex h-[50px] cursor-pointer items-center gap-2 rounded-[8px] bg-white px-7 text-[14px] font-semibold text-[#81141f] shadow-sm transition-colors hover:bg-[#f6e3e5]"
                >
                  <span>Schedule a call</span>
                  <ArrowRight className="h-4 w-4 text-[#81141f]" />
                </a>

                <a
                  href={waConsultationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[50px] cursor-pointer items-center gap-2 rounded-[8px] border border-white/30 px-6 text-[14px] font-semibold text-white transition-colors hover:border-white"
                >
                  <span>Whatsapp</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Full-Screen Gallery Viewer */}
      <GalleryViewer
        images={GALLERY_PHOTOS.map((p) => p.src)}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title={GALLERY_PHOTOS[galleryIndex]?.alt}
      />
    </div>
  )
}
