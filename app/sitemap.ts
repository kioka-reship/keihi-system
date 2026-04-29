import { MetadataRoute } from "next";

const baseUrl = "https://keihi-system-gamma.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/`,        lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/plans`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${baseUrl}/terms`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
  ];
}
