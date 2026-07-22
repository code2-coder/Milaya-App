import React from 'react';
import { Helmet } from 'react-helmet-async';

export function SEO({ title, description, name, type, image, url, schema }) {
  const baseTitle = "Milaya";
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const defaultDesc = "Shop premium women's, men's and kids fashion at Milaya. Explore dresses, sarees, kurtas, co-ord sets and more with secure checkout and fast delivery.";
  const fullDesc = description || defaultDesc;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={fullDesc} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook tags */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:image" content={image || "/updatelogo.jpeg"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={baseTitle} />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={image || "/updatelogo.jpeg"} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
