## tinyShield

[![jsdelivr stat](https://data.jsdelivr.com/v1/package/npm/@list-kr/tinyshield/badge)](https://www.jsdelivr.com/package/npm/@list-kr/tinyshield)

tinyShield blocks Ad-Shield reinstable advertisements and bypasses Ad-Shield's virtual integrity layer.

tinyShield userscript is managed by the adblock community and AdGuard.

> [!IMPORTANT]
> tinyShield userscript maintainer recommends using one of the following adblockers with tinyShield userscript:
> - AdGuard
> - uBlock Origin
> - Brave web browser's Shield
> - AdBlock Plus
> - Ghostery
>
> Supporting other adblockers is not guaranteed.

### Quick Start
Just click the following URL to detect this userscript.

https://cdn.jsdelivr.net/npm/@list-kr/tinyshield@latest/dist/tinyShield.user.js

### How to install
- [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) (Recommended if you cannot access AdGuard Premium) - Browser extension
    1. Open `Dashboard`.
    2. Click `New` button.
    3. Click `Install from URL` button.
    4. Input the following URL:
    ```
    https://cdn.jsdelivr.net/npm/@list-kr/tinyshield@latest/dist/tinyShield.user.js
    ```
    5. Click `OK` button.
    6. Confirm metadata of the userscript and click `Confirm installation`.
    7. Return to a tab opening the website protected by Ad-Shield and reload the tab by pressing <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd> or clicking the reload button.

- [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) - Browser extension
    1. Open settings of Tampermonkey.
    2. Go to `Utilities` tab.
    3. Input the following URL into `Install from URL`:
        ```
        https://cdn.jsdelivr.net/npm/@list-kr/tinyshield@latest/dist/tinyShield.user.js
        ```
    4. Click `Install` button.
    5. Confirm metadata of the userscript and click `Install`.
    6. Return to a tab opening the website protected by Ad-Shield and reload the tab by pressing <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd> or clicking the reload button.

    <details>
    <summary>Compatibility Table</summary>

    Browser Extension | License | Status
    ----------------- | ------ | -------
    [Tampermonkey](https://www.tampermonkey.net/) | Proprietary (Donationware) | ✔
    [Greasemonkey](https://www.greasespot.net/) | MIT | ✘
    [Violentmonkey](https://violentmonkey.github.io/) | MIT | ✔

    </details>
    
- AdGuard for Windows
    1. Click `Settings`.
    2. Click `Extensions`.
    3. Click `Add extension`.
    4. Input the following URL:
        ```
        https://cdn.jsdelivr.net/npm/@list-kr/tinyshield@latest/dist/tinyShield.user.js
        ```
    5. Click `Install`.
    6. Confirm metadata of the userscript and click `Install`.
    7. Return to a tab opening the website protected by Ad-Shield and reload the tab by pressing <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd> or clicking the reload button.


- AdGuard for Android
    1. Go to Settings -> Extension.
    2. Touch `New extension`.
    3. Input the following URL:
        ```
        https://cdn.jsdelivr.net/npm/@list-kr/tinyshield@latest/dist/tinyShield.user.js
        ```
    4. Touch `Next`.
    5. Confirm metadata of the userscript and touch `Add`.
    6. Return to a tab opening the website protected by Ad-Shield and reload the tab by touching the reload button.


 - AdGuard for iOS

    Userscript is not supported currently on AdGuard for iOS.
    However, It will be supported in the future.[^1]
    
    Of course, you can use an alternative temporally.[^2][^3]

    <details>
    <summary>Detailed description for iOS users</summary>

    1. Install [**Usercripts**](https://apps.apple.com/us/app/userscripts/id1463298887) app
    2. Enable **Usercripts** extension in Safari settings
        * iOS 18+: `System settings` => `Apps` => `Safari` => `Extensions`
        * iOS 17 and older: `System settings` => `Safari` => `Extensions`
        Find **Usercripts**, enable it and allow `On other sites` permission
    4. Open the [tinyShield](https://cdn.jsdelivr.net/npm/@list-kr/tinyshield@latest/dist/tinyShield.user.js) userscript URL in browser
    5. Press the extensions icon in the address bar of Safari and select Userscripts 
    6. Tap to install
    7. In opened popup, scroll down and press Install button
    8. Done.

    </details>



[^1]: https://github.com/AdguardTeam/AdguardForiOS/issues/1542
[^2]: https://github.com/quoid/userscripts
[^3]: https://apps.apple.com/us/app/userscripts/id1463298887