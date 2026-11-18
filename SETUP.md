# Vayu Studio — setup guide (Discord login included)

This file is deployed with the site, so the **Setup required** screens can link to it on Vercel. No secrets are stored here.

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the full contents of `supabase/schema.sql`, and run it.
3. Open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
4. Paste them into `js/config.js`:

```js
SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
SUPABASE_ANON_KEY: 'eyJ...',
SITE_URL: 'https://YOUR_PROJECT.vercel.app',
ADMIN_DISCORD_ID: '123456789012345678'
```

`SITE_URL` is optional. Leave it empty to use the current browser URL.

## 2. Discord application (for Discord login)

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**. Name it `Vayu Playz`.
2. Go to **OAuth2**. Copy the **Client ID** and **Client Secret**.
3. Under **Redirects**, click **Add Redirect** and paste this exact URL:

```text
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

Replace `YOUR_PROJECT_ID` with your Supabase project ref. No trailing slash. No Vercel URL here.

4. Under **Scopes**, only `identify` and `email` are needed. Do not enable `guilds.join` — logging in does not auto-join the server.

## 3. Supabase Discord provider

1. Go to **Authentication → Providers → Discord**.
2. Turn it **On**.
3. Paste the **Client ID** and **Client Secret** from step 2.
4. Keep the scopes as `identify email`.
5. Click **Save**.

> The Client Secret must stay in Supabase. Never paste it into `js/config.js`, the repo, or this guide. The browser anon key is public by design; the Discord secret is not.

## 4. Supabase URLs (most common mistake)

Go to **Authentication → URL Configuration**:

| Field | Local | Vercel |
|---|---|---|
| Site URL | `http://localhost:8000` | `https://YOUR_PROJECT.vercel.app` |
| Redirect URLs | `http://localhost:8000/**` | `https://YOUR_PROJECT.vercel.app/**` |

Add both if you test locally and in production. If a redirect URL is missing, Discord will show `redirect_url not allowed`.

## 5. How Discord login behaves

### Direct Discord login

On `/login` or `/register`, click **Continue with Discord**.

```text
Site → Supabase → Discord authorize → Supabase → Site (signed in)
```

The user approves `identify + email`, then lands back on the site with a real Supabase session. No extra popup appears because the Discord identity is already linked.

### Email/password login

Email login succeeds, then a full-screen **Connect your Discord account** dialog appears. It cannot be skipped or dismissed. Clicking **Connect Discord** starts Supabase `linkIdentity`, redirects to Discord, and returns to the site. The dialog closes automatically once Supabase confirms the Discord identity.

If the Discord email differs from the account email, open **Authentication → Providers → Discord** in Supabase and enable **Allow manual linking**, or use a Discord account with the same email.

## 6. Admin/owner by Discord ID

1. In Discord, enable **User Settings → Advanced → Developer Mode**.
2. Right-click your own avatar → **Copy ID** (numbers only).
3. Paste it into `ADMIN_DISCORD_ID` in `js/config.js`.
4. Log in with **Continue with Discord** using that same account.
5. The app calls `claim_admin_by_discord`. Supabase checks **your own linked Discord identity** against the configured ID and sets your role to `owner`.

Another user cannot become owner by pasting your ID, because the database verifies their own identity. `admin@vayuplayz.com` remains the fallback email owner.

## 7. Quick troubleshooting

| Problem | Fix |
|---|---|
| `redirect_url not allowed` | Add the exact Vercel URL with `/**` to Supabase Redirect URLs. |
| `invalid_client` / `unauthorized_client` | Client ID/Secret mismatch, or Discord provider is off in Supabase. |
| Discord callback 404 | Discord redirect must be `https://PROJECT.supabase.co/auth/v1/callback`, not the Vercel URL. |
| Link popup keeps coming back | Identity not linked yet; enable **Allow manual linking** if emails differ. |
| Admin button missing | `ADMIN_DISCORD_ID` must match the Discord account actually used to log in, and `schema.sql` must be run. |
| Still showing **Setup required** | Placeholder URL/key still in `js/config.js`, or the Supabase JS CDN did not load. |

## 8. After changing config

Commit and push. Vercel redeploys automatically. Content edited in the admin panel is instant and needs no redeploy.
