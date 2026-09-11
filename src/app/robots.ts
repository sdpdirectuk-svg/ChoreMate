import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms"],
        disallow: ["/app", "/app/", "/setup", "/setup/", "/kid", "/kid/", "/login", "/signup"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
