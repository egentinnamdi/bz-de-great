'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Bell,
  Eye,
  ExternalLink,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Check,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function AdminWebsiteContentPage() {
  const { toast } = useToast();
  const { websiteContent, updateWebsiteContent, addActivity } = useStore();

  const [globalSearch, setGlobalSearch] = useState('');
  const [headline, setHeadline] = useState(websiteContent.heroHeadline);
  const [eyebrow, setEyebrow] = useState(websiteContent.heroEyebrow);
  const [supportingText, setSupportingText] = useState(websiteContent.heroSupportingText);
  const [founderBio, setFounderBio] = useState(websiteContent.founderBio);

  const [announcementEnabled, setAnnouncementEnabled] = useState(websiteContent.announcementEnabled);
  const [announcementText, setAnnouncementText] = useState(websiteContent.announcementText);
  const [lastPublishedText, setLastPublishedText] = useState('Synced live with Supabase BaaS');

  // Featured items on homepage
  const [featuredItems, setFeaturedItems] = useState(websiteContent.featuredItems);

  React.useEffect(() => {
    if (websiteContent) {
      setHeadline(websiteContent.heroHeadline);
      setEyebrow(websiteContent.heroEyebrow);
      setSupportingText(websiteContent.heroSupportingText);
      setFounderBio(websiteContent.founderBio);
      setAnnouncementEnabled(websiteContent.announcementEnabled);
      setAnnouncementText(websiteContent.announcementText);
      if (websiteContent.featuredItems && websiteContent.featuredItems.length > 0) {
        setFeaturedItems(websiteContent.featuredItems);
      }
    }
  }, [websiteContent]);

  // Gallery photos
  const galleryPhotos = [
    '/photos/gallery-bz-1.jpg',
    '/photos/gallery-bz-2.jpg',
    '/photos/gallery-bz-3.jpg',
    '/photos/gallery-bz-4.jpg',
    '/photos/gallery-bz-5.jpg',
    '/photos/gallery-bz-6.jpg',
    '/photos/gallery-bz-7.jpg',
    '/photos/gallery-bz-8.jpg',
    '/photos/gallery-bz-9.jpg'
  ];

  const toggleFeatured = (id: string) => {
    setFeaturedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWebsiteContent({
      heroHeadline: headline,
      heroEyebrow: eyebrow,
      heroSupportingText: supportingText,
      founderBio,
      announcementEnabled,
      announcementText,
      featuredItems
    });
    setLastPublishedText(`Published today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} by Admin`);
    await addActivity({
      actorName: 'Admin',
      actorRole: 'Master Admin',
      action: 'updated website content',
      target: 'Hero headline & CMS',
      category: 'content'
    });
    toast({
      title: 'Changes published',
      description: 'Website content successfully updated and live on homepage.',
      variant: 'success'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">Website content</h1>
          <p className="text-xs text-[#716769] mt-0.5">Edit what customers see — no developer needed</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search orders, listings, customers"
              className="pl-8 pr-3 py-1.5 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] w-64 focus:outline-none focus:border-[#7A0C1A]"
            />
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-white border border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview site</span>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Homepage hero, Meet founder, Gallery [7 cols] */}
        <div className="lg:col-span-7 space-y-6">
          {/* Homepage Hero Card */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1b1416]">Homepage hero</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] text-[10px] font-bold">
                Live
              </span>
            </div>

            {/* Image Preview & Replace */}
            <div className="flex items-center gap-4">
              <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-[#eae3e4] bg-[#faf7f7] shrink-0">
                <Image
                  src="/photos/founder-bz-3.jpg"
                  alt="Hero Preview"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] hover:bg-[#faf7f7] transition-colors"
              >
                Replace image
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={eyebrow}
                  onChange={e => setEyebrow(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">Supporting text</label>
                <textarea
                  rows={2}
                  value={supportingText}
                  onChange={e => setSupportingText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                />
              </div>
            </div>
          </div>

          {/* Meet The Founder Card */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1b1416]">Meet the founder</h2>

            <div className="flex items-start gap-4">
              <div className="relative w-24 h-28 rounded-lg overflow-hidden border border-[#eae3e4] bg-[#faf7f7] shrink-0">
                <Image
                  src="/photos/founder-bz-3.jpg"
                  alt="Founder photo"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-[11px] font-semibold text-[#1b1416]">Bio</label>
                <textarea
                  rows={4}
                  value={founderBio}
                  onChange={e => setFounderBio(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                />
              </div>
            </div>
          </div>

          {/* Gallery 9 Photos Card */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1b1416]">Gallery · 9 photos</h2>
              <span className="text-[11px] text-[#716769]">Drag to reorder</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
              {galleryPhotos.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-md overflow-hidden border border-[#eae3e4] bg-[#faf7f7] group"
                >
                  <Image
                    src={imgSrc}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]">
                    #{idx + 1}
                  </div>
                </div>
              ))}
              <div className="aspect-square rounded-md border border-dashed border-[#eae3e4] flex items-center justify-center text-[#716769] hover:text-[#1b1416] hover:bg-[#faf7f7] transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Featured items, Announcement bar, Publish [5 cols] */}
        <div className="lg:col-span-5 space-y-6">
          {/* Featured on Homepage */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1b1416]">Featured on homepage</h2>
              <p className="text-xs text-[#716769] mt-0.5">Up to 2 cars and 3 properties</p>
            </div>

            <div className="space-y-3 divide-y divide-[#eae3e4]">
              {featuredItems.map(item => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-8 rounded overflow-hidden border border-[#eae3e4] bg-[#faf7f7] shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-[#1b1416] truncate">{item.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(item.id)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0',
                      item.active ? 'bg-[#7A0C1A]' : 'bg-[#e5e7eb]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                        item.active ? 'left-5' : 'left-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1b1416]">Announcement bar</h2>
                <p className="text-xs text-[#716769] mt-0.5">At the banner above the header</p>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative cursor-pointer',
                  announcementEnabled ? 'bg-[#7A0C1A]' : 'bg-[#e5e7eb]'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                    announcementEnabled ? 'left-5' : 'left-1'
                  )}
                />
              </button>
            </div>

            <input
              type="text"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              placeholder="Announcement text"
              className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
            />
          </div>

          {/* Publish Changes Card */}
          <div className="space-y-2">
            <p className="text-xs text-[#716769] text-center">
              {lastPublishedText}
            </p>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Publish changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
