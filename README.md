# Cookie Permission

A browser extension that asks before a site can store cookies, just like the permission prompt for notifications or location.

Browsers let you block cookies by default and add exceptions, but adding an exception means digging through settings. Cookie Permission turns that into a prompt: when a site you visit tries to store cookies, you choose what to allow, right there on the page.

## Features

- **A prompt when a site wants cookies**, with three choices:
  - **Allow:** the site can store cookies.
  - **Allow until browser closes:** cookies are kept for this session only.
  - **Block:** the site can't store cookies.
- **Site-wide decisions:** a choice for `example.com` also covers `accounts.example.com` and other subdomains.
- **Real browser rules:** choices are saved as the browser's own cookie settings for the site.
- **Change your mind anytime:** click the extension icon to change a site's permission, or forget your choice to be asked again.
- **A red `?` badge** on the icon when the current site is waiting for a decision.
- **Follows your language and reading direction:** available in 22 languages, with right-to-left support for Arabic, Hebrew and Persian.

Works in Chrome, Edge and other Chromium-based browsers (version 110 or later).

## Installation

**Chrome Web Store:** coming soon.

**From source:**

1. Download or clone this repository.
2. Open `chrome://extensions` (or `edge://extensions` in Edge).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the repository folder.

## Setup

Cookie Permission only asks about sites where cookies are blocked, so block cookies by default first:

- **Chrome:** Settings › Privacy and security › Site settings › On-device site data › **Don't allow sites to save data on your device**
- **Edge:** Settings › Cookies and site permissions › Manage and delete cookies and site data › turn off **Allow sites to save and read cookie data**

Menu names can vary between browser versions.

## Good to know

- The prompt appears when a site sets cookies from its own server. Sites that only store data through scripts won't trigger it; click the extension icon to set their permission yourself.
- Only the site in the address bar is asked about. Third-party cookies aren't handled by the prompt.
- Rules set by the extension are removed if you uninstall or disable it.
- In Edge, the cookie exceptions list in settings may not update until you restart the browser. Your choice still takes effect immediately.

## Privacy

All data stays on your device. The extension has no servers, analytics or tracking, and never reads cookie contents or page content. See the full [privacy policy](https://allanveloso.github.io/cookie-permission/privacy).

## Languages

English, Arabic, Chinese (Simplified and Traditional), Dutch, French, German, Hebrew, Hindi, Indonesian, Italian, Japanese, Korean, Persian, Polish, Portuguese (Brazil), Russian, Spanish, Thai, Turkish, Ukrainian and Vietnamese.

Found a translation that doesn't sound natural, or want to add a language? Translations live in `_locales/<language-code>/messages.json`. Copy the `en` folder, translate the `message` values (keeping `$SITE$` where the site name should appear), and open a pull request.

## Contributing

Bug reports and suggestions are welcome in [Issues](https://github.com/allanveloso/cookie-permission/issues).

## License

See [LICENSE](LICENSE).
