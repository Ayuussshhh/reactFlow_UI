/**
 * ERD Page - Redirects to Dashboard
 */

import { redirect } from 'next/navigation';

export default function ERDPage() {
  redirect('/projects');
}