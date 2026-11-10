## tinyShield

[![jsdelivr stat](https://data.jsdelivr.com/v1/package/npm/@filteringdev/tinyshield/badge)](https://www.jsdelivr.com/package/npm/@filteringdev/tinyshield)

[Korean](./README.ko.md) [Japanese](./README.ja.md)

tinyShield blocks Ad-Shield reinstable advertisements and bypasses Ad-Shield's virtual integrity layer.

tinyShield userscript is managed by the adblock community.

If you need help or have any questions during installation or usage, please use GitHub Discussions.  
If you believe this userscript is causing issues while in use, please use GitHub Issues.  

> [!IMPORTANT]
> tinyShield userscript maintainer recommends using one of the following adblockers with tinyShield userscript:
> - AdGuard
> - uBlock Origin
>
> Supporting other adblockers is not guaranteed and even if requested, it may be rejected.

## Receive Update Notifications via Discord/Telegram

[Discord Bot](https://discord.com/oauth2/authorize?client_id=1543001264776814723) or Telegram `@filteringdev_noti_bot` can be used to receive update notifications.

## Start

### Quick Start
Just click the following URL to detect this userscript.

https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js

### Domain Group Subscription Guide (Apple Safari Extension Only)
> [!IMPORTANT]
> The grouped subscription URLs below are only for Apple Safari Extension users.
> If you use AdGuard's userscript support, keep using the default URL (`dist/tinyShield.user.js`).

- Build output structure:
    - Default script: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js`
    - Domain-grouped scripts: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/<initial>/tinyShield-<domain-group>.user.js`
- How to choose the subscription file for your domain group:
    1. Open `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/`.
    2. Open the `<initial>/` subdirectory that matches the first character of your target grouped file name.
    3. Select one `tinyShield-<domain-group>.user.js` file for the website you use.
    4. Open that file once and confirm its metadata `@match` includes your target domain.
    5. Subscribe to that exact grouped file URL in your Safari userscript extension.

This domain-group split is intended to reduce the impact scope of https://github.com/FilteringDev/tinyShield/issues/38 as much as possible.

### How to install
**Violentmonkey** is recommended for Firefox and Chromium-based browsers. **wBlock** is recommended for Safari on macOS, iOS, and iPadOS. **Tampermonkey is not recommended.**

- [Violentmonkey](https://violentmonkey.github.io/get-it/) (Recommended) - Firefox and Chromium-based browser extension
    1. Open `Dashboard`.
    2. Click `New` button.
    3. Click `Install from URL` button.
    4. Input the following URL:
    ```
    https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
    ```
    5. Click `OK` button.
    6. Confirm metadata of the userscript and click `Confirm installation`.
    7. Return to a tab opening the website protected by Ad-Shield and reload the tab by pressing <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd> or clicking the reload button.

    <details>
    <summary>Compatibility Table</summary>

    Browser Extension | License | Compatibility | Recommendation
    ----------------- | ------ | ------------- | --------------
    [Tampermonkey](https://www.tampermonkey.net/) | Proprietary (Donationware) | ✔ | Not recommended
    [Greasemonkey](https://www.greasespot.net/) | MIT | ✘ | Not recommended
    [Violentmonkey](https://violentmonkey.github.io/get-it/) | MIT | ✔ | Recommended

    </details>
    
- AdGuard for Windows
    1. Click `Settings`.
    2. Click `Extensions`.
    3. Click `Add extension`.
    4. Input the following URL:
        ```
        https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
        ```
    5. Click `Install`.
    6. Confirm metadata of the userscript and click `Install`.
    7. Return to a tab opening the website protected by Ad-Shield and reload the tab by pressing <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd> or clicking the reload button.


- AdGuard for Android
    1. Go to Settings -> Extension.
    2. Touch `New extension`.
    3. Input the following URL:
        ```
        https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
        ```
    4. Touch `Next`.
    5. Confirm metadata of the userscript and touch `Add`.
    6. Return to a tab opening the website protected by Ad-Shield and reload the tab by touching the reload button.


- [wBlock](https://apps.apple.com/app/wblock/id6746388723) (Recommended) - Safari on macOS, iOS, and iPadOS

    <details>
    <summary>Installing with wBlock in Safari</summary>

    1. Install and open wBlock, then follow its initial setup instructions.
    2. Enable **wBlock Scripts** in Safari's extension settings and allow it to run on all websites.
        - macOS: `Safari` > `Settings` > `Extensions`
        - iOS/iPadOS 18+: `Settings` > `Apps` > `Safari` > `Extensions`
        - iOS/iPadOS 17 and older: `Settings` > `Safari` > `Extensions`
    3. Follow the domain group subscription guide above to choose your grouped script URL (`tinyShield-<domain-group>.user.js`) and check its `@match` metadata.
    4. In the wBlock app's `Userscripts` screen, disable the built-in tinyShield entry to avoid running it alongside the grouped script.
    5. On the same screen, open the add menu (`+`) > `Userscript` > `URL` > `Single URL` and enter the grouped script URL. Do not use the full script URL from Quick Start.
    6. Select `Next`, review the metadata, then select `Add` to add and enable the grouped script.
    7. Return to your target website's tab in Safari and reload it.

    </details>
