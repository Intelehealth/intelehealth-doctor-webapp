# IntelehealthUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.2.2.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Node.js
   ```
   https://nodejs.org/en/
   ```
   
    
### Installing
A step by step series of examples that tell you how to get a development environment running
1. Clone or download this repository
2. Install all the dependencies.
```
"npm install"
```    
3. Start the server
```
"ng serve"
```

4. Open in browser
```
 "localhost:4200"
```

## Built With

* [Angular](https://angular.io/) - Angular Framework
* [Angular Material](https://material.angular.io/) - Designing
* [BootStrap](https://getbootstrap.com/) - Table, Cards and other UI design

## Development Standards

This is a first, lightweight set of standards. It will grow over time. When in doubt, follow the
pattern the surrounding code already uses.

### Branches and pull requests

- Cut every branch from `development_master` and open the PR back into `development_master`.
- Name branches `<type>/<ticket>-<short-description>`, e.g. `fix/ayu-46-override-reason-scope`,
  `feat/ai-llm-json-format`.
- Keep a PR to one logical change. Describe what changed and why; add screenshots for UI changes.
- Do not merge your own PR without a review.

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The husky `commit-msg`
hook runs commitlint (`commitlint.config.js`) and rejects anything else.

Allowed types: `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `chore`, `ci`, `revert`.

```
fix: allow provided config object to extend other configs
feat(lang): add language data
revert!: drop Node 8 from testing matrix
```

Keep the subject short and in the imperative ("add", not "added").

### File naming and placement

- File names are `kebab-case` with the Angular suffix: `.component.ts`, `.service.ts`,
  `.module.ts`, `.guard.ts`, `.interceptor.ts`, `.pipe.ts`, `.directive.ts`, `.spec.ts`.
- Feature code lives under its feature folder in `src/app/` (`dashboard/`, `admin/`,
  `appointments/`, ...). Dialogs go in `src/app/modal-components/`.
- Shared services go in `src/app/services/`; shared guards, interceptors, pipes and directives go
  in `src/app/core/`.
- Shared interfaces go in `src/app/model/model.ts`. Prefer a typed interface over `any` in new
  code.

### Constants

- No magic strings or numbers. App-wide constants go in `src/config/constant.ts`; constants used
  by one feature go in a `<feature>.constants.ts` file next to it.
- Constant keys are `UPPER_SNAKE_CASE`, matching the existing constants.

### API calls

- Components never call `HttpClient` directly. Put each call in a service in `src/app/services/`.
- Build URLs from the `environment` base URLs (`environment.baseURL`, `environment.mindmapURL`,
  ...). Never hard-code a host.
- Do not set auth headers by hand. The interceptors in `src/app/core/interceptors/` add them.
- Keep browser-called paths and file names free of words adblockers block (`analytics`, `track`,
  `telemetry`, `collect`, `metrics`, `stats`, `beacon`, `events`). Use neutral names such as
  `insights` or `usage`.

### Browser storage

Do not use `localStorage` directly. Use `getCacheData`, `setCacheData` and `deleteCacheData` from
`src/app/utils/utility-functions.ts`, with keys taken from `src/config/constant.ts`.

### Translations

User-facing text goes through `ngx-translate`. Add every new key to all the files in
`src/assets/i18n/` (`en`, `hi`, `gu`, `ru`), not just `en.json`.

### Environment variables

A new variable must be added in three places: `.env`, `src/assets/scripts/setEnv.ts`, and the
`.env` list in this README. Never commit `.env` or any secret.

### Code hygiene

- Follow `.editorconfig` (2-space indent, final newline) and `tslint.json`.
- Unsubscribe from long-lived observables with `takeUntil` or the `async` pipe.
- Do not leave `console.log` or commented-out code in a PR.
- Never log, or send to third-party tools, patient data (names, identifiers, visit contents).

### Tests

Put specs next to the file they test (`<name>.spec.ts`). `npm test` currently runs only the
`admin-actions/webrtc` suite. Pass `--include` to run other specs.

## .env (Create .env in the root folder and use below environment keys)

```
PRODUCTION=false
BASE=XXXXX
BASE_URL=XXXXX
BASE_URL_CORD_APP=XXXXX
BASE_URL_LEGACY=XXXXX
MIND_MAP_URL=XXXXX
CONFIG_URL=XXXXX
NOTIFICATION_URL=XXXXX
SOCKET_URL=XXXXX
CAPTCHA_SITE_KEY=XXXXX
WEB_RTC_SDK_SERVER_URL=XXXXX
WEB_RTC_TOKEN_SERVER_URL=XXXXX
SITE_KEY=XXXXX
EXTERNAL_PRESCRIPTION_CRED=XXXXX
VAPID_PUBLIC_KEY=XXXXX
AUTH_GATE_WAY_URL=XXXXX
FIREBASE_API_KEY=XXXXX
FIREBASE_AUTH_DOMAIN=XXXXX
FIREBASE_PROJECT_ID=XXXXX
FIREBASE_STORAGE_BUCKET=XXXXX
FIREBASE_MESSAGING_SENDER_ID=XXXXX
FIREBASE_APP_ID=XXXXX
SHOW_CAPTCHA=true/false
```

## Voice Transcript (call recording & transcription)

- Admin flags live under **Admin Actions → AI LLM → Voice Transcript** (config microservice `/ai-llm-voice-transcript`, master feature key `ai_llm_voice_transcript_section`). Sub-flags: `record_transcribe_webapp`, `record_transcribe_mobile`, `feed_ai_ddx`, `autofill_doctor_notes`. Changes apply only after **Publish**.
- The doctor webapp records and transcribes a call only when the published config has `ai_llm_voice_transcript_section` on and `ai_llm_voice_transcript.record_transcribe_webapp === true` (`isVoiceTranscriptEnabled` in `src/app/utils/voice-transcript.ts`). Sessions are created with `source: 'webapp'`; a 403 from session creation skips audio capture, and a 403 on a chunk upload stops uploading.
- Kaleyra calls (Visit Summary V2): after a successful click2call, `VisitSummaryV2Service.kaleyraCallStarted$` emits and `app-kaleyra-call-recorder` opens a centered modal (Start recording / Not now) with a "Put the call on speaker" prompt; once recording starts it collapses to a floating bottom-right bar (timer, Pause/Resume, Stop with a confirm dialog, speaker reminder). Kaleyra audio never reaches the browser, so it records the doctor's laptop microphone (`VoicedocRecorderService.start(opts, 'mic')`) — the doctor should keep the phone on speaker. Same gate, same `/voicedoc` session/chunk/end APIs and `source: 'webapp'` as WebRTC calls; no `roomId` is sent. Paused audio is dropped and the partial chunk is flushed on pause. The widget has its own recorder instance, so it does not clash with a WebRTC call recording.
- Admins can browse recordings at `/admin/actions/ai-llm/voice-transcripts` (the "View" link on the Doctor webapp record & transcribe row; All / Web / Mobile tabs map to `?source=`). It lists `GET {MIND_MAP_URL}/voicedoc/transcripts` 10 per page, newest first, and opens a detail dialog with the transcript and the generated summary (`GET /voicedoc/transcripts/:id`). When the recording is `done`, the dialog shows the stored **Visit Summary** (the portal's summary of every recording in the visit, generated after each call) with the doctor-note status (saved / updated / autofill off / no encounter / error) and a Regenerate link (`POST /voicedoc/transcripts/:id/visit-summary`). For up to 10 minutes after a call it keeps polling until the summary arrives. With **Autofill doctor notes** on, the same summary is written into the visit's Doctor's Note → Note/Outcome. The per-chunk debug table is shown only when `localStorage.debug` is `1`/`true`/`yes`/`on` (`isDebugEnabled()` in `src/app/utils/utility-functions.ts`); set it in DevTools with `localStorage.setItem('debug', '1')` and reopen the dialog.

[Disclaimer:] (https://github.com/Intelehealth/Intelehealth-Doctor-WebApp/blob/master/HEALTHCARE%20DISCLAIMER.md)
