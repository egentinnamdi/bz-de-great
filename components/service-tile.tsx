import React from "react"
import Link from "next/link"
import { Car, Building, Home, Coins, ArrowRight, Tag, Key } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ServiceItem {
  id: string
  title: string
  description: string
  href: string
  iconName: "car" | "car-sale" | "house" | "apartment" | "property-sale" | "rmb"
  featured?: boolean
  linkText?: string
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "car-rentals",
    title: "Car rentals",
    description: "Self-drive or chauffeured, by the day, week or month.",
    href: "/cars/rent",
    iconName: "car",
    linkText: "Explore",
  },
  {
    id: "car-sales",
    title: "Car sales",
    description: "Inspected, documented vehicles with test drives on request.",
    href: "/cars/buy",
    iconName: "car-sale",
    linkText: "Explore",
  },
  {
    id: "house-rentals",
    title: "House rentals",
    description: "Detached homes and duplexes on yearly leases.",
    href: "/homes/rent",
    iconName: "house",
    linkText: "Explore",
  },
  {
    id: "apartment-rentals",
    title: "Apartment rentals",
    description: "Serviced apartments and short-lets, ready to move in.",
    href: "/homes/rent?type=Apartment",
    iconName: "apartment",
    linkText: "Explore",
  },
  {
    id: "property-sales",
    title: "Property sales",
    description: "Houses, land and commercial property with verified titles.",
    href: "/properties/buy",
    iconName: "property-sale",
    linkText: "Explore",
  },
  {
    id: "rmb-exchange",
    title: "RMB exchange",
    description:
      "Pay RMB and get naira, or pay naira and get RMB, at today's rate.",
    href: "/rmb-exchange",
    iconName: "rmb",
    featured: true,
    linkText: "See today's rates",
  },
]

export function ServiceTile({
  service,
  className,
}: {
  service: ServiceItem
  className?: string
}) {
  const isFeatured = !!service.featured

  const renderIcon = () => {
    switch (service.iconName) {
      case "car":
        return (
          <Car
            className={cn(
              "h-6 w-6",
              isFeatured ? "text-white" : "text-[#81141f]"
            )}
          />
        )
      case "car-sale":
        return (
          <Tag
            className={cn(
              "h-6 w-6",
              isFeatured ? "text-white" : "text-[#81141f]"
            )}
          />
        )
      case "house":
        return (
          <Home
            className={cn(
              "h-6 w-6",
              isFeatured ? "text-white" : "text-[#81141f]"
            )}
          />
        )
      case "apartment":
        return (
          <Building
            className={cn(
              "h-6 w-6",
              isFeatured ? "text-white" : "text-[#81141f]"
            )}
          />
        )
      case "property-sale":
        return (
          <Key
            className={cn(
              "h-6 w-6",
              isFeatured ? "text-white" : "text-[#81141f]"
            )}
          />
        )
      case "rmb":
        return (
          <span className="text-xl leading-none font-bold text-white">¥</span>
        )
      default:
        return <Car className="h-6 w-6 text-[#81141f]" />
    }
  }

  return (
    <Link
      href={service.href}
      className={cn(
        "group relative flex min-h-[258px] flex-col justify-between rounded-[16px] p-7 transition-all duration-300",
        isFeatured
          ? "bg-[#81141f] text-white shadow-lg hover:bg-[#6b121c]"
          : "border border-[#eae3e4] bg-white hover:border-[#81141f]/40 hover:shadow-lg",
        className
      )}
    >
      <div>
        {/* Icon box (Figma: [24x52] r=12) */}
        <div
          className={cn(
            "mb-5 flex h-12 w-12 items-center justify-center rounded-[12px] transition-transform group-hover:scale-105",
            isFeatured ? "bg-white/15" : "bg-[#fbf3f4]"
          )}
        >
          {renderIcon()}
        </div>

        {/* Title (Figma: font=Plus Jakarta Sans 700 22px) */}
        <h3
          className={cn(
            "font-sans text-[22px] leading-tight font-bold",
            isFeatured ? "text-white" : "text-[#1b1416]"
          )}
        >
          {service.title}
        </h3>

        {/* Body (Figma: font=Plus Jakarta Sans 400 15px) */}
        <p
          className={cn(
            "mt-2.5 text-[15px] leading-relaxed",
            isFeatured ? "text-[#f6e3e5]" : "text-[#4a4245]"
          )}
        >
          {service.description}
        </p>
      </div>

      {/* Link (Figma: font=Plus Jakarta Sans 600 13px) */}
      <div
        className={cn(
          "mt-6 flex items-center gap-1.5 pt-4 text-[13px] font-semibold",
          isFeatured ? "text-white" : "text-[#81141f]"
        )}
      >
        <span>{service.linkText || "Explore"}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
