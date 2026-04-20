## tinyShield

[![jsdelivr stat](https://data.jsdelivr.com/v1/package/npm/@filteringdev/tinyshield/badge)](https://www.jsdelivr.com/package/npm/@filteringdev/tinyshield)

[English](./README.md) [Korean](./README.ko.md)

tinyShieldは、Ad-Shieldで保護された広告のブロックと仮想整合性レイヤーのバイパスをします。

tinyShieldスクリプトは、AdblockコミュニティとAdGuardによって管理されています。

> [!IMPORTANT]
> tinyShieldユーザースクリプトのメンテナは、tinyShieldユーザースクリプトといずれかの広告ブロッカーを使用することを推奨します:
> - AdGuard
> - uBlock Origin
>
> 他の広告ブロッカーのサポートは保証されておらず、依頼があってもお断りする場合があります。

### クイックスタート
このユーザースクリプトを検出するには、次のURLをクリックしてください。

https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js

### ドメイングループ購読ガイド (Apple Safari Extension ユーザー専用)
> [!IMPORTANT]
> 以下のドメイングループ購読URLは Apple Safari Extension ユーザーのみ使用してください。
> AdGuard のユーザースクリプト機能を使う場合は、従来どおり基本URL (`dist/tinyShield.user.js`) を使用してください。

- ビルド出力のファイル構成:
    - 基本スクリプト: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js`
    - ドメイングループ別スクリプト: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/tinyShield-<domain-group>.user.js`
- ドメイングループごとの購読ファイル選択手順:
    1. `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/` を開きます。
    2. 利用しているサイトに対応する `tinyShield-<domain-group>.user.js` を1つ選びます。
    3. そのファイルを一度開き、メタデータ `@match` に対象ドメインが含まれていることを確認します。
    4. Safari のユーザースクリプト拡張には、そのファイルURLをそのまま購読URLとして登録します。

このドメイングループ分割は、issue #38 の影響範囲を可能な限り最小化することを目的としています。

### インストールのやり方
- [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) (AdGuard Premiumにアクセスできない場合に推奨) - ブラウザー拡張
    1. `ダッシュボード`を開きます。
    2. `新規作成`をクリックします。
    3. `URLからインストール`ボタンをクリックします。
    4. 以下のURLを入力します:
    ```
    https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
    ```
    5. `OK`ボタンをクリックします。
    6. メタデータの内容を確認後に`インストール`ボタンをクリックします。
    7. Ad-Shieldで保護されたWebサイトを開いているタブに戻り、<kbd>F5</kbd> または <kbd>Ctrl</kbd> + <kbd>R</kbd>を押すか、再読み込みボタンをクリックしてタブを再読み込みします。

- [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) - ブラウザー拡張
    1. Tampermonkeyの設定を開きます。
    2. `ユーティリティ`のタブを開きます。
    3. `URLからインストール`で以下のURLを入力します:
        ```
        https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
        ```
    4. `インストール`をクリック。
    5. メタデータとユーザースクリプトを確認後に`インストール`をクリック。
    6. Ad-Shieldで保護されたWebサイトを開いているタブに戻り、<kbd>F5</kbd> または <kbd>Ctrl</kbd> + <kbd>R</kbd>を押すか、再読み込みボタンをクリックしてタブを再読み込みします。

    <details>
    <summary>互換性のテーブル</summary>

    ブラウザー拡張 | ライセンス | ステータス
    ----------------- | ------ | -------
    [Tampermonkey](https://www.tampermonkey.net/) | プロプライエタリ (ドネーションウェア) | ✔
    [Greasemonkey](https://www.greasespot.net/) | MIT | ✘
    [Violentmonkey](https://violentmonkey.github.io/) | MIT | ✔

    </details>
    
- AdGuard for Windows
    1. `設定`をクリック。
    2. `拡張機能`をクリック。
    3. `拡張機能を追加する`をクリック。
    4. 以下のURLを入力:
        ```
        https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
        ```
    5. `インストール`をクリック。
    6. メタデータとユーザースクリプトを確認後に`インストール`をクリック。
    7. Ad-Shieldで保護されたWebサイトを開いているタブに戻り、<kbd>F5</kbd> または <kbd>Ctrl</kbd> + <kbd>R</kbd>を押すか、再読み込みボタンをクリックしてタブを再読み込みします。


- AdGuard for Android
    1. 設定 -> 拡張機能の項目を開く。
    2. `拡張機能を追加`をタッチ。
    3. 以下のURLを入力:
        ```
        https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
        ```
    4. `次へ`をタッチ。
    5. メタデータとユーザースクリプトを確認後に`追加`をタッチ。
    6. Ad-Shieldで保護されたWebサイトを開いているタブに戻り、再読み込みボタンをタッチでタブを再読み込みします。


 - AdGuard for iOS

    現在、AdGuard for iOSではユーザースクリプト機能はサポートされていません。
    ただし、将来的にサポートされる予定です。[^1]
    
    もちろんですが、一時的な代替手段を使用することも可能です。[^2][^3]

    <details>
    <summary>iOSユーザー向けの詳細な説明</summary>

    1. [**Usercripts**](https://apps.apple.com/us/app/userscripts/id1463298887)アプリをインストール
    2. **Usercripts**の拡張機能をSafariの設定から有効化します
        * iOS 18+: `システム設定` => `アプリ` => `Safari` => `拡張機能`
        * iOS 17 とそれ以下: `システム設定` => `Safari` => `拡張機能`
        **Usercripts**を見つけて有効化後に`他のサイト`の権限を許可します。
    4. `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/` をブラウザで開き、対象ドメインに対応するグループスクリプトURL (`tinyShield-<domain-group>.user.js`) を選択します。
    5. Safariのアドレスバーにある拡張機能アイコンを押して、Userscriptsを選択します。
    6. タップでインストールします。
    7. 開いたポップアップを下にスクロールでインストールボタンを押します。
    8. 完了です。

    </details>



[^1]: https://github.com/AdguardTeam/AdguardForiOS/issues/1542
[^2]: https://github.com/quoid/userscripts
[^3]: https://apps.apple.com/us/app/userscripts/id1463298887
