import type { MetadataRoute } from "next";

import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Página única: uma entrada só. As âncoras não entram — o Google as descobre
  // pelo HTML e listá-las aqui só produziria URLs duplicadas.
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
