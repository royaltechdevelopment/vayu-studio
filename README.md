# Vayu Studio

Same content as the old `vayu-web` repo, rebuilt with a **new visual style**. Static frontend + Supabase (email/password **and Discord OAuth**) + a role-based admin panel.

> The original repo at `/home/runner/vayu-web` is untouched. This project lives at `/home/runner/vayu-studio`.

## What's included

- **Pages:** Home, About, Team, Tutorials, Command Guide, Commands, Links, Files, FAQ, Contact, Login, Register, Admin.
- **Design:** Obsidian background with acid-lime/violet accents, Space Grotesk headings, dot-grid layout, fully responsive. This replaces the old cyan-glass/video-background style.
- **Auth:** Email/password + **Discord login** through Supabase Auth.
- **Roles:** `user`, `admin`, `owner`. New signups start as `user`. Put your Discord user ID in **Admin → Site content → `site_settings` → `ADMIN_DISCORD_ID`** (Supabase) and that account becomes `owner` on login.
- **Admin panel:** Overview, form-based content editor (every page and list is editable — add, remove, reorder items), Users & roles, Contact inbox, plus a raw JSON tab for edge cases.
- **Real auth only:** There is no demo mode. Until Supabase is configured, member pages show a **Setup required** screen and no fake member access is possible.
- **Discord presence:** Home keeps the Discord widget embed. Team shows a live member list fetched from Discord's public widget API, without the embed.
- **Nav CTA:** A **Join Vayu Empire Discord** button is always available in the header nav and mobile menu.
- **Tutorials sync:** Videos come live from the channel RSS feed using `YOUTUBE_CHANNEL_ID` from Supabase `site_settings`; `js/data.js` holds the local defaults.

## Running locally

No build step is required. Serve the folder with any static server:

```bash
cd /home/runner/vayu-studio
python3 -m http.server 8000
# open http://localhost:8000
```

> Avoid `file://` — it can break the Discord OAuth redirect. Always use a local server.

## Supabase setup (5 minutes)

A copy-paste, deployed version of this guide — with the full Discord OAuth steps and troubleshooting — is in [SETUP.md](SETUP.md).

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor → New query**, paste the full contents of `supabase/schema.sql` and run it.
3. In Project Settings → API, copy the **Project URL** and **anon public key**.
4. Add them to `js/config.js`:

```js
SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
SUPABASE_ANON_KEY: 'eyJ...'
```

Everything else is stored in Supabase:

- **Auth → URL Configuration:** Site URL + Redirect URLs (replaces `SITE_URL`).
- **Auth → Providers → Discord:** Client ID/Secret (server side).
- **Table `site_content`, key `site_settings`:** admin Discord ID, owner email, social links, YouTube channel and Discord widget/chat IDs. Seeded by `schema.sql`; edit in **Admin → Site content** (defaults in `js/data.js`).

The full annotated setup is in [SETUP.md](SETUP.md).

### Enabling Discord login

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) → New Application → OAuth2.
2. Copy the Client ID and Client Secret.
3. Under **Redirects**, add:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
4. In Supabase, go to **Authentication → Providers → Discord**: enable it, paste the ID/Secret, and use scopes `identify email`.
5. In Supabase, go to **Authentication → URL Configuration** and add `http://localhost:8000` (plus your production domain).
6. **Continue with Discord** on the login/register pages will now work. When a Discord user signs in for the first time, the trigger creates their `profiles` row.

### Becoming an admin

1. Paste your Discord **user ID** (numbers only) into `site_settings → ADMIN_DISCORD_ID` in **Admin → Site content** (or edit the seed row in `supabase/schema.sql` before running it).
2. Log in with **Continue with Discord** using that same Discord account.
3. The app calls `claim_admin_by_discord`, which checks your own Discord identity in the database and sets your role to `owner`. The **Admin** button then appears in the header.

Only that Discord account can claim owner. Another user cannot take admin by pasting your ID, because the database verifies their own linked Discord identity.

`admin@vayuplayz.com` still works as a fallback for email signups, and you can promote any user with:

```sql
update public.profiles set role = 'admin' where email = 'user@example.com';
```

You can also change roles from the admin panel's **Users & roles** tab (uses a secure RPC).

### Mandatory Discord link after email login

Accounts that log in with email/password are shown a full-screen **Connect your Discord account** dialog immediately after login. It has no close button, cannot be dismissed by clicking outside or pressing Escape, and cannot be skipped. The only choices are **Connect Discord** (starts Supabase `linkIdentity`) or **Logout instead**.

The dialog disappears only after Supabase confirms a Discord identity is linked to that user. Discord logins never see it.

If linking fails because the Discord email does not match the account email, enable **Allow manual linking** in Supabase Authentication settings, or link with a Discord account using the same email address.

## Page access

Without logging in, only **Home, Team, Tutorials, About and Contact** are visible. Everything else — Commands, Command Guide, Links, Files, FAQ and Admin — unlocks after login.

- In real mode, opening a gated page redirects to `login?redirect=...`; after login you return to that page.
- If Supabase is not configured, gated pages show a **Setup required** screen instead of any member UI.
- The logged-out nav shows 5 public links; after login the first link becomes **Dashboard** (`commands`) and the 5 member links are added.

## Clean URLs

All internal links use extensionless paths such as `/team`, `/commands` and `/login`. The `.html` files stay on disk. `vercel.json` enables `cleanUrls`, so Vercel serves `/team` from `team.html` and redirects `/team.html` to `/team`. For local preview use `python3 serve.py` instead of `python3 -m http.server`, because Python's default server does not resolve extensionless paths.

## Content editing

In Admin → **Site content**, pick a section chip (Home, About, Team, Tutorials, Command guide, Command library, Quick links, Files & downloads, FAQ, Site settings) and edit it with normal form fields. Lists (team members, commands, guide commands, FAQ questions, file details, features, steps…) have **Add / move up / move down / remove** controls, so nothing needs hand-written JSON. Image fields show a live thumbnail. Unsaved changes are flagged, and saving publishes instantly.

`site_settings` holds the admin Discord ID, owner email, social links and widget/channel IDs. Defaults live in `js/data.js` and are used as the fallback when Supabase has no row for a section. **Advanced JSON** keeps the old raw editor for edge cases.

## Files

```
vayu-studio/
├── index.html, about.html, …        # pages
├── SETUP.md                          # deployed setup guide (Discord auth included)
├── css/styles.css                    # new design system
├── css/all.min.css + fonts/          # Font Awesome (from the old repo)
├── images/                           # from the old repo (including file previews)
├── codes/                            # downloadable ZIP files (opened from the View Details modal)
├── js/
│   ├── config.js                     # 👈 credentials go here
│   ├── supabase.js                   # client + Discord OAuth helper
│   ├── data.js                       # default content
│   ├── app.js                        # shared helpers
│   ├── layout.js                     # header/footer
│   ├── pages.js                      # page renderers + tools
│   └── admin.js                      # admin panel
└── supabase/schema.sql               # tables + RLS + triggers + admin RPC
```

## Security note

- The anon key is safe to expose in the browser (RLS protects the data). **Never put the service role key in the frontend.**
- The old token pasted in chat should be revoked on GitHub.
