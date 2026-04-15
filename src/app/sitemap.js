import { getAllPosts } from "@/lib/firebase/posts";
import { getAllPages } from "@/lib/firebase/pages";

export default async function sitemap() {
  const baseUrl = "https://mesenlladorio.com"; // Canviar al domini real

  // 1. Pàgines estàtiques del framework
  const routes = ["", "/blog", "/youtube", "/about", "/index"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Articles del blog (només si isIndexed !== false)
  const posts = await getAllPosts();
  const postRoutes = posts
    .filter((post) => post.isIndexed !== false)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // 3. Pàgines independents (només si isIndexed !== false)
  const pages = await getAllPages();
  const dynamicPageRoutes = pages
    .filter((page) => page.isIndexed !== false)
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.createdAt || new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...routes, ...postRoutes, ...dynamicPageRoutes];
}
