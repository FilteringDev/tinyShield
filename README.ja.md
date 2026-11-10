## tinyShield

[![jsdelivr stat](https://data.jsdelivr.com/v1/package/npm/@filteringdev/tinyshield/badge)](https://www.jsdelivr.com/package/npm/@filteringdev/tinyshield)

[English](./README.md) [Korean](./README.ko.md)

tinyShieldは、Ad-Shieldで保護された広告のブロックと仮想整合性レイヤーのバイパスをします。

tinyShieldスクリプトは、Adblockコミュニティによって管理されています。

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
    - ドメイングループ別スクリプト: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/<initial>/tinyShield-<domain-group>.user.js`
- ドメイングループごとの購読ファイル選択手順:
    1. `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/` を開きます。
    2. 対象グループのファイル名先頭文字に対応する `<initial>/` サブディレクトリを開きます。
    3. 利用しているサイトに対応する `tinyShield-<domain-group>.user.js` を1つ選びます。
    4. そのファイルを一度開き、メタデータ `@match` に対象ドメインが含まれていることを確認します。
    5. Safari のユーザースクリプト拡張には、そのファイルURLをそのまま購読URLとして登録します。

このドメイングループ分割は、https://github.com/FilteringDev/tinyShield/issues/38 の影響範囲を可能な限り最小化することを目的としています。

### インストールのやり方
Firefox および Chromium ベースのブラウザーでは **Violentmonkey** を、macOS・iOS・iPadOS の Safari では **wBlock** を推奨します。**Tampermonkey は推奨しません。**

- [Violentmonkey](https://violentmonkey.github.io/get-it/) (推奨) - Firefox および Chromium ベースのブラウザー拡張
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

    <details>
    <summary>互換性のテーブル</summary>

    ブラウザー拡張 | ライセンス | 互換性 | 推奨状況
    ----------------- | ------ | ------- | -------
    [Tampermonkey](https://www.tampermonkey.net/) | プロプライエタリ (ドネーションウェア) | ✔ | 非推奨
    [Greasemonkey](https://www.greasespot.net/) | MIT | ✘ | 非推奨
    [Violentmonkey](https://violentmonkey.github.io/get-it/) | MIT | ✔ | 推奨

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


- [wBlock](https://apps.apple.com/app/wblock/id6746388723) (推奨) - macOS・iOS・iPadOS の Safari

    <details>
    <summary>Safari で wBlock を使ってインストールする</summary>

    1. wBlock アプリをインストールして起動し、初期設定の案内に従います。
    2. Safari の拡張機能設定で **wBlock Scripts** を有効にし、すべての Web サイトでの実行を許可します。
        - macOS: `Safari` > `設定` > `機能拡張`
        - iOS・iPadOS 18 以降: `設定` > `アプリ` > `Safari` > `機能拡張`
        - iOS・iPadOS 17 以前: `設定` > `Safari` > `機能拡張`
    3. 上記のドメイングループ購読ガイドに従ってグループスクリプトURL (`tinyShield-<domain-group>.user.js`) を選択し、`@match` を確認します。
    4. wBlock アプリの `Userscripts` 画面で、標準搭載の tinyShield を無効にしてグループスクリプトとの重複実行を防ぎます。
    5. 同じ画面の追加メニュー (`+`) > `Userscript` > `URL` > `Single URL` を選択し、グループスクリプトURLを入力します。クイックスタートの全体スクリプトURLは使用しないでください。
    6. `Next` を選択してメタデータを確認し、`Add` を選択してグループスクリプトを追加・有効化します。
    7. Safari で対象サイトのタブに戻り、再読み込みします。

    </details>
