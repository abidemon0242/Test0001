# Abid's Web Studio

A static single-page website (HTML + CSS + vanilla JS) for GitHub Pages. No build step, no backend.

## Files
- `index.html`: all sections (Home, Projects, Services, About, Order, Contact)
- `css/style.css`: design tokens (`:root`), layout, demo mockups, intro animation
- `js/language.js`: English and Bangla text
- `js/order.js`: order form, review step, sending
- `js/main.js`: contact settings, demo and service lists, intro, menu
- `assets/logo/favicon.svg`: logo mark for the browser tab

## Deploy on GitHub Pages
1. GitHub: **New repository** (public), e.g. `abids-web-studio`.
2. **Add file > Upload files**, drag in the *contents* of this folder (`index.html`, `css`, `js`, `assets`, `README.md`), then **Commit changes**.
3. **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`, then **Save**.
4. After about a minute the site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`. All paths are relative, so this sub-path works.

## What to edit
| To change | File |
|---|---|
| Phone, WhatsApp, email, form endpoint | `js/main.js`, the `SITE` block at the top |
| Demo websites | `js/main.js` `PROJECTS` (mockup styles `.m1` to `.m5` in `css/style.css`, text `d_m1`... in `js/language.js`) |
| Services | `js/main.js` `SERVICES` (text `sd_*` / `sf_*` in `js/language.js`) |
| Any English or Bangla text | `js/language.js` |
| Colors, fonts, spacing | `css/style.css`, the `:root` block |
| Logo | `index.html` `<symbol id="mark">` and `assets/logo/favicon.svg` |

Notes:
- The Call button uses `tel:01406512541` as requested. Visitors outside Bangladesh need the international form, so consider `phone: "+8801406512541"`.
- WhatsApp needs the country code and no leading 0 (`8801406512541`). Confirm this is your correct number.

## Order form (read this)
GitHub Pages cannot receive form data. **Until you connect a form service, "Send request" sends nothing.** It shows WhatsApp and Email buttons with the request pre-filled, so no request is lost.

To connect one (Formspree free tier as an example): create a form at formspree.io, copy its URL (`https://formspree.io/f/xxxx`), paste it into `SITE.formEndpoint` in `js/main.js`, and confirm the notification email. Any service that accepts a JSON POST works.

## Future AI chatbot
Never put an API key in these files: everything on GitHub Pages is public. Keep the key as a secret in a serverless function (Cloudflare Workers, Netlify Functions or Vercel Functions). The website only calls that function's URL with `fetch()`. Restrict the function to your site's origin, add rate limits, and tell the bot not to invent prices. An empty `<div id="chatbot-root">` in `index.html` is where the chat widget will mount.

## Not included yet
Separate pages (`projects.html` etc.), a Real Estate demo, an Open Graph preview image.


## Firebase login and user profiles

The website's `auth.js` supports Google sign-in, passwordless email-link sign-in, and a signed-in account panel. Users can edit their display name and upload, replace, or remove their profile picture. Profile documents are stored in Firestore at `users/{uid}`; custom profile images are stored at `users/{uid}/profile/avatar` in Firebase Storage.

Before these features can work in production, complete these one-time Firebase Console steps for project `project-prototype-1-2d8d2`:

1. In **Authentication → Sign-in method**, enable **Google** and **Email link (passwordless sign-in)**.
2. In **Authentication → Settings → Authorized domains**, make sure `abidemon0242.github.io` is listed.
3. Create a **Cloud Firestore** database.
4. Create a **Firebase Storage** bucket.
5. Publish the repository's `firestore.rules` in Firestore → Rules, and `storage.rules` in Storage → Rules. Do not leave test-mode rules enabled.

The rules restrict each user to their own `users/{uid}` profile document and profile-image folder. Profile uploads are limited to PNG, JPG/JPEG, or WebP images up to 5 MB. The site is static GitHub Pages, so Firebase services and their security rules are configured separately in the Firebase Console; committing these rule files to GitHub does not publish them automatically.

Email-link sign-in uses the current website URL as its completion URL. Test the full email-link flow on the deployed HTTPS website after enabling the providers and authorized domain.
