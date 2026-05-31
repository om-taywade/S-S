# Wedding invitation (offline + GitHub Pages)

Digital wedding invite you can **customize offline**, then host on GitHub for free.

## Edit details offline

1. Open **`edit.html`** in your browser (double-click, or use a local server — see below).
2. First time only: click **Load app bundle** and choose `assets/js/app.base.js`.
3. Change names, hosts, venue, events, and map link.
4. Click **Save** (stored in your browser — no internet needed).
5. Click **Preview** to open the invitation.

You can also edit **`wedding-config.json`** in any text editor and use **Import JSON** on the edit page.

### Optional: local server (still offline)

Some browsers block loading files when you double-click HTML. From this folder:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080/edit.html](http://localhost:8080/edit.html) — no Wi‑Fi required.

## Replace photos & music

| File | Purpose |
|------|---------|
| `assets/images/envelop-sr7wwrnc.png` | Envelope on opening screen |
| `assets/images/logo1-CEx21hqH.png` | Monogram on envelope |
| `assets/images/mainbg-C1qdEah8.jpg` | Hero background |
| `assets/images/pathbithai-*.png` etc. | Event card backgrounds |
| `assets/images/venue-map.jpg` | Map image (works offline) |
| `assets/audio/background_music.mp3` | Background music |

## Publish on GitHub Pages

1. Create a repo and push this folder.
2. Add an empty file named `.nojekyll` in the repo root (included if you run the deploy script below).
3. On GitHub: **Settings → Pages → Deploy from branch `main` / root**.
4. Before pushing, apply your config to the built app:

```bash
node scripts/patch-bundle.js
```

5. Your site will be at `https://<username>.github.io/<repo>/`

Use **`index.html`** as the entry URL (envelope → full invitation).

## Files

| File | Role |
|------|------|
| `edit.html` | Offline editor |
| `index.html` | Live invitation |
| `wedding-config.json` | Default / exportable settings |
| `assets/js/app.base.js` | Unchanged app template |
| `assets/js/apply-patch.js` | Applies your config to the app |
