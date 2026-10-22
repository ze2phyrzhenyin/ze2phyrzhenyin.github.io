# ThesisForma invitation

Sources for `https://zhaoyang.fr/thesisforma/` (a zhaoyang.fr-only standalone page) and the
PDF that is shared by hand. The PDF is not published on the site.

- `../../public/thesisforma/index.html` — the web page (a single-column letter).
- `og.html` — 1200×630 share card, saved as `public/thesisforma/og.png`.
- The PDF is the web page on a single A4 sheet: same styles, tighter spacing, font size stepped down until it fits; links kept.

```bash
# PDF + og.png; add TF_SERIF_DIR to re-subset the serif fonts after editing text.
GUIDE_PLAYWRIGHT_MODULE=<path to playwright/index.mjs> \
TF_SERIF_DIR=<dir with NotoSerifSC-Regular.otf and -SemiBold.otf> PYFTSUBSET=<pyftsubset> \
node resources/thesisforma-invitation/build.mjs --out ~/Downloads/ThesisForma-测试与合作邀请.pdf
```

The fonts come from github.com/notofonts/noto-cjk (`Serif/SubsetOTF/SC`, SIL OFL 1.1).
