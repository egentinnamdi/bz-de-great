import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Terms of Service | BZ Group',
  description: 'Official Terms of Service for BZ Group — Global Universal Solutions Ltd.'
};

export default function TermsPage() {
  redirect('/help#terms');
}
