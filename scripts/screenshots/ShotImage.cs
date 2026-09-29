// Pixel helpers for Journal-Screenshots.ps1. Compiled at runtime with Add-Type -
// PowerShell loops over millions of pixels are far too slow.
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class ShotImage
{
    // A copy of `r` scaled by `scale`, as 24bpp RGB.
    public static Bitmap Crop(Bitmap src, Rectangle r, double scale)
    {
        int w = (int)(r.Width * scale), h = (int)(r.Height * scale);
        var dst = new Bitmap(w, h, PixelFormat.Format24bppRgb);
        using (var g = Graphics.FromImage(dst))
        {
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.DrawImage(src, new Rectangle(0, 0, w, h), r, GraphicsUnit.Pixel);
        }
        return dst;
    }

    // Keeps only the pale, colourless grey DAS uses for its chart watermark
    // ("NVDA--1 Minute") and paints it black on white. Candles, indicator lines and
    // axis text are all either coloured or dark, so they drop out and OCR sees only
    // the watermark.
    public static Bitmap WatermarkMask(Bitmap src, Rectangle r, double scale, int lo, int hi, int tol)
    {
        Bitmap b = Crop(src, r, scale);
        var data = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
        int n = data.Stride * b.Height;
        var buf = new byte[n];
        Marshal.Copy(data.Scan0, buf, 0, n);
        for (int y = 0; y < b.Height; y++)
        {
            int row = y * data.Stride;
            for (int x = 0; x < b.Width; x++)
            {
                int i = row + x * 3;
                int bl = buf[i], gr = buf[i + 1], rd = buf[i + 2];
                int mx = Math.Max(rd, Math.Max(gr, bl)), mn = Math.Min(rd, Math.Min(gr, bl));
                byte v = (mn >= lo && mx <= hi && mx - mn <= tol) ? (byte)0 : (byte)255;
                buf[i] = v; buf[i + 1] = v; buf[i + 2] = v;
            }
        }
        Marshal.Copy(buf, 0, data.Scan0, n);
        b.UnlockBits(data);
        return b;
    }

    sealed class Pixels
    {
        public readonly byte[] Buf; public readonly int Stride, W, H;
        public Pixels(Bitmap src)
        {
            W = src.Width; H = src.Height;
            var data = src.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
            Stride = data.Stride;
            Buf = new byte[Stride * H];
            Marshal.Copy(data.Scan0, Buf, 0, Buf.Length);
            src.UnlockBits(data);
        }
        public int Min(int x, int y) { int i = y * Stride + x * 3; return Math.Min(Buf[i], Math.Min(Buf[i + 1], Buf[i + 2])); }
        public int Max(int x, int y) { int i = y * Stride + x * 3; return Math.Max(Buf[i], Math.Max(Buf[i + 1], Buf[i + 2])); }
        public bool White(int x, int y) { return Min(x, y) >= 248; }
    }

    // The bounds of the window whose title-bar text OCR found at `title`, searched
    // within `screen`. A Windows 10 window is a white frame inside a 1px border, so:
    // walk up from the title text to the border (top), along the first white row to
    // the side borders (left/right), then down to the first full-width white row that
    // sits on a full-width non-white row (the bottom frame over the bottom border).
    // A maximised window has no border; each walk then stops at the screen edge.
    public static Rectangle FindWindow(Bitmap src, Rectangle title, Rectangle screen)
    {
        var p = new Pixels(src);
        int px = Math.Min(title.Right + 60, screen.Right - 1);

        int y = Math.Max(title.Top - 2, screen.Top);
        while (y > screen.Top && p.White(px, y)) y--;
        int top = p.White(px, y) ? screen.Top : y + 1;

        int row = Math.Min(top + 1, screen.Bottom - 1);
        int x = px;
        while (x > screen.Left && p.White(x, row)) x--;
        int left = p.White(x, row) ? screen.Left : x + 1;
        x = px;
        while (x < screen.Right - 1 && p.White(x, row)) x++;
        int right = p.White(x, row) ? screen.Right - 1 : x - 1;

        int bottom = screen.Bottom - 1;
        int x0 = left + 2, x1 = right - 2, span = Math.Max(1, x1 - x0);
        for (y = top + 150; y < screen.Bottom - 1; y++)
        {
            int white = 0, dark = 0;
            for (x = x0; x < x1; x++)
            {
                if (p.White(x, y)) white++;
                if (p.Max(x, y + 1) < 235) dark++;
            }
            if (white >= span * 0.97 && dark >= span * 0.90) { bottom = y; break; }
        }
        return Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
    }
}
