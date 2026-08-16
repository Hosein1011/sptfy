import fs from "fs";
import path from "path";

describe("PWA Manifest & Service Worker Validation", () => {
  const publicDir = path.join(__dirname, "..", "public");

  describe("Web App Manifest", () => {
    const manifestPath = path.join(publicDir, "manifest.json");

    it("manifest.json exists and is valid JSON", () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
      const content = fs.readFileSync(manifestPath, "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it("manifest contains all required PWA metadata fields", () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.name).toBe("Melora - Feel Every Melody");
      expect(manifest.short_name).toBe("Melora");
      expect(manifest.start_url).toBe("/");
      expect(manifest.display).toBe("standalone");
      expect(manifest.background_color).toBe("#0B0F16");
      expect(manifest.theme_color).toBe("#0B0F16");
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    });

    it("all referenced icons in manifest exist in the public directory", () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      manifest.icons.forEach((icon: { src: string }) => {
        const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""));
        expect(fs.existsSync(iconPath)).toBe(true);
      });
    });

    it("manifest contains a maskable icon for Android adaptive icons", () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const hasMaskable = manifest.icons.some(
        (icon: { purpose?: string }) => icon.purpose === "maskable"
      );
      expect(hasMaskable).toBe(true);
    });
  });

  describe("Service Worker (sw.js)", () => {
    const swPath = path.join(publicDir, "sw.js");

    it("sw.js exists and is non-empty", () => {
      expect(fs.existsSync(swPath)).toBe(true);
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content.length).toBeGreaterThan(100);
    });

    it("sw.js handles install, activate, message and fetch events", () => {
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("addEventListener('install'");
      expect(content).toContain("addEventListener('activate'");
      expect(content).toContain("addEventListener('fetch'");
      expect(content).toContain("addEventListener('message'");
    });

    it("sw.js bypasses audio streaming and range requests to preserve music playback", () => {
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("/audio/");
      expect(content).toContain("range");
    });

    it("sw.js avoids caching mutation requests (POST/PUT/DELETE/PATCH) and auth endpoints", () => {
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("request.method !== 'GET'");
      expect(content).toContain("/api/auth/");
    });

    it("sw.js includes fallback for offline navigation", () => {
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("/offline");
    });
  });
});
