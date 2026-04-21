## tinyShield

[![jsdelivr stat](https://data.jsdelivr.com/v1/package/npm/@filteringdev/tinyshield/badge)](https://www.jsdelivr.com/package/npm/@filteringdev/tinyshield)

[English](./README.md) [Japanese](./README.ja.md)

tinyShield 유저스크립트는 애드쉴드 재삽입되는 광고와 애드쉴드의 가상 무결성 레이어를 바이패스합니다

tinyShield 유저스크립트는 AdGuard와 애드블록 커뮤니티에 의해 관리되고 있습니다.

설치/이용 과정에서 도움이 필요하시거나 궁금증이 있으시다면 GitHub Discussions를 이용해 주세요.
사용 도중에 해당 유저스크립트가 문제를 발생시킨다고 생각되시면 GitHub Issues를 이용해 주세요.

> [!IMPORTANT]
> tinyShield 유저스크립트 유지보수자는 tinyShield 유저스크립트와 함께 아래 애드블록들 중 하나를 사용하실 것을 권장합니다:
> - AdGuard
> - uBlock Origin
>
> 다른 애드블록 지원은 보장되지 않고 요청되어도 거부될 수 있습니다.

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
- [Violentmonkey](https://addons.mozilla.org/ko/firefox/addon/violentmonkey/) (AdGuard 프리미엄이 없다면 권장됨) - 브라우저 확장
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

- AdGuard for iOS
  AdGuard for iOS는 현재 유저스크립트를 지원하지 않습니다
  그러나, 미래에 지원될 것입니다.[^1]

  몰론, 지금은 대안을 사용하실 수 있습니다.[^2][^3]

  <details>
  <summary>iOS 유저들을 위한 자세한 설명</summary>

  1. [**Userscripts** 앱](https://apps.apple.com/kr/app/userscripts/id1463298887)을 설치하십시오.
  2. Userscripts 확장을 Safari 설정에서 활성화하십시오:
    * iOS 18 이상: `시스템 설정` => `앱` => `Safari` => `확장 프로그램`
    * iOS 17 이하: `시스템 설정` => `Safari` => `확장 프로그램`
    **Userscripts**을 찾으시고 활성화하신 후 `기타 웹 사이트` 권한을 허용하십시오.
  3. Safari에서 `https://cdn.jsdelivr.net/npm/@filteringdev/tinyshield@latest/dist/grouped/`를 열고 `<initial>/` 하위 디렉터리로 이동한 뒤, 대상 도메인에 맞는 그룹 스크립트 URL(`tinyShield-<domain-group>.user.js`)을 선택하십시오.
  4. Safari의 주소바에 있는 확장 아이콘을 클릭하시고 **Userscripts**을 선택하십시오.
  5. 설치하는 버튼을 누르십시오.
  6. 열린 팝업을 스크롤하신 후에 설치하는 버튼을 누르십시오.
  7. 완료되었습니다.

  </details>

[^1]: https://github.com/AdguardTeam/AdguardForiOS/issues/1542
[^2]: https://github.com/quoid/userscripts
[^3]: https://apps.apple.com/us/app/userscripts/id1463298887
