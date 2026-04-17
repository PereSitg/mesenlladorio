'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Forcem el scroll a dalt de tot a cada canvi de ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
