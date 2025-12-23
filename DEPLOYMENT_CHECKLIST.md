# 🔧 Deployment Fix Checklist

## ✅ Fixed in Code

1. **auth-client.js** - Now correctly points to backend HOST
2. **Middleware** - Added detailed logging for debugging
3. **CORS** - Already configured to allow Vercel frontend
4. **Auth config** - trustedOrigins includes Vercel URL

## ⚠️ CRITICAL: Environment Variables

### Render (Backend) - https://chat-app-0l34.onrender.com

**Must have these exact values:**

```env
ORIGIN=https://chat-app-lime-delta.vercel.app
VITE_SERVER_URL=https://chat-app-0l34.onrender.com
NODE_ENV=production
MONGODB_URL=<your-mongodb-connection-string>
BETTER_AUTH_SECRET=<long-random-string-min-32-chars>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Vercel (Frontend) - https://chat-app-lime-delta.vercel.app

**Must have:**

```env
VITE_SERVER_URL=https://chat-app-0l34.onrender.com
```

## 🚀 Deployment Steps

1. **Commit & Push Changes**
   ```bash
   git add .
   git commit -m "Fix: Auth client points to backend, improve logging"
   git push origin main
   ```

2. **Verify Render Environment Variables**
   - Go to Render Dashboard → Your Service
   - Check Environment tab
   - **Verify ORIGIN is set to your Vercel URL** (not localhost!)
   - **Verify VITE_SERVER_URL is set to your Render URL**
   - **Verify NODE_ENV=production**

3. **Verify Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - **Verify VITE_SERVER_URL is set to your Render URL**

4. **Redeploy Backend (Render)**
   - Manual Deploy or wait for auto-deploy from git push

5. **Redeploy Frontend (Vercel)**
   - Will auto-deploy from git push

6. **Clear Browser Data**
   - Open DevTools (F12)
   - Go to Application/Storage tab
   - Clear all cookies and local storage
   - Close and reopen browser

7. **Test Login Flow**
   - Try logging in
   - Check browser DevTools Network tab
   - Login should call: `https://chat-app-0l34.onrender.com/api/auth/sign-in/email`
   - NOT: `https://chat-app-lime-delta.vercel.app/api/auth/...`

8. **Check Server Logs**
   - Go to Render Dashboard → Your Service → Logs
   - Look for the detailed middleware logs after login
   - Should show cookies being received

## 🐛 Debugging

If still getting 401 errors, check the server logs for:

```
=== Auth Middleware Debug ===
Request URL: /api/contacts/get-contacts-for-dm
Cookies: { ... should see better_auth_session cookies here ... }
Session result: { user: { ... } }
```

**If cookies are empty:** Cross-origin cookie issue
**If session is null:** Auth client still pointing to wrong URL

## 🔍 Common Issues

1. **Cookies not being sent**
   - Ensure `credentials: "include"` in api-client.js ✅
   - Ensure `withCredentials: true` in axios ✅
   - Ensure `sameSite: "none", secure: true` in auth config ✅

2. **CORS errors**
   - Ensure ORIGIN env var on Render matches Vercel URL
   - Ensure trustedOrigins in auth.js includes both URLs ✅

3. **Wrong auth endpoint**
   - Check Network tab: auth calls should go to Render, not Vercel
   - Fixed: auth-client.js now uses HOST ✅

4. **Environment variables not updated**
   - Most common issue!
   - Double-check both Render and Vercel dashboards
