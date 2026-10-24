export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ListingCategory = 'cars' | 'homes' | 'properties';
export type ListingMode = 'rent' | 'buy';
export type ListingStatus = 'available' | 'rented' | 'sold' | 'reserved' | 'under_inspection';
export type BookingType = 'car_rental' | 'car_test_drive' | 'property_inspection';
export type PaymentStatus = 'pending' | 'receipt_uploaded' | 'verified' | 'refunded';
export type BookingStatus = 'requested' | 'confirmed' | 'active' | 'returned' | 'declined' | 'rescheduled';
export type ExchangeDirection = 'rmb_to_naira' | 'naira_to_rmb';
export type ExchangeStatus = 'requested' | 'account_sent' | 'receipt_received' | 'approved' | 'paid_out' | 'rejected';
export type UserRole = 'admin' | 'treasury' | 'concierge' | 'customer';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          category: ListingCategory;
          mode: ListingMode;
          title: string;
          subtitle: string;
          slug: string;
          price: number;
          price_unit: string;
          price_formatted: string;
          caution_fee: number;
          images: Json;
          location: string;
          state: string;
          status: ListingStatus;
          featured: boolean;
          description: string;
          specs: Json;
          features: Json;
          inspection_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          category: ListingCategory;
          mode: ListingMode;
          title: string;
          subtitle: string;
          slug: string;
          price: number;
          price_unit?: string;
          price_formatted: string;
          caution_fee?: number;
          images?: Json;
          location: string;
          state?: string;
          status?: ListingStatus;
          featured?: boolean;
          description: string;
          specs?: Json;
          features?: Json;
          inspection_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: ListingCategory;
          mode?: ListingMode;
          title?: string;
          subtitle?: string;
          slug?: string;
          price?: number;
          price_unit?: string;
          price_formatted?: string;
          caution_fee?: number;
          images?: Json;
          location?: string;
          state?: string;
          status?: ListingStatus;
          featured?: boolean;
          description?: string;
          specs?: Json;
          features?: Json;
          inspection_available?: boolean;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          type: BookingType;
          listing_id: string | null;
          listing_title: string;
          listing_image: string | null;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          start_date: string;
          end_date: string | null;
          driver_option: string | null;
          pickup_location: string | null;
          total_amount: number;
          payment_status: PaymentStatus;
          booking_status: BookingStatus;
          receipt_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          type: BookingType;
          listing_id?: string | null;
          listing_title: string;
          listing_image?: string | null;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          start_date: string;
          end_date?: string | null;
          driver_option?: string | null;
          pickup_location?: string | null;
          total_amount?: number;
          payment_status?: PaymentStatus;
          booking_status?: BookingStatus;
          receipt_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: BookingType;
          listing_id?: string | null;
          listing_title?: string;
          listing_image?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          start_date?: string;
          end_date?: string | null;
          driver_option?: string | null;
          pickup_location?: string | null;
          total_amount?: number;
          payment_status?: PaymentStatus;
          booking_status?: BookingStatus;
          receipt_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      rmb_rates: {
        Row: {
          id: string;
          pay_rmb_rate: number;
          pay_naira_rate: number;
          updated_at_display: string;
          updated_by: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          pay_rmb_rate: number;
          pay_naira_rate: number;
          updated_at_display?: string;
          updated_by?: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          pay_rmb_rate?: number;
          pay_naira_rate?: number;
          updated_at_display?: string;
          updated_by?: string;
          is_current?: boolean;
        };
      };
      rmb_exchange_requests: {
        Row: {
          id: string;
          direction: ExchangeDirection;
          source_amount: number;
          rate_applied: number;
          destination_amount: number;
          destination_channel: string;
          destination_account_details: string | null;
          customer_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_whatsapp: string;
          sender_bank: string | null;
          sender_account_name: string | null;
          receipt_url: string | null;
          status: ExchangeStatus;
          rate_locked_until: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          direction: ExchangeDirection;
          source_amount: number;
          rate_applied: number;
          destination_amount: number;
          destination_channel?: string;
          destination_account_details?: string | null;
          customer_id?: string | null;
          customer_name: string;
          customer_email: string;
          customer_whatsapp: string;
          sender_bank?: string | null;
          sender_account_name?: string | null;
          receipt_url?: string | null;
          status?: ExchangeStatus;
          rate_locked_until?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          direction?: ExchangeDirection;
          source_amount?: number;
          rate_applied?: number;
          destination_amount?: number;
          destination_channel?: string;
          destination_account_details?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          customer_whatsapp?: string;
          sender_bank?: string | null;
          sender_account_name?: string | null;
          receipt_url?: string | null;
          status?: ExchangeStatus;
          rate_locked_until?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          location: string;
          total_bookings: number;
          lifetime_spend_ngn: number;
          status: string;
          notes: string | null;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone: string;
          location?: string;
          total_bookings?: number;
          lifetime_spend_ngn?: number;
          status?: string;
          notes?: string | null;
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          location?: string;
          total_bookings?: number;
          lifetime_spend_ngn?: number;
          status?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      staff_activities: {
        Row: {
          id: string;
          staff_name: string;
          staff_role: string;
          action: string;
          target: string;
          details: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_name: string;
          staff_role: string;
          action: string;
          target: string;
          details: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_name?: string;
          staff_role?: string;
          action?: string;
          target?: string;
          details?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
