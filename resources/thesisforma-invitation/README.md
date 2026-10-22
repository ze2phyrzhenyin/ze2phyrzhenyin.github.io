# ThesisForma invitation

Sources for `https://zhaoyang.fr/thesisforma/` (a zhaoyang.fr-only standalone page) and the
A4 PDF that is shared by hand. The PDF is not published on the site.

- `../../public/thesisforma/index.html` — the web page.
- `invitation.html` — A4 letter template for the PDF. `og.html` — 1200×630 share card.
- `qr-app.svg`, `qr-site.svg` — QR codes for https://zhauyoung.com/thesisForma/ and https://zhaoyang.fr/
  (generated with `segno`, error level M, no quiet zone).

```bash
# PDF + public/thesisforma/og.png; add TF_SERIF_DIR to re-subset the serif fonts after editing text.
GUIDE_PLAYWRIGHT_MODULE=<path to playwright/index.mjs> \
TF_SERIF_DIR=<dir with NotoSerifSC-Regular.otf and -SemiBold.otf> PYFTSUBSET=<pyftsubset> \
node resources/thesisforma-invitation/build.mjs --out ~/Downloads/ThesisForma-测试与合作邀请.pdf
```

The web page and the PDF are written as a letter; keep their text in sync when editing.
The fonts come from github.com/notofonts/noto-cjk (`Serif/SubsetOTF/SC`, SIL OFL 1.1).
