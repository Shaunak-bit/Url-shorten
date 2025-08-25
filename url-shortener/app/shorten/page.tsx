"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  Sparkles,
  Copy,
  ExternalLink,
  Calendar,
  MousePointer,
  Settings,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------
interface LinkRecord {
  _id: string;
  originalUrl: string;
  shortCode: string;
  title?: string;
  clicks: number;
  createdAt: string; // ISO string from server
}

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
const LinkLuxPage = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------------
  // STATE
  // ----------------------------------------------------------------
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  // ----------------------------------------------------------------
  // INITIAL DATA FETCH  (now /recent instead of /api/urls)
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(`${BASE_URL}/recent`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data: LinkRecord[] = await res.json();
        setLinks(data);
      } catch (err) {
        console.error("Error fetching recent links:", err);
      }
    };
    fetchLinks();
  }, [BASE_URL]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ----------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------
  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url, title }),
      });
      const newLink: LinkRecord = await res.json();
      setLinks((prev) => [newLink, ...prev]);
      setUrl("");
      setTitle("");
    } catch (err) {
      console.error("Error shortening URL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (shortCode: string, id: string) => {
    const shortUrl = `${BASE_URL}/${shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ------ Header ------ */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LinkLux</h1>
            <p className="text-sm text-gray-500">Premium URL Shortener</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl">
            <Link className="w-4 h-4" />
            <span className="font-medium">Shortener</span>
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Admin</span>
          </button>
        </div>
      </header>

      {/* ------ Main Content ------ */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Beautiful URL <span className="text-blue-500">Shortening</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform lengthy URLs into elegant, memorable links with our premium
            shortening service
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ---- Shortener Form ---- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Link className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Shorten Your URL
                  </h3>
                  <p className="text-gray-600">
                    Transform long URLs into elegant, shareable links
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-lg"
                  required
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional: Add a title for your link"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-[1.02] disabled:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Short Link...</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-5 h-5" />
                      <span>Create Short Link</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ---- Recent Links Sidebar ---- */}
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900">Recent Links</h3>
              </div>

              {links.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No links yet</p>
                  <p className="text-gray-400 text-xs">
                    Your shortened links will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div
                      key={link._id}
                      className="group border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                          {link.title || "Untitled"}
                        </h4>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() =>
                              copyToClipboard(link.shortCode, link._id)
                            }
                            className="p-1 hover:bg-blue-100 rounded transition-colors duration-200"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                `${BASE_URL}/${link.shortCode}`,
                                "_blank"
                              )
                            }
                            className="p-1 hover:bg-blue-100 rounded transition-colors duration-200"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-3 truncate">
                        {link.originalUrl}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-500 font-mono text-sm">
                            /{link.shortCode}
                          </span>
                          {copiedId === link._id && (
                            <span className="text-xs text-green-600 font-medium">
                              Copied!
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MousePointer className="w-3 h-3" />
                            <span>{link.clicks}</span>
                            <span>clicks</span>
                          </div>
                          <span>{formatDate(link.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ------ Footer ------ */}
        <footer className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-500">
            Built with elegance • LinkLux © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LinkLuxPage;