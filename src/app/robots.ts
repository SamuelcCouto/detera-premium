import type { MetadataRoute } from "next";

import { isPublicDomain, site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Enquanto o site vive na URL de preview da Vercel, nada é indexado: evita o
  // domínio provisório ranquear e depois competir com o definitivo.
  if (!isPublicDomain) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
