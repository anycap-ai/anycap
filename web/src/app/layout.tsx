import type { Metadata } from "next";
import { headers } from "next/headers";
import { GeistPixelSquare } from "geist/font/pixel";
import { Inter, Space_Mono } from "next/font/google";
import "@/styles/globals.css";
import { LazyGlobalTipToast } from "@/components/ui/LazyGlobalTipToast";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { siteConfig } from "@/lib/site";
import { createRobotsMetadata, defaultSocialImage } from "@/lib/seo-metadata";
import { GoogleAnalytics } from "@/components/ui/GoogleAnalytics";

export const runtime = "edge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const logoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    template: "%s",
  },
  description: siteConfig.defaultDescription,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.siteName,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [defaultSocialImage.url],
  },
  robots: createRobotsMetadata(),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/anycap-mark.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const organizationSameAs = [
  "https://github.com/anycap-ai/anycap",
  "https://github.com/anycap-ai/anycap/releases",
  "https://skills.sh/anycap-ai/anycap",
] as const;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}#organization`,
  name: "AnyCap",
  url: siteConfig.url,
  email: "admin@anycap.ai",
  logo: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/anycap-mark.svg`,
  },
  sameAs: organizationSameAs,
  description: siteConfig.defaultDescription,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "admin@anycap.ai",
      url: `${siteConfig.url}/contact`,
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}#website`,
  name: siteConfig.siteName,
  url: siteConfig.url,
  publisher: {
    "@id": `${siteConfig.url}#organization`,
  },
};

const preHydrationCleanupScript = `
  (function () {
    var shouldStrip = function (name) {
      return typeof name === "string" && name.indexOf("data-cursor-") === 0;
    };

    var stripAttrs = function (root) {
      if (!root || !root.querySelectorAll) return;
      var nodes = root.querySelectorAll("*");
      for (var i = 0; i < nodes.length; i += 1) {
        var attrs = nodes[i].attributes;
        if (!attrs) continue;
        for (var j = attrs.length - 1; j >= 0; j -= 1) {
          var attrName = attrs[j] && attrs[j].name;
          if (shouldStrip(attrName)) {
            nodes[i].removeAttribute(attrName);
          }
        }
      }
    };

    var start = function () {
      stripAttrs(document.body);

      if (typeof MutationObserver === "undefined" || !document.body) return;

      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i += 1) {
          var mutation = mutations[i];

          if (mutation.type === "attributes" && shouldStrip(mutation.attributeName)) {
            mutation.target.removeAttribute(mutation.attributeName);
          }

          for (var j = 0; j < mutation.addedNodes.length; j += 1) {
            var node = mutation.addedNodes[j];
            if (node && node.nodeType === 1) {
              stripAttrs(node);
            }
          }
        }
      });

      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
      });

      window.addEventListener(
        "load",
        function () {
          window.setTimeout(function () {
            observer.disconnect();
          }, 2000);
        },
        { once: true }
      );
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
      return;
    }

    start();
  })();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const showGlobalUi = headerStore.get("x-anycap-global-ui") === "1";

  return (
    <html lang={siteConfig.defaultLocale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: preHydrationCleanupScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${GeistPixelSquare.variable} ${inter.variable} ${logoFont.variable} bg-[#f4f5f0] text-[#1c1f17] antialiased`}
        style={{ fontFamily: "sans-serif" }}
      >
        <GoogleAnalytics />
        {showGlobalUi ? <LazyGlobalTipToast /> : null}
        {children}
        {showGlobalUi ? <GrainOverlay /> : null}
      </body>
    </html>
  );
}
