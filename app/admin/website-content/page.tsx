'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Trash2,
  X,
  Megaphone
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const DEFAULT_GALLERY = [
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

export default function AdminWebsiteContentPage() {
  const { toast } = useToast();
  const { websiteContent, updateWebsiteContent, addActivity } = useStore();

  const [globalSearch, setGlobalSearch] = useState('');
  const [headline, setHeadline] = useState(websiteContent.heroHeadline);
  const [eyebrow, setEyebrow] = useState(websiteContent.heroEyebrow);
  const [supportingText, setSupportingText] = useState(websiteContent.heroSupportingText);
  const [heroImage, setHeroImage] = useState(websiteContent.heroImage || '/photos/founder-bz-3.jpg');

  const [founderBio, setFounderBio] = useState(websiteContent.founderBio);
  const [founderImage, setFounderImage] = useState(websiteContent.founderImage || '/photos/founder-bz-3.jpg');

  const [announcementEnabled, setAnnouncementEnabled] = useState(websiteContent.announcementEnabled);
  const [announcementText, setAnnouncementText] = useState(websiteContent.announcementText);
  const [lastPublishedText, setLastPublishedText] = useState('Synced live with Supabase BaaS');
  const [isPublishing, setIsPublishing] = useState(false);

  // Gallery Photos
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(
    websiteContent.galleryPhotos && websiteContent.galleryPhotos.length > 0
      ? websiteContent.galleryPhotos
      : DEFAULT_GALLERY
  );

  // Featured items on homepage
  const [featuredItems, setFeaturedItems] = useState(websiteContent.featuredItems);

  // File Input Refs
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const founderImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (websiteContent) {
      setHeadline(websiteContent.heroHeadline);
      setEyebrow(websiteContent.heroEyebrow);
      setSupportingText(websiteContent.heroSupportingText);
      if (websiteContent.heroImage) setHeroImage(websiteContent.heroImage);
      setFounderBio(websiteContent.founderBio);
      if (websiteContent.founderImage) setFounderImage(websiteContent.founderImage);
      setAnnouncementEnabled(websiteContent.announcementEnabled);
      setAnnouncementText(websiteContent.announcementText);
      if (websiteContent.galleryPhotos && websiteContent.galleryPhotos.length > 0) {
        setGalleryPhotos(websiteContent.galleryPhotos);
      }
      if (websiteContent.featuredItems && websiteContent.featuredItems.length > 0) {
        setFeaturedItems(websiteContent.featuredItems);
      }
    }
  }, [websiteContent]);

  const toggleFeatured = (id: string) => {
    setFeaturedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setHeroImage(reader.result);
          toast({
            title: 'Hero image updated',
            description: `${file.name} ready for publishing.`,
            variant: 'info'
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFounderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFounderImage(reader.result);
          toast({
            title: 'Founder photo updated',
            description: `${file.name} ready for publishing.`,
            variant: 'info'
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls: string[] = [];
      let loaded = 0;
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            newUrls.push(reader.result);
          }
          loaded++;
          if (loaded === files.length) {
            setGalleryPhotos(prev => [...prev, ...newUrls]);
            toast({
              title: 'Photos added to gallery',
              description: `${files.length} photo(s) added. Click Publish to save live.`,
              variant: 'info'
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      await updateWebsiteContent({
        heroHeadline: headline,
        heroEyebrow: eyebrow,
        heroSupportingText: supportingText,
        heroImage,
        founderBio,
        founderImage,
        announcementEnabled,
        announcementText,
        galleryPhotos,
        featuredItems
      });

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      setLastPublishedText(`Published today at ${timeStr} by Admin`);

      await addActivity({
        actorName: 'Admin',
        actorRole: 'Master Admin',
        action: 'updated website content',
        target: 'Hero headline, CMS & Announcement bar',
        category: 'content'
      });

      toast({
        title: 'Changes published successfully',
        description: announcementEnabled
          ? `Website content & announcement bar "${announcementText}" are now live on site.`
          : 'Website content updated and live on site.',
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Publish failed',
        description: 'An error occurred while saving website content.',
        variant: 'error'
      });
    } finally {
      setIsPublishing(false);
    }
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
            <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search orders, listings, customers"
              className="pl-8 pr-3 py-1.5 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] w-64 focus:outline-none focus:border-[#81141f]"
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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                <img
                  src={heroImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover object-top"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/photos/founder-bz-3.jpg';
                  }}
                />
              </div>

              <div>
                <input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => heroImageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-[#eae3e4] bg-white text-xs font-semibold text-[#1b1416] hover:bg-[#faf7f7] transition-colors cursor-pointer"
                >
                  Replace image
                </button>
                <p className="text-[11px] text-[#716769] mt-1">Recommended size: 1440 × 600px</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">Eyebrow</label>
                <input
                  type="text"
                  value={eyebrow}
                  onChange={e => setEyebrow(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">Supporting text</label>
                <textarea
                  rows={2}
                  value={supportingText}
                  onChange={e => setSupportingText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                />
              </div>
            </div>
          </div>

          {/* Meet The Founder Card */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1b1416]">Meet the founder</h2>

            <div className="flex items-start gap-4">
              <div className="relative w-24 h-28 rounded-lg overflow-hidden border border-[#eae3e4] bg-[#faf7f7] shrink-0 group">
                <img
                  src={founderImage}
                  alt="Founder photo"
                  className="w-full h-full object-cover object-top"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/photos/founder-bz-3.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => founderImageInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-semibold transition-opacity"
                >
                  Change
                </button>
              </div>

              <input
                ref={founderImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleFounderImageChange}
                className="hidden"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-[#1b1416]">Bio</label>
                  <button
                    type="button"
                    onClick={() => founderImageInputRef.current?.click()}
                    className="text-[11px] text-[#81141f] hover:underline"
                  >
                    Change photo
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={founderBio}
                  onChange={e => setFounderBio(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
                />
              </div>
            </div>
          </div>

          {/* Gallery Photos Card */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1b1416]">Gallery · {galleryPhotos.length} photos</h2>
              <span className="text-[11px] text-[#716769]">Photos displayed across portfolio</span>
            </div>

            <input
              ref={galleryImageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddGalleryPhoto}
              className="hidden"
            />

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
              {galleryPhotos.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-md overflow-hidden border border-[#eae3e4] bg-[#faf7f7] group"
                >
                  <img
                    src={imgSrc}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = '/photos/gallery-bz-1.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px]">
                    <span>#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryPhoto(idx)}
                      className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                      title="Remove photo"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => galleryImageInputRef.current?.click()}
                className="aspect-square rounded-md border border-dashed border-[#eae3e4] flex flex-col items-center justify-center text-[#716769] hover:text-[#81141f] hover:border-[#81141f] hover:bg-[#faf7f7] transition-colors cursor-pointer"
                title="Add photos to gallery"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[9px] mt-0.5 font-medium">Add</span>
              </button>
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
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/photos/car-suv-white.jpg';
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#1b1416] truncate">{item.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(item.id)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0',
                      item.active ? 'bg-[#81141f]' : 'bg-[#e5e7eb]'
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

          {/* Announcement Bar (At the banner above the header) */}
          <div className="bg-white rounded-xl border border-[#eae3e4] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#1b1416]">Announcement bar</h2>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      announcementEnabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-600'
                    )}
                  >
                    {announcementEnabled ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="text-xs text-[#716769] mt-0.5">At the banner above the header</p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative cursor-pointer',
                  announcementEnabled ? 'bg-[#81141f]' : 'bg-[#e5e7eb]'
                )}
                aria-label="Toggle announcement bar"
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                    announcementEnabled ? 'left-5' : 'left-1'
                  )}
                />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1b1416] mb-1">
                Banner Message
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="e.g. Special Offer: 15% discount on all weekly car rentals this month!"
                className="w-full px-3 py-2 bg-white border border-[#eae3e4] rounded-lg text-xs text-[#1b1416] focus:outline-none focus:border-[#81141f]"
              />
            </div>

            {/* Live Preview Box */}
            {announcementEnabled && announcementText.trim() && (
              <div className="p-2.5 rounded-[8px] bg-[#81141f] text-white text-[11px] font-medium flex items-center gap-2 shadow-2xs">
                <Megaphone className="w-3.5 h-3.5 shrink-0 text-[#ebc7cb]" />
                <span className="truncate flex-1">{announcementText}</span>
                <span className="text-[10px] text-[#ebc7cb] shrink-0 font-bold uppercase tracking-wider">
                  Live Preview
                </span>
              </div>
            )}
          </div>

          {/* Publish Changes Card */}
          <div className="space-y-2">
            <p className="text-xs text-[#716769] text-center">
              {lastPublishedText}
            </p>
            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-2.5 rounded-lg bg-[#81141f] hover:bg-[#680e18] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? 'Publishing...' : 'Publish changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
