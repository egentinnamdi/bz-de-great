import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Privacy Policy | BZ Group',
  description: 'Official Privacy Policy for BZ Group — Global Universal Solutions Ltd.'
};

export default function PrivacyPage() {
  redirect('/help#privacy');
}
