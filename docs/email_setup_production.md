# Production Email Configuration Guide
## Client: Les Immeubles QC

Since the website is currently in a local testing environment, email delivery uses a **local logging fallback (`submissions.log`)** to capture form details instantly without requiring active mail servers.

When shipping the site to the **production server**, follow this guide to set up secure, instant email delivery directly to the client's inbox.

---

## 🛠️ Step 1: Remove the Local Logging Hook (Optional but Recommended)
Before uploading the final theme to production, you can remove the local testing hook from your theme's `functions.php` file to keep the codebase clean.

Open **`functions.php`** and remove this block at the very bottom:
```php
// Log Contact Form 7 submissions locally for offline MAMP testing
add_action('wpcf7_before_send_mail', function ($contact_form, &$abort, $submission) {
    ...
}, 10, 3);
```

---

## 🔌 Step 2: Configure a SMTP Mailer (WP Mail SMTP)
To ensure 100% email deliverability and prevent emails from landing in spam folders, you must route your WordPress mail (`wp_mail()`) through a professional SMTP provider instead of the default web host.

### A. If using Google Workspace / GSuite (Best for `@shortkut.ca` or client domain):
1. Go to **WP Mail SMTP > Settings** in the production dashboard.
2. Select **Google / Gmail** as the mailer.
3. Scroll down and copy the **Authorized Redirect URI** provided by the plugin.
4. Open the **[Google Cloud Console](https://console.cloud.google.com/)**:
   - Create a new project named *Les Immeubles QC Website*.
   - Go to **APIs & Services > Library**, search for **Gmail API**, and click **Enable**.
   - Go to **OAuth consent screen**, set User Type to **External**, enter the app details, and set publishing status to **In Production**.
   - Go to **Credentials > Create Credentials > OAuth client ID**.
   - Select **Web application** as the type.
   - Paste the copied redirect URI into the **Authorized redirect URIs** field.
   - Click **Create** and copy your **Client ID** and **Client Secret**.
5. Paste these credentials back into **WP Mail SMTP** settings and click **Save Settings**.
6. Click **Allow plugin to send emails using your Google Account** and sign in.

### B. If using standard Hosting Email (cPanel / Other SMTP):
1. Select **Other SMTP** as the mailer.
2. Input the client's standard mail server credentials:
   - **SMTP Host**: (e.g. `mail.lesimmeublesqc.ca` or `smtp.secureserver.net`)
   - **Encryption**: `SSL` (Port `465`) or `TLS` (Port `587`)
   - **SMTP Username**: The custom outbound email (e.g. `info@lesimmeublesqc.ca`)
   - **SMTP Password**: The email account password.
3. Click **Save Settings**.

---

## ✉️ Step 3: Configure Contact Form 7 Notifications
The contact form is managed by **Contact Form 7** under Post ID `26` (*"Planifiez une visite"*).

1. Go to **Contact > Contact Forms** in the production dashboard and click **Edit** on the *Planifiez une visite* form.
2. Go to the **Mail** tab.
3. Set the following standard parameters:
   - **To**: `lesimmeublesqc@gmail.com` (Or the client's desired contact inbox).
   - **From**: `Les Immeubles QC <noreply@lesimmeublesqc.ca>` (This **MUST** match the authenticated SMTP "From Email" domain configured in WP Mail SMTP, otherwise the mailer will block it as spoofing!).
   - **Subject**: `Nouvelle demande de visite : [your-name]`
   - **Additional Headers**: `Reply-To: [your-email]`
   - **Message Body**:
     ```text
     Bonjour,

     Une nouvelle demande de visite a été soumise depuis le site Les Immeubles QC :

     Nom complet : [your-name]
     Courriel : [your-email]
     Téléphone : [your-tel]
     Message : [your-message]

     Cette demande a été générée automatiquement.
     ```
4. Click **Save**.

---

## 🧪 Step 4: Run a Delivery Test
1. Go to **WP Mail SMTP > Tools** in the dashboard.
2. Select the **Email Test** tab.
3. Enter your personal email address in the **Send To** field.
4. Click **Send Email** and verify it arrives in your inbox within 10 seconds!
