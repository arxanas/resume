import { describe, expect, it } from "vitest";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const fileUrl = new URL("../index.html", import.meta.url).toString();

describe.concurrent("layout", () => {
  it("print output fits on one page", async () => {
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(fileUrl, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "print" });
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      });

      const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
        preferCSSPageSize: true,
      });

      const doc = await PDFDocument.load(pdfBuffer);
      expect(doc.getPageCount()).toBe(1);
    } finally {
      await browser.close();
    }
  });

  it("has no horizontal overflow on mobile", async () => {
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });

      const page = await context.newPage();
      await page.goto(fileUrl, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      });

      await page.waitForFunction(() => {
        const el = document.documentElement;
        const body = document.body;
        return (
          el.scrollWidth <= el.clientWidth &&
          (!body || body.scrollWidth <= el.clientWidth)
        );
      });
      const metrics = await page.evaluate(() => {
        const el = document.documentElement;
        const body = document.body;
        return {
          viewportWidth: el.clientWidth,
          docScrollWidth: el.scrollWidth,
          bodyScrollWidth: body ? body.scrollWidth : 0,
        };
      });

      const worstScrollWidth = Math.max(
        metrics.docScrollWidth,
        metrics.bodyScrollWidth,
      );

      expect(worstScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    } finally {
      await browser.close();
    }
  });
});
