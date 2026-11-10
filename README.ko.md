## tinyShield

[![jsdelivr stat](https://data.jsdelivr.com/v1/package/npm/@filteringdev/tinyshield/badge)](https://www.jsdelivr.com/package/npm/@filteringdev/tinyshield)

[English](./README.md) [Japanese](./README.ja.md)

tinyShield 유저스크립트는 애드쉴드 재삽입되는 광고와 애드쉴드의 가상 무결성 레이어를 바이패스합니다

tinyShield 유저스크립트는 애드블록 커뮤니티에 의해 관리되고 있습니다.

설치/이용 과정에서 도움이 필요하시거나 궁금증이 있으시다면 GitHub Discussions를 이용해 주세요.
사용 도중에 해당 유저스크립트가 문제를 발생시킨다고 생각되시면 GitHub Issues를 이용해 주세요.

> [!IMPORTANT]
> tinyShield 유저스크립트 유지보수자는 tinyShield 유저스크립트와 함께 아래 애드블록들 중 하나를 사용하실 것을 권장합니다:
> - AdGuard
> - uBlock Origin
>
> 다른 애드블록 지원은 보장되지 않고 요청되어도 거부될 수 있습니다.

## Discord/Telegram로 업데이트 알림 받기

[Discord 봇](https://discord.com/oauth2/authorize?client_id=1543001264776814723) 또는 Telegram `@filteringdev_noti_bot`을 통해 업데이트 알림을 받을 수 있습니다.

## 시작

### 빠른 시작
아래 URL를 클릭하여 설치해주세요:

https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js

### 도메인 그룹 구독 가이드 (Apple Safari Extension 사용자 전용)
> [!IMPORTANT]
> 아래 도메인 그룹 구독 URL은 Apple Safari Extension 사용자만 사용하십시오.
> AdGuard 유저스크립트 기능 사용자는 기본 URL(`dist/tinyShield.user.js`)을 계속 사용하십시오.

- 빌드 결과 파일 구조:
  - 기본 스크립트: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js`
  - 도메인 그룹 스크립트: `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/<initial>/tinyShield-<domain-group>.user.js`
- 도메인 그룹별 구독 파일 선택 방법:
  1. `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/`를 엽니다.
  2. 대상 그룹 파일명 첫 글자와 같은 `<initial>/` 하위 디렉터리로 이동합니다.
  3. 사용하는 웹 사이트에 맞는 `tinyShield-<domain-group>.user.js` 파일 하나를 선택합니다.
  4. 해당 파일을 한 번 열어 메타데이터 `@match`에 대상 도메인이 포함되어 있는지 확인합니다.
  5. Safari 유저스크립트 확장에 그 파일 URL을 그대로 구독 URL로 등록합니다.

이 도메인 그룹 분리는 https://github.com/FilteringDev/tinyShield/issues/38 의 영향 범위를 가능한 한 최소화하기 위한 목적입니다.

### 설치하는 법
Firefox 및 Chromium 기반 브라우저에서는 **Violentmonkey**를, macOS·iOS·iPadOS의 Safari에서는 **wBlock**을 권장합니다. **Tampermonkey는 권장하지 않습니다.**

- [Violentmonkey](https://violentmonkey.github.io/get-it/) (권장) - Firefox 및 Chromium 기반 브라우저 확장
  1. `Dashboard`를 엽니다.
  2. `New` 버튼을 누르십시오.
  3. `Install from URL` 버튼을 누르십시오.
  4. 다음 URL를 누르십시오:
  ```
  https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/tinyShield.user.js
  ```
  5. `OK` 버튼을 누르십시오.
  6. 유저스크립트의 메타데이터를 확인하시고 `Confirm installation`를 누르십시오.
  7. 애드쉴드에 보호받고 있는 웹 사이트를 열고 있는 탭으로 돌아가신 뒤에 새로고침하십시오.

- AdGuard for Windows
  1. 빠른 시작 세션에 있는 URL를 클릭하여 설치하십시오.

- AdGuard for Android
  1. 빠른 시작 세션에 있는 URL를 클릭하여 설치하십시오.

- [wBlock](https://apps.apple.com/app/wblock/id6746388723) (권장) - macOS·iOS·iPadOS Safari

  <details>
  <summary>Safari에서 wBlock으로 설치하기</summary>

  1. wBlock 앱을 설치하고 실행한 뒤 초기 설정 안내를 따르십시오.
  2. Safari 확장 프로그램 설정에서 **wBlock Scripts**를 활성화하고 모든 웹 사이트에서 실행할 권한을 허용하십시오.
     - macOS: `Safari` > `설정` > `확장 프로그램`
     - iOS·iPadOS 18 이상: `설정` > `앱` > `Safari` > `확장 프로그램`
     - iOS·iPadOS 17 이하: `설정` > `Safari` > `확장 프로그램`
  3. 위 도메인 그룹 구독 가이드에 따라 대상 도메인의 그룹 스크립트 URL(`tinyShield-<domain-group>.user.js`)을 선택하고 `@match`를 확인하십시오.
  4. wBlock 앱의 `Userscripts` 화면에서 기본 제공되는 tinyShield 항목을 비활성화하여 그룹 스크립트와 중복 실행되지 않게 하십시오.
  5. 같은 화면의 추가 메뉴(`+`) > `Userscript` > `URL` > `Single URL`을 선택하고 그룹 스크립트 URL을 입력하십시오. 빠른 시작의 전체 스크립트 URL은 사용하지 마십시오.
  6. `Next`를 누르고 메타데이터를 확인한 뒤 `Add`를 눌러 그룹 스크립트를 추가하고 활성화하십시오.
  7. Safari에서 대상 웹 사이트를 열고 있는 탭으로 돌아가 새로고침하십시오.

  </details>
