# Privacy Policy for Cookie Permission

**Effective date:** September 23, 2026

Cookie Permission ("the extension") is a browser extension that lets you decide, site by site, whether a website may store cookies. This policy explains what data the extension handles, how it is used, and how you can delete it.

## Summary

The extension handles a small amount of browsing information, only to provide its single purpose. All of it stays on your device. Nothing is sent to the developer or to anyone else.

## What data the extension handles

**Site names you make a choice for.** When you choose Allow, Allow until browser closes, or Block, the extension saves the site's name (for example, `example.com`) and your choice. This is stored on your device using the browser's extension storage, and applied as the browser's cookie setting for that site.

**The address of the current tab.** The extension reads the address of the page you are viewing to determine which site a decision applies to and whether to show the prompt.

**Whether a site tries to set cookies.** The extension checks the response headers of the site in the address bar to detect whether it is trying to set cookies. It only checks that a cookie is being set. It never reads cookie contents, page content, form data, or any other part of the response, and it does not record which pages you visit.

**Temporary tab information.** To avoid asking you again in the same tab after you close the prompt, the extension keeps a temporary note linking a tab to a site. This is stored in session storage and is erased when you close the browser.

## How the data is used

This data is used only to show the cookie prompt and apply your decisions. It is not used for analytics, advertising, profiling, or any other purpose.

## Data sharing

The extension does not sell, transfer, or share any data with the developer or third parties. It has no servers, accounts, analytics, or tracking, and makes no network requests of its own.

## Data retention and deletion

Your choices are kept until you change or remove them. You can:

- Click the extension icon on a site and choose **Forget my choice for this site** to delete that site's decision.
- Uninstall the extension to delete all of its stored data and cookie rules.

## Permissions

- **contentSettings:** to apply your choice as the browser's cookie setting for a site.
- **webRequest:** to detect, without blocking or changing anything, when a site tries to set cookies.
- **scripting:** to show the permission prompt on the page.
- **storage:** to save your decisions on your device.
- **Access to websites:** because any site you visit may try to store cookies.

## Limited Use disclosure

The use of information received from browser APIs by Cookie Permission adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/), including the Limited Use requirements. Data is used only to provide the extension's single purpose, is never transferred to third parties, is never used for advertising, and is never read by humans.

## Children

The extension does not knowingly collect personal information from anyone, including children.

## Changes to this policy

If this policy changes, the updated version will be posted on this page with a new effective date.

## Contact

Questions about this policy: open an issue at [github.com/allanveloso/cookie-permission/issues](https://github.com/allanveloso/cookie-permission/issues).
