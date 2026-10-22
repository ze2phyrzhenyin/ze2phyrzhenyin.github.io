# ThesisForma invitation

Sources for `https://zhaoyang.fr/thesisforma/` (a zhaoyang.fr-only standalone page) and the
A4 PDF that is shared by hand. The PDF is not published on the site.

- `../../public/thesisforma/index.html` — the web page; its document figure is the single source for all outputs.
- `invitation.html` — A4 print template (two pages). `og.html` — 1200×630 share card.
- `qr-app.svg`, `qr-site.svg` — QR codes for https://zhauyoung.com/thesisForma/ and https://zhaoyang.fr/
  (generated with `segno`, error level M, no quiet zone).

```bash
# PDF + public/thesisforma/og.png; add TF_SERIF_SOURCE to re-subset the serif font after editing text.
GUIDE_PLAYWRIGHT_MODULE=<path to playwright/index.mjs> \
TF_SERIF_SOURCE=<NotoSerifSC-Medium.otf> PYFTSUBSET=<pyftsubset> \
node resources/thesisforma-invitation/build.mjs --out ~/Downloads/ThesisForma-测试与合作邀请.pdf
```

The build fails if a PDF page overflows or its content comes within 6 mm of the running footer.
`NotoSerifSC-Medium.otf` comes from github.com/notofonts/noto-cjk (`Serif/SubsetOTF/SC`, SIL OFL 1.1).
