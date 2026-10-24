'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Download,
  Eye,
  MessageSquare,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';

interface CustomerRecord {
  id: string;
  initials: string;
  name: string;
  isVip?: boolean;
  email: string;
  phoneMasked: string;
  phoneFull: string;
  uses: 'RMB' | 'Cars' | 'Property';
  bookingsCount: number;
  rmbSentDisplay: string;
  totalSpentDisplay: string;
  lastActive: string;
  notes?: string;
  joinedDate?: string;
}

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [globalSearch, setGlobalSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'cars' | 'property' | 'rmb' | 'vip'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Initial customer rows matching Screenshot 2 exactly
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    {
      id: 'cust-1',
      initials: 'CO',
      name: 'Chidi Okafor',
      isVip: true,
      email: 'chidi.o@email.com',
      phoneMasked: '0803 *** 4412',
      phoneFull: '+234 803 441 2099',
      uses: 'RMB',
      bookingsCount: 0,
      rmbSentDisplay: '¥86,000',
      totalSpentDisplay: '₦18.5M',
      lastActive: 'Today',
      joinedDate: 'March 2024',
      notes: 'High volume RMB trader. Preferred destination account: ICBC Guangzhou. Always verify large transactions with client via voice call.'
    },
    {
      id: 'cust-2',
      initials: 'AE',
      name: 'Amaka Eze',
      isVip: true,
      email: 'amaka.eze@email.com',
      phoneMasked: '0816 *** 2290',
      phoneFull: '+234 816 229 0112',
      uses: 'Cars',
      bookingsCount: 6,
      rmbSentDisplay: '—',
      totalSpentDisplay: '₦3.9M',
      lastActive: 'Today',
      joinedDate: 'January 2024',
      notes: 'Prefers luxury SUVs with executive driver for airport transfers and state functions in Abuja.'
    },
    {
      id: 'cust-3',
      initials: 'TB',
      name: 'Tunde Bello',
      isVip: true,
      email: 'tunde@company.ng',
      phoneMasked: '0809 *** 7781',
      phoneFull: '+234 809 778 1234',
      uses: 'RMB',
      bookingsCount: 0,
      rmbSentDisplay: '¥140,000',
      totalSpentDisplay: '₦30.2M',
      lastActive: '1 hr ago',
      joinedDate: 'November 2023',
      notes: 'Corporate procurement director. Regular weekly transactions of ₦5M+.'
    },
    {
      id: 'cust-4',
      initials: 'FS',
      name: 'Fatima Sule',
      isVip: false,
      email: 'fatima.s@email.com',
      phoneMasked: '0812 *** 0034',
      phoneFull: '+234 812 003 4599',
      uses: 'Property',
      bookingsCount: 1,
      rmbSentDisplay: '—',
      totalSpentDisplay: '₦12.0M',
      lastActive: '3 hrs ago',
      joinedDate: 'May 2024',
      notes: 'Currently leasing serviced apartment in Maitama. Considering long-term purchase option.'
    },
    {
      id: 'cust-5',
      initials: 'IO',
      name: 'Ifeanyi Obi',
      isVip: false,
      email: 'ifeanyi.obi@email.com',
      phoneMasked: '0803 *** 1120',
      phoneFull: '+234 803 112 0891',
      uses: 'Property',
      bookingsCount: 0,
      rmbSentDisplay: '—',
      totalSpentDisplay: '—',
      lastActive: 'Today',
      joinedDate: 'October 2026',
      notes: 'Inquired about Agidigba Garden City commercial plots. Inspection scheduled.'
    },
    {
      id: 'cust-6',
      initials: 'KM',
      name: 'Kelechi Madu',
      isVip: false,
      email: 'kelechi.m@email.com',
      phoneMasked: '0705 *** 6618',
      phoneFull: '+234 705 661 8820',
      uses: 'Cars',
      bookingsCount: 2,
      rmbSentDisplay: '—',
      totalSpentDisplay: '₦240K',
      lastActive: '2 hrs ago',
      joinedDate: 'August 2024',
      notes: 'Self-drive customer. Driver license and ID verified on file.'
    },
    {
      id: 'cust-7',
      initials: 'ZA',
      name: 'Zainab Abdullahi',
      isVip: false,
      email: 'zainab.a@email.com',
      phoneMasked: '0802 *** 9045',
      phoneFull: '+234 802 904 5510',
      uses: 'Property',
      bookingsCount: 0,
      rmbSentDisplay: '—',
      totalSpentDisplay: '—',
      lastActive: 'Yesterday',
      joinedDate: 'September 2024',
      notes: 'Interested in 4-bedroom duplex in Guzape. Requested brochure on WhatsApp.'
    },
    {
      id: 'cust-8',
      initials: 'EN',
      name: 'Emeka Nwosu',
      isVip: false,
      email: 'emeka.n@email.com',
      phoneMasked: '0817 *** 3302',
      phoneFull: '+234 817 330 2211',
      uses: 'RMB',
      bookingsCount: 0,
      rmbSentDisplay: '¥5,000',
      totalSpentDisplay: '₦1.1M',
      lastActive: 'Yesterday',
      joinedDate: 'June 2024',
      notes: 'E-commerce merchant sourcing electronics from Shenzhen.'
    }
  ]);

  const handleOpenCustomer = (c: CustomerRecord) => {
    setSelectedCustomer(c);
    setNoteContent(c.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedCustomer) return;
    setCustomers(prev =>
      prev.map(c => (c.id === selectedCustomer.id ? { ...c, notes: noteContent } : c))
    );
    setSelectedCustomer(prev => (prev ? { ...prev, notes: noteContent } : null));
    toast({
      title: 'Note saved to customer profile',
      description: `Updated internal dossier for ${selectedCustomer.name}.`,
      variant: 'success'
    });
  };

  const handleExportCSV = () => {
    const csvContent =
      'Name,Email,Phone,Uses,Bookings,RMB Sent,Total Spent,VIP\n' +
      customers
        .map(
          c =>
            `"${c.name}","${c.email}","${c.phoneFull}","${c.uses}","${c.bookingsCount}","${c.rmbSentDisplay}","${c.totalSpentDisplay}","${c.isVip ? 'YES' : 'NO'}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bz_customers_october_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Customer database exported',
      description: 'Downloaded bz_customers_october_2026.csv',
      variant: 'success'
    });
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    if (filterTab === 'cars' && c.uses !== 'Cars') return false;
    if (filterTab === 'property' && c.uses !== 'Property') return false;
    if (filterTab === 'rmb' && c.uses !== 'RMB') return false;
    if (filterTab === 'vip' && !c.isVip) return false;

    if (customerSearch) {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phoneMasked.includes(q) ||
        c.phoneFull.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1b1416]">Customers</h1>
          <p className="text-xs text-[#716769] mt-0.5">1,284 customers · 96 new this month</p>
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
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              filterTab === 'all'
                ? 'bg-[#7A0C1A] text-white font-bold'
                : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('cars')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              filterTab === 'cars'
                ? 'bg-[#7A0C1A] text-white font-bold'
                : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
            )}
          >
            Car renters
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('property')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              filterTab === 'property'
                ? 'bg-[#7A0C1A] text-white font-bold'
                : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
            )}
          >
            Property buyers
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('rmb')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              filterTab === 'rmb'
                ? 'bg-[#7A0C1A] text-white font-bold'
                : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
            )}
          >
            RMB clients
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('vip')}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer',
              filterTab === 'vip'
                ? 'bg-[#7A0C1A] text-white font-bold'
                : 'bg-white text-[#1b1416] border border-[#eae3e4] hover:bg-[#faf7f7]'
            )}
          >
            VIP
          </button>
        </div>

        {/* Customer Search input matching Screenshot 2 */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#716769] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            placeholder="Search name, phone or email"
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#eae3e4] rounded-xl text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
          />
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-xl border border-[#eae3e4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f7] border-b border-[#eae3e4] text-[#716769] font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Phone</th>
                <th className="py-3 px-5">Uses</th>
                <th className="py-3 px-5">Bookings</th>
                <th className="py-3 px-5">RMB sent</th>
                <th className="py-3 px-5">Total spent</th>
                <th className="py-3 px-5">Last active</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae3e4]">
              {filteredCustomers.map(row => (
                <tr key={row.id} className="hover:bg-[#fcf8f8]/50 transition-colors">
                  {/* Customer Avatar & Name & Email */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          row.isVip
                            ? 'bg-[#7A0C1A] text-white'
                            : 'bg-[#f3f4f6] text-[#4b5563]'
                        )}
                      >
                        {row.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#1b1416]">{row.name}</span>
                          {row.isVip && (
                            <span className="px-1.5 py-0.2 rounded bg-[#fdf3f4] text-[#7A0C1A] text-[9px] font-bold">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#716769]">{row.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-5 font-mono text-[#716769]">{row.phoneMasked}</td>

                  {/* Uses */}
                  <td className="py-3.5 px-5 font-medium text-[#1b1416]">{row.uses}</td>

                  {/* Bookings */}
                  <td className="py-3.5 px-5 text-[#1b1416]">{row.bookingsCount}</td>

                  {/* RMB sent */}
                  <td className="py-3.5 px-5 font-mono text-[#1b1416]">{row.rmbSentDisplay}</td>

                  {/* Total spent */}
                  <td className="py-3.5 px-5 font-semibold text-[#1b1416]">{row.totalSpentDisplay}</td>

                  {/* Last active */}
                  <td className="py-3.5 px-5 text-[#716769]">{row.lastActive}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCustomer(row)}
                        className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7] text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <a
                        href={`https://wa.me/2348139690031?text=${encodeURIComponent(`Hello ${row.name}, contacting you from BZ Group luxury services.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-md border border-[#eae3e4] bg-white text-[#1b1416] hover:bg-[#faf7f7] text-[11px] font-medium transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#eae3e4]">
            {/* Header */}
            <div className="p-5 border-b border-[#eae3e4] flex items-center justify-between bg-[#faf7f7]">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    selectedCustomer.isVip ? 'bg-[#7A0C1A] text-white' : 'bg-[#f3f4f6] text-[#4b5563]'
                  )}
                >
                  {selectedCustomer.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-bold text-[#1b1416]">{selectedCustomer.name}</h3>
                    {selectedCustomer.isVip && (
                      <span className="px-2 py-0.5 rounded-full bg-[#fdf3f4] text-[#7A0C1A] text-[10px] font-bold">
                        VIP Client
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#716769]">Joined {selectedCustomer.joinedDate || '2024'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-[#716769] hover:text-[#1b1416] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#faf7f7] border border-[#eae3e4]">
                  <span className="text-[#716769] block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-mono text-[#1b1416] font-semibold block mt-0.5">{selectedCustomer.phoneFull}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#faf7f7] border border-[#eae3e4]">
                  <span className="text-[#716769] block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-medium text-[#1b1416] block mt-0.5 truncate">{selectedCustomer.email}</span>
                </div>
              </div>

              {/* Lifetime Activity Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#fdf3f4] border border-[#fce7e9]">
                  <div className="text-[10px] font-semibold text-[#7A0C1A] uppercase">Total Spent</div>
                  <div className="text-base font-bold font-serif text-[#1b1416] mt-1">{selectedCustomer.totalSpentDisplay}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#faf7f7] border border-[#eae3e4]">
                  <div className="text-[10px] font-semibold text-[#716769] uppercase">Bookings</div>
                  <div className="text-base font-bold font-serif text-[#1b1416] mt-1">{selectedCustomer.bookingsCount}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#faf7f7] border border-[#eae3e4]">
                  <div className="text-[10px] font-semibold text-[#716769] uppercase">RMB Volume</div>
                  <div className="text-base font-bold font-serif text-[#1b1416] mt-1">{selectedCustomer.rmbSentDisplay}</div>
                </div>
              </div>

              {/* Notes Editor */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1b1416]">
                  Account Dossier &amp; Preferences
                </label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Add internal notes about client preferences, security protocols or travel requests..."
                  className="w-full p-3 bg-white border border-[#eae3e4] rounded-xl text-xs text-[#1b1416] focus:outline-none focus:border-[#7A0C1A]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={`https://wa.me/2348139690031?text=${encodeURIComponent(`Hello ${selectedCustomer.name}, this is the concierge desk at BZ Group.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-[#eae3e4] text-xs font-semibold text-[#1b1416] hover:bg-[#faf7f7] transition-colors"
                >
                  Direct WhatsApp
                </a>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 rounded-lg border border-[#eae3e4] text-xs font-medium text-[#716769] hover:bg-[#faf7f7]"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-4 py-2 rounded-lg bg-[#7A0C1A] hover:bg-[#600814] text-white text-xs font-semibold transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
