"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Check,
  MessageSquare,
  Search,
  Calendar,
  CreditCard,
  Key,
  Camera,
  MapPin,
  Users,
  Settings,
  Fuel,
  Bed,
  Bath,
  Maximize2,
  Heart,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SearchPanel } from "@/components/search-panel"
import { TrustStrip } from "@/components/trust-strip"
import { ServiceTile, SERVICES_DATA } from "@/components/service-tile"
import { RmbCalculator } from "@/components/rmb-calculator"
import { GalleryViewer } from "@/components/gallery-viewer"
import { GetAccountModal } from "@/components/get-account-modal"
import { BookingModal } from "@/components/booking-modal"
import { useStore } from "@/lib/store"
import { SITE_CONFIG } from "@/lib/constants"
import { Listing } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const { listings } = useStore()

  // Modals state
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountDirection, setAccountDirection] = useState<
    "rmb_to_naira" | "naira_to_rmb"
  >("rmb_to_naira")
  const [accountSourceAmount, setAccountSourceAmount] = useState(10000)
  const [accountDestAmount, setAccountDestAmount] = useState(2050000)

  // Selected booking modal state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  // Saved favorites local state
  const [savedFavorites, setSavedFavorites] = useState<Record<string, boolean>>(
    {}
  )

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 3 Featured Cars matching Screenshot 3
  const featuredCars = [
    {
      id: "car-rent-1",
      title: "Lincoln Navigator 2022",
      badge: "For rent",
      location: "Wuse 2, Abuja",
      seats: 7,
      transmission: "Automatic",
      fuel: "Petrol",
      price: "₦180,000",
      period: "/ day",
      image: "/photos/car-suv-white.jpg",
      href: "/cars/rent/car-rent-1",
    },
    {
      id: "car-rent-2",
      title: "Mercedes-Benz E-Class 2022",
      badge: "For rent",
      location: "Central Area, Abuja",
      seats: 5,
      transmission: "Automatic",
      fuel: "Petrol",
      price: "₦120,000",
      period: "/ day",
      image: "/photos/car-sedan-black.jpg",
      href: "/cars/rent/car-rent-2",
    },
    {
      id: "car-sale-1",
      title: "BMW X5 xDrive40i 2021",
      badge: "For sale",
      location: "Asokoro, Abuja",
      seats: 5,
      transmission: "Automatic",
      fuel: "Petrol",
      price: "₦85,000,000",
      period: "",
      image: "/photos/car-suv-grey.jpg",
      href: "/cars/buy/car-sale-1",
    },
  ]

  // 3 Featured Properties matching Screenshot 4
  const featuredProperties = [
    {
      id: "prop-sale-1",
      title: "5-Bedroom Detached Duplex",
      badge: "For sale",
      location: "Maitama, Abuja",
      beds: 5,
      baths: 6,
      sqm: "620 m²",
      price: "₦650,000,000",
      period: "",
      image: "/photos/house-duplex.jpg",
      href: "/properties/buy/prop-sale-1",
    },
    {
      id: "home-rent-1",
      title: "3-Bedroom Serviced Apartment",
      badge: "For rent",
      location: "Jabi, Abuja",
      beds: 3,
      baths: 3,
      sqm: "210 m²",
      price: "₦12,000,000",
      period: "/ year",
      image: "/photos/apartment-interior.jpg",
      href: "/homes/rent/home-rent-1",
    },
    {
      id: "prop-sale-3",
      title: "4-Bedroom Terrace",
      badge: "For sale",
      location: "Guzape, Abuja",
      beds: 4,
      baths: 5,
      sqm: "380 m²",
      price: "₦280,000,000",
      period: "",
      image: "/photos/house-terrace.jpg",
      href: "/properties/buy/prop-sale-3",
    },
  ]

  const galleryImages = [
    "/figma-images/665d90e743a205c06abfb1aeff42229068a3c479.jpg",
    "/figma-images/506af3604aeceba8c9763e7ff50446bbd51233c6.jpg",
    "/figma-images/16796229e74bcb49be8ca0ec94564ac932d8bfb1.jpg",
    "/figma-images/e491777d141c05714cbef3042bbf7c3c0b8b19cc.jpg",
    "/figma-images/4862980413b5d5e99a04772b1f2fba4826abb663.jpg",
    "/figma-images/bc39a3ebf95cfbbf83829619024c0ea495727dd1.jpg",
    "/photos/gallery-bz-1.jpg",
    "/photos/gallery-bz-4.jpg",
    "/photos/gallery-bz-6.jpg",
  ]

  const handleOpenAccountModal = (
    direction: "rmb_to_naira" | "naira_to_rmb",
    sourceAmount: number,
    destAmount: number
  ) => {
    setAccountDirection(direction)
    setAccountSourceAmount(sourceAmount)
    setAccountDestAmount(destAmount)
    setAccountModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#1b1416]">
      {/* 1. Global Site Header */}
      <SiteHeader />

      <main className="flex-1">
        {/* 2. Hero Section matching Screenshot 1 */}
        <section className="relative overflow-hidden bg-[#4e0b13]">
          {/* Right Hero Image */}
          <div className="pointer-events-none absolute -top-56 right-0 h-full w-full opacity-40 lg:w-[840px] lg:opacity-100">
            <Image
              src="/figma-images/e8b2ce0a7d6a61ecd9eb4cf9a51f10d9abf00211.jpg"
              alt="BZ De Great Luxury Lifestyle"
              fill
              priority
              className="object-cover object-right-top"
            />
            {/* Smooth linear gradient blend into #4e0b13 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4e0b13] via-[#4e0b13]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4e0b13] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-16 pb-36 lg:px-[120px] lg:pt-24 lg:pb-44">
            <div className="flex max-w-[620px] flex-col space-y-6">
              {/* Eyebrow */}
              <div className="text-[12px] font-bold tracking-widest text-white/80 uppercase">
                INVEST IN VALUE · LIVE THE FUTURE
              </div>

              {/* Headline */}
              <h1 className="font-serif text-5xl leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl lg:text-[76px]">
                Drive it. Live in it.
                <br />
                Own it.
              </h1>

              {/* Subtitle */}
              <p className="max-w-[540px] font-sans text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
                Rent or buy premium cars and homes, and change RMB and naira at
                a clear daily rate — all through one trusted team.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/cars/rent"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-[14px] font-semibold text-[#7A0C1A] shadow-md transition-all hover:bg-[#faf7f7]"
                >
                  <span>Browse listings</span>
                  <ArrowRight className="h-4 w-4 text-[#7A0C1A]" />
                </Link>

                <Link
                  href="/rmb-exchange"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/40 px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:border-white hover:bg-white/10"
                >
                  <span>Exchange RMB</span>
                </Link>
              </div>
            </div>

            {/* Overlapping Search Panel */}
            <div className="mt-14 lg:mt-20">
              <SearchPanel />
            </div>
          </div>
        </section>

        {/* 3. Trust Strip matching Screenshot 1 */}
        <TrustStrip />

        {/* 4. "WHAT WE DO" - Six services, one trusted team matching Screenshot 2 */}
        <section id="services" className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1440px] space-y-12 px-4 lg:px-[120px]">
            <div className="max-w-2xl space-y-2">
              <span className="block text-xs font-bold tracking-wider text-[#7A0C1A] uppercase">
                WHAT WE DO
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[#1b1416] sm:text-4xl">
                Six services, one trusted team
              </h2>
              <p className="text-xs leading-relaxed text-[#716769] sm:text-sm">
                Whether you need a car for the weekend, a home for the year or
                naira for your RMB by tomorrow, BZ Group handles it end to end.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SERVICES_DATA.map((service) => (
                <ServiceTile key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* 5. "MEET THE FOUNDER" matching Screenshot 2 */}
        <section
          id="founder"
          className="border-t border-[#eae3e4] bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px] px-4 lg:px-[120px]">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left Column: Portrait Collage */}
              <div className="relative mx-auto h-[520px] w-full max-w-[480px] sm:h-[580px] lg:col-span-5">
                {/* Soft pink backdrop pill */}
                <div className="absolute top-8 left-0 h-[400px] w-[320px] rounded-3xl bg-[#fbf3f4] sm:h-[480px] sm:w-[380px]" />

                {/* Main portrait */}
                <div className="absolute top-0 left-6 h-[400px] w-[300px] overflow-hidden rounded-3xl shadow-xl sm:left-10 sm:h-[480px] sm:w-[360px]">
                  <Image
                    src="/figma-images/e7e0842008a998a504baff27450bc2cfd6a23fcc.jpg"
                    alt="BZ De Great - Founder"
                    fill
                    sizes="(max-width: 768px) 300px, 360px"
                    className="object-cover object-top"
                  />
                </div>

                {/* Overlapping small portrait */}
                <div className="absolute right-2 -bottom-2 z-20 h-[200px] w-[160px] overflow-hidden rounded-2xl border-4 border-white shadow-xl sm:right-0 sm:h-[240px] sm:w-[190px]">
                  <Image
                    src="/figma-images/665d90e743a205c06abfb1aeff42229068a3c479.jpg"
                    alt="BZ De Great Heritage"
                    fill
                    sizes="190px"
                    className="object-cover"
                  />
                </div>

                {/* Floating 10+ Experience Badge */}
                <div className="absolute bottom-10 left-0 z-30 rounded-2xl bg-[#7A0C1A] p-4 text-white shadow-xl">
                  <span className="block font-sans text-3xl leading-none font-bold">
                    10+
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-white/80">
                    Years of experience
                  </span>
                </div>
              </div>

              {/* Right Column: Founder Copy */}
              <div className="flex flex-col space-y-6 lg:col-span-7">
                <div>
                  <span className="mb-2 block text-xs font-bold tracking-wider text-[#7A0C1A] uppercase">
                    MEET THE FOUNDER
                  </span>
                  <h2 className="font-serif text-3xl leading-tight font-semibold text-[#1b1416] sm:text-4xl lg:text-[46px]">
                    Visionary. Strategist.
                    <br />
                    Results driven.
                  </h2>
                </div>

                <p className="text-xs leading-relaxed text-[#4a4245] sm:text-sm">
                  BZ De Great is a realtor, investment broker and entrepreneur
                  working across four industries real estate, automobiles,
                  fashion and technology. His mission is simple: create value,
                  build wealth and deliver results through intelligent
                  investments.
                </p>

                <p className="text-xs leading-relaxed text-[#4a4245] sm:text-sm">
                  BZ Group brings that experience together in one place, so
                  every car, home and payment is handled by a team built on
                  trust, performance and excellence.
                </p>

                {/* 4 Checkmarks in 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3.5 py-1 text-xs font-semibold text-[#1b1416]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fdf3f4] text-[10px] font-bold text-[#7A0C1A]">
                      ✓
                    </span>
                    <span>Trusted expertise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fdf3f4] text-[10px] font-bold text-[#7A0C1A]">
                      ✓
                    </span>
                    <span>Proven results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fdf3f4] text-[10px] font-bold text-[#7A0C1A]">
                      ✓
                    </span>
                    <span>Client focused</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fdf3f4] text-[10px] font-bold text-[#7A0C1A]">
                      ✓
                    </span>
                    <span>Market leader</span>
                  </div>
                </div>

                {/* 4 Stats in a row */}
                <div className="grid grid-cols-2 gap-4 border-y border-[#eae3e4] py-5 sm:grid-cols-4">
                  <div>
                    <span className="block font-serif text-2xl font-bold text-[#7A0C1A] sm:text-3xl">
                      500+
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[#716769]">
                      Properties sold
                    </span>
                  </div>
                  <div>
                    <span className="block font-serif text-2xl font-bold text-[#7A0C1A] sm:text-3xl">
                      ₦50M+
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[#716769]">
                      In transactions
                    </span>
                  </div>
                  <div>
                    <span className="block font-serif text-2xl font-bold text-[#7A0C1A] sm:text-3xl">
                      10+
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[#716769]">
                      Years experience
                    </span>
                  </div>
                  <div>
                    <span className="block font-serif text-2xl font-bold text-[#7A0C1A] sm:text-3xl">
                      4
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[#716769]">
                      Industries
                    </span>
                  </div>
                </div>

                {/* Signature Bar & Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div>
                    <span className="block font-serif text-2xl font-bold tracking-tight text-[#1b1416] italic">
                      BZ De Great
                    </span>
                    <span className="text-[11px] font-medium text-[#716769]">
                      Founder, BZ Group
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A0C1A] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#600814]"
                    >
                      <span>More about me</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={SITE_CONFIG.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-[#eae3e4] bg-white px-4 py-2.5 text-xs font-semibold text-[#1b1416] transition-colors hover:bg-[#faf7f7]"
                    >
                      Book a consultation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. "THE BRAND" / "A vision in motion" matching Screenshot 3 */}
        <section
          id="gallery"
          className="border-t border-[#eae3e4] bg-white py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px] space-y-10 px-4 lg:px-[120px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <span className="block text-xs font-bold tracking-wider text-[#7A0C1A] uppercase">
                  THE BRAND
                </span>
                <h2 className="font-serif text-3xl font-semibold text-[#1b1416] sm:text-4xl">
                  A vision in motion
                </h2>
                <p className="text-xs text-[#716769] sm:text-sm">
                  Moments from the work, the events and the man behind BZ Group.
                </p>
              </div>

              <Link
                href="/about#gallery"
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#eae3e4] px-4 py-2 text-xs font-semibold text-[#1b1416] transition-colors hover:bg-[#faf7f7] sm:self-auto"
              >
                <span>View full gallery</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7A0C1A]" />
              </Link>
            </div>

            {/* 6-Photo Masonry Layout */}
            <div className="grid h-auto grid-cols-1 gap-4 md:h-[580px] md:grid-cols-12">
              {/* Col 1: Left tall portrait */}
              <div
                onClick={() => {
                  setGalleryIndex(0)
                  setGalleryOpen(true)
                }}
                className="group relative h-[380px] cursor-pointer overflow-hidden rounded-2xl border border-[#eae3e4] shadow-xs md:col-span-4 md:h-full"
              >
                <Image
                  src="/figma-images/665d90e743a205c06abfb1aeff42229068a3c479.jpg"
                  alt="BZ De Great Royal Portrait"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
              </div>

              {/* Col 2: Center two tiles */}
              <div className="flex h-[440px] flex-col gap-4 md:col-span-4 md:h-full">
                <div
                  onClick={() => {
                    setGalleryIndex(1)
                    setGalleryOpen(true)
                  }}
                  className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-[#eae3e4] shadow-xs"
                >
                  <Image
                    src="/figma-images/506af3604aeceba8c9763e7ff50446bbd51233c6.jpg"
                    alt="BZ De Great Luxury Suite"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
                </div>
                <div
                  onClick={() => {
                    setGalleryIndex(2)
                    setGalleryOpen(true)
                  }}
                  className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-[#eae3e4] shadow-xs"
                >
                  <Image
                    src="/figma-images/16796229e74bcb49be8ca0ec94564ac932d8bfb1.jpg"
                    alt="BZ De Great Cultural Heritage"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
                </div>
              </div>

              {/* Col 3: Right three tiles */}
              <div className="flex h-[520px] flex-col gap-4 md:col-span-4 md:h-full">
                <div
                  onClick={() => {
                    setGalleryIndex(3)
                    setGalleryOpen(true)
                  }}
                  className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-[#eae3e4] shadow-xs"
                >
                  <Image
                    src="/figma-images/e491777d141c05714cbef3042bbf7c3c0b8b19cc.jpg"
                    alt="BZ De Great Estate View"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
                </div>

                <div className="grid flex-1 grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      setGalleryIndex(4)
                      setGalleryOpen(true)
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#eae3e4] shadow-xs"
                  >
                    <Image
                      src="/figma-images/4862980413b5d5e99a04772b1f2fba4826abb663.jpg"
                      alt="BZ De Great Fashion"
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
                  </div>

                  {/* +3 More Overlay tile */}
                  <div
                    onClick={() => {
                      setGalleryIndex(5)
                      setGalleryOpen(true)
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#eae3e4] shadow-xs"
                  >
                    <Image
                      src="/figma-images/bc39a3ebf95cfbbf83829619024c0ea495727dd1.jpg"
                      alt="BZ De Great More Gallery"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#540911]/80 p-2 text-center text-white transition-colors group-hover:bg-[#540911]/90">
                      <Camera className="mb-1 h-5 w-5" />
                      <span className="text-xs font-bold">+3 more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. "FEATURED CARS" / "Ready when you are" matching Screenshot 3 */}
        <section className="border-t border-[#eae3e4] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1440px] space-y-10 px-4 lg:px-[120px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <span className="block text-xs font-bold tracking-wider text-[#7A0C1A] uppercase">
                  FEATURED CARS
                </span>
                <h2 className="font-serif text-3xl font-semibold text-[#1b1416] sm:text-4xl">
                  Ready when you are
                </h2>
              </div>

              <Link
                href="/cars/rent"
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#eae3e4] px-4 py-2 text-xs font-semibold text-[#1b1416] transition-colors hover:bg-[#faf7f7] sm:self-auto"
              >
                <span>View all cars</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7A0C1A]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCars.map((car) => (
                <div
                  key={car.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#eae3e4] bg-white transition-all duration-300 hover:shadow-lg"
                >
                  {/* Photo with Badge & Heart */}
                  <div className="relative h-60 w-full bg-[#faf7f7]">
                    <Image
                      src={car.image}
                      alt={car.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-[#1b1416] shadow-2xs">
                      {car.badge}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(car.id, e)}
                      className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#716769] shadow-2xs transition-colors hover:text-[#7A0C1A]"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          savedFavorites[car.id] &&
                            "fill-[#7A0C1A] text-[#7A0C1A]"
                        )}
                      />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-1 text-base font-semibold text-[#1b1416]">
                        {car.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#716769]">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{car.location}</span>
                      </div>

                      {/* Specs */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-[#716769]">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{car.seats} seats</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Settings className="h-3.5 w-3.5" />
                          <span>{car.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="h-3.5 w-3.5" />
                          <span>{car.fuel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & View */}
                    <div className="flex items-center justify-between border-t border-[#eae3e4] pt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-[#1b1416]">
                          {car.price}
                        </span>
                        {car.period && (
                          <span className="text-xs text-[#716769]">
                            {car.period}
                          </span>
                        )}
                      </div>
                      <Link
                        href={car.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A0C1A] hover:underline"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. "HOMES & PROPERTY" / "Places worth coming home to" matching Screenshot 4 */}
        <section className="border-t border-[#eae3e4] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1440px] space-y-10 px-4 lg:px-[120px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1.5">
                <span className="block text-xs font-bold tracking-wider text-[#7A0C1A] uppercase">
                  HOMES &amp; PROPERTY
                </span>
                <h2 className="font-serif text-3xl font-semibold text-[#1b1416] sm:text-4xl">
                  Places worth coming home to
                </h2>
              </div>

              <Link
                href="/properties/buy"
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#eae3e4] px-4 py-2 text-xs font-semibold text-[#1b1416] transition-colors hover:bg-[#faf7f7] sm:self-auto"
              >
                <span>View all property</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7A0C1A]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#eae3e4] bg-white transition-all duration-300 hover:shadow-lg"
                >
                  {/* Photo with Badge & Heart */}
                  <div className="relative h-60 w-full bg-[#faf7f7]">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-[#1b1416] shadow-2xs">
                      {prop.badge}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(prop.id, e)}
                      className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#716769] shadow-2xs transition-colors hover:text-[#7A0C1A]"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          savedFavorites[prop.id] &&
                            "fill-[#7A0C1A] text-[#7A0C1A]"
                        )}
                      />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-1 text-base font-semibold text-[#1b1416]">
                        {prop.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#716769]">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{prop.location}</span>
                      </div>

                      {/* Specs */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-[#716769]">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          <span>{prop.beds} beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5" />
                          <span>{prop.baths} baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5" />
                          <span>{prop.sqm}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & View */}
                    <div className="flex items-center justify-between border-t border-[#eae3e4] pt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-[#1b1416]">
                          {prop.price}
                        </span>
                        {prop.period && (
                          <span className="text-xs text-[#716769]">
                            {prop.period}
                          </span>
                        )}
                      </div>
                      <Link
                        href={prop.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A0C1A] hover:underline"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. "RMB EXCHANGE" matching Screenshot 4 */}
        <section id="rmb" className="bg-[#540911] py-20 text-white lg:py-24">
          <div className="mx-auto max-w-[1440px] px-4 lg:px-[120px]">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left Copy */}
              <div className="flex flex-col space-y-6 lg:col-span-7">
                <div>
                  <span className="mb-2 block text-xs font-bold tracking-wider text-[#ebc7cb] uppercase">
                    RMB EXCHANGE
                  </span>
                  <h2 className="font-serif text-3xl leading-tight font-semibold text-white sm:text-4xl lg:text-[46px]">
                    Change RMB and naira at a rate you can see.
                  </h2>
                </div>

                <p className="max-w-xl text-xs leading-relaxed text-[#f6e3e5] sm:text-sm">
                  Pay RMB and get naira, or pay naira and get RMB. Rates are set
                  every morning in our dashboard and shown upfront.
                </p>

                {/* 4 Numbered Steps */}
                <div className="space-y-3 pt-2 text-xs text-[#f6e3e5]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/40 text-[10px] font-bold">
                      1
                    </span>
                    <span>Calculate with today&apos;s rate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/40 text-[10px] font-bold">
                      2
                    </span>
                    <span>
                      Tap Get account and add your name, email and WhatsApp
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/40 text-[10px] font-bold">
                      3
                    </span>
                    <span>
                      Paying RMB? We send our RMB account to your WhatsApp
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/40 text-[10px] font-bold">
                      4
                    </span>
                    <span>
                      Paying naira? You&apos;ll see our company account straight
                      away
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/rmb-exchange"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-[#7A0C1A] shadow-md transition-colors hover:bg-[#faf7f7]"
                  >
                    <span>Start an exchange</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#7A0C1A]" />
                  </Link>
                </div>
              </div>

              {/* Right Calculator Card */}
              <div className="flex justify-center lg:col-span-5 lg:justify-end">
                <RmbCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* 10. "HOW IT WORKS" matching Screenshot 4 */}
        <section className="border-t border-[#eae3e4] bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1440px] space-y-12 px-4 lg:px-[120px]">
            <div>
              <span className="mb-1.5 block text-xs font-bold tracking-wider text-[#7A0C1A] uppercase">
                HOW IT WORKS
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[#1b1416] sm:text-4xl">
                Simple from first click to keys in hand
              </h2>
            </div>

            {/* 4 Step Columns with top maroon border */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 01 */}
              <div className="flex flex-col space-y-2 border-t-2 border-[#7A0C1A] pt-6">
                <div className="flex items-center justify-between text-[#7A0C1A]">
                  <Search className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold">01</span>
                </div>
                <h3 className="pt-1 text-base font-bold text-[#1b1416]">
                  Find
                </h3>
                <p className="text-xs leading-relaxed text-[#716769]">
                  Browse verified cars and properties, or check today&apos;s RMB
                  rate.
                </p>
              </div>

              {/* Step 02 */}
              <div className="flex flex-col space-y-2 border-t-2 border-[#7A0C1A] pt-6">
                <div className="flex items-center justify-between text-[#7A0C1A]">
                  <Calendar className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold">02</span>
                </div>
                <h3 className="pt-1 text-base font-bold text-[#1b1416]">
                  Book
                </h3>
                <p className="text-xs leading-relaxed text-[#716769]">
                  Pick your dates or request an inspection or test drive.
                </p>
              </div>

              {/* Step 03 */}
              <div className="flex flex-col space-y-2 border-t-2 border-[#7A0C1A] pt-6">
                <div className="flex items-center justify-between text-[#7A0C1A]">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold">03</span>
                </div>
                <h3 className="pt-1 text-base font-bold text-[#1b1416]">Pay</h3>
                <p className="text-xs leading-relaxed text-[#716769]">
                  Transfer to our account and upload your receipt for
                  confirmation.
                </p>
              </div>

              {/* Step 04 */}
              <div className="flex flex-col space-y-2 border-t-2 border-[#7A0C1A] pt-6">
                <div className="flex items-center justify-between text-[#7A0C1A]">
                  <Key className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold">04</span>
                </div>
                <h3 className="pt-1 text-base font-bold text-[#1b1416]">
                  Drive or move in
                </h3>
                <p className="text-xs leading-relaxed text-[#716769]">
                  We confirm, hand over and stay on call if you need us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. "Want to see it in person first?" CTA matching Screenshot 5 */}
        <section className="relative overflow-hidden py-24 text-center text-white lg:py-28">
          <div className="absolute inset-0 z-0">
            <Image
              src="/figma-images/3106610cc25be4b155398cf1c889ed0535a4873b.jpg"
              alt="BZ Group Inspection & Test Drive"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#540911]/85 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center space-y-6 px-4">
            <h2 className="font-serif text-3xl leading-tight font-semibold text-white sm:text-5xl">
              Want to see it in person first?
            </h2>

            <p className="max-w-lg text-xs leading-relaxed text-[#f6e3e5] sm:text-sm">
              Book a property inspection or a test drive. We&apos;ll confirm a
              time on WhatsApp.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/cars/rent"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-7 py-3 text-xs font-semibold text-[#7A0C1A] shadow-lg transition-colors hover:bg-[#faf7f7]"
              >
                <span>Book an inspection</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7A0C1A]" />
              </Link>
              <a
                href={SITE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/40 px-7 py-3 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Global Site Footer matching Screenshot 5 */}
      <SiteFooter />

      {/* Modals */}
      <GalleryViewer
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      <GetAccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        direction={accountDirection}
        sourceAmount={accountSourceAmount}
        destinationAmount={accountDestAmount}
      />

      {selectedListing && (
        <BookingModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  )
}
