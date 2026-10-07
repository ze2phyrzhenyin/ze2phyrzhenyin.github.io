# Web QA report

Date: 2026-10-07. Engine: installed Chromium through Playwright. JavaScript syntax checked using `node --check source/app.js`.

## Passed interaction checks

Desktop viewport 1440 × 1040; mobile viewport 390 × 844.

- Home renders all 11 chapters and accurate content counts.
- Lesson navigation, mastery and bookmark toggles, note input.
- Reconstruction from serialized learning records using a Storage adapter.
- Accented French lookup via unaccented `genericite`.
- Incorrect answer feedback, retry, correct answer feedback, and wrong-answer removal on success.
- Case-sensitive Java fill-in answer submission.
- Handwriting draft, reference-code reveal, four-item self-check, and separate self-completion marker.
- All 30 algorithm cards, BFS filtering and algorithm detail.
- All 139 API items, term filter and class filter.
- Vocabulary reveal, mark-known behavior, and checklist updates.
- Twenty-question mock selection, answering, final score, and twenty feedback sections.
- Seven course source entries and 43 official references.
- Learning-record export to a JSON download, validated import, and inert rendering of script-like text in notes.
- Balanced mock selection containing fill-in, multi-select and code-output questions; an all-correct mock scored 20/20.
- Automatic submission of an expired imported mock record.
- Complete print-content generation (373 lesson/algorithm/API/question sections plus vocabulary, corrections and sources) and cleanup after printing.
- Mobile menu, home/API/lesson layout without horizontal page overflow; dark theme rendering.
- No page-level JavaScript errors in the exercised flow.

## Test-environment boundary

Chromium enterprise policy in this execution environment blocks every URL, including file:// and localhost. No policy files were modified. Pages were rendered with Playwright `set_content`; native localStorage is unavailable on the resulting opaque origin. Persistence serialization was therefore tested with an explicit in-memory Storage adapter and reconstructed in a new page. Native file-origin storage, all operating systems and all browsers were not certified. The application has a storage-failure warning and export fallback.

The test HTML is the built single-file artifact. It has no external scripts, fonts, fetch calls, or background analytics. External source links are optional; browsing them was not part of the offline interaction test.

Browser printing depends on the user's browser and print dialog. The generated print content and print styles are present, but physical printing is not certified. The application does not execute Java in the browser or automatically grade arbitrary handwritten source code.
