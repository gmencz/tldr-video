import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "TLDR Video",
  viewport: "width=device-width,initial-scale=1",
  keywords: "Summary, Video, YouTube, TLDR",
  description: "Generate TLDRs for any video in seconds.",
  author: "Gabriel Méndez",
  language: "en",
  robots: "index, follow",
  "twitter:card": "summary_large_image",
  "twitter:image": "https://tldr-video.fly.dev/icon.png",
  "twitter:description": "Generate TLDRs for any video in seconds.",
  "X-UA-Compatible": "IE=edge,chrome=1",
  "og:title": "TLDR Video",
  "og:type": "article",
  "og:url": "https://tldr-video.fly.dev/",
  "og:image": "https://tldr-video.fly.dev/icon.png",
  "og:description": "Generate TLDRs for any video in seconds.",
});

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
