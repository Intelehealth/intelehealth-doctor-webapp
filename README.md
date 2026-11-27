# Intelehealth Doctor Webapp

Doctor-facing telemedicine web application for Intelehealth. Doctors use it to review patient visits and visit summaries, write prescriptions, chat and place video calls, and manage appointments and their calendar. An admin area holds configuration and admin actions.

## Requirements

- Node.js 18 (`.nvmrc` pins `v18.14.0`; the Dockerfile builds on `node:18-alpine`).
- npm. The repo's `.npmrc` sets `legacy-peer-deps=true`, and the Dockerfile installs with `--legacy-peer-deps`.

## Setup

```
git clone https://github.com/Intelehealth/intelehealth-doctor-webapp.git
cd intelehealth-doctor-webapp
npm install
cp .env.example .env
```

Fill in `.env` for your environment (see [Environment variables](#environment-variables)). `.env` and `src/environments/*` are git-ignored. Never commit them.

`src/environments/environment.ts` and `environment.prod.ts` are generated, not written by hand. `src/assets/scripts/setEnv.ts` reads `.env` and writes the file for the chosen mode. It exits with an error if a required variable is missing, unless the `CI` environment variable is set, in which case it uses placeholder values for the required ones.

## Running locally

```
npm start
```

`npm start` regenerates `src/environments/environment.ts` from `.env`, then runs `ng serve`. Open the URL that `ng serve` prints (the Angular default is `http://localhost:4200`). Re-run `npm start` after you change `.env`.

## Building

Development build (not AOT, per `angular.json` defaults):

```
npm run config-dev
npx ng build
```

Production build (AOT):

```
npm run build
```

`npm run build` generates the production environment file, runs `ng build --configuration production --aot`, then runs the `postbuild` script (`src/assets/scripts/postBuild.ts`), which removes build files of features that are not listed in `FEATURES_LIST`. Output goes to `dist/intelehealth-ui`.

The Dockerfile runs the production build and serves `dist/intelehealth-ui` with nginx.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | `config-dev`, then `ng serve`. |
| `npm run ng-host` | `ng s --host 0.0.0.0 --disableHostCheck`, to serve on the network. |
| `npm run build` | `config-prod`, then a production AOT build, then `postbuild`. |
| `npm run config-dev` | Generate the environment file for development from `.env`. |
| `npm run config-prod` | Generate the environment file for production from `.env`. |
| `npm run config-test` | Generate the environment file for tests from `.env`. Forces `showCaptcha` to `false`. |
| `npm test` | `ng test` (Karma) limited to `src/app/admin/admin-actions/webrtc`. |
| `npm run test:queue` | `ng test` limited to the queue module and the queue, doctor-availability and visit service specs. |
| `npm run lint` | `ng lint`. |
| `npm run e2e` | `ng e2e` (Protractor target in `angular.json`). |
| `npm run build-library` | `ng build aiddx-library --watch`. |
| `npm run postbuild` | Runs automatically after `npm run build`. |

## Tests and lint

Tests run with Karma and Jasmine. Run another spec with `npx ng test --include <path>`.

`angular.json` defines no `lint` target, so `npm run lint` does not work. Run TSLint directly:

```
npx tslint -c ./tslint.json 'src/**/*.ts'
```

## Project structure

Top-level folders in `src/app/`:

| Folder | Contents |
| --- | --- |
| `abdm/` | ABDM / ABHA integration. |
| `admin/` | Admin area: admin actions, AYU, insights, reports, support. |
| `appointments/` | Appointments. |
| `calendar/` | Doctor calendar and schedule setup. |
| `core/` | Shared guards, interceptors, pipes, directives, validators, components. |
| `dashboard/` | Dashboard, visit summary (v1 and v2), completed and follow-up visits, profile. |
| `help-and-support/` | Help and support. |
| `main-container/` | Main layout shell for signed-in pages. |
| `messages/` | Chat. |
| `modal-components/` | Dialogs, including video call, call history and prescription views. |
| `model/` | Shared interfaces (`model.ts`). |
| `prescription/` | Prescription. |
| `prescription-download/` | Public prescription download page (`/i/:hash`). |
| `queue/` | Visit queue. |
| `services/` | Shared services. |
| `session/` | Login, OTP, password reset and related pages. |
| `utils/` | Utility functions and helpers. |

Other folders: `src/config/` (constants), `src/assets/i18n/` (translations), `src/assets/scripts/` (environment and post-build scripts).

## aiddx-library

The AI differential diagnosis plugin is a dependency in `package.json`:

```
"aiddx-library": "github:Intelehealth/intelehealth-doctor-ddx-plugin#v1.4.9"
```

It is installed from the `Intelehealth/intelehealth-doctor-ddx-plugin` GitHub repository at the `v1.4.9` ref. `angular.json` sets `preserveSymlinks` to `true` for the build.

## Environment variables

Put these in `.env` at the repo root. Copy `.env.example` as a starting point. Values below are placeholders; use the values for your environment.

Required (the build stops if one is missing): `BASE_URL`, `MIND_MAP_URL`, `CONFIG_URL`, `QUEUE_URL`.

| Key | Purpose | Example shape |
| --- | --- | --- |
| `BASE` | Base host URL. | `https://<host>` |
| `BASE_URL` | Main backend API base URL. | `https://<host>/api` |
| `BASE_URL_CORD_APP` | Core app base URL. | `https://<host>` |
| `BASE_URL_LEGACY` | Legacy admin UI base URL. | `https://<host>` |
| `MIND_MAP_URL` | Mindmap / AI service base URL. | `https://<host>` |
| `INSIGHTS_ENABLED` | Turns the admin insights page on. | `true` or `false` |
| `TURN_NOTIFY_URL` | Turn notification URL. | `https://<host>` |
| `PAGERDUTY_URL` | PagerDuty service URL. | `https://<host>` |
| `CONFIG_URL` | Config service base URL. | `https://<host>` |
| `ABHA_URL` | ABHA backend base URL (includes the `/abha` prefix). | `https://<host>/abha` |
| `QUEUE_URL` | Queue service base URL. | `https://<host>` |
| `NOTIFICATION_URL` | Push notification service URL. | `https://<host>` |
| `SOCKET_URL` | Socket.IO server URL. | `https://<host>` |
| `CAPTCHA_SITE_KEY` | Captcha site key. | `<site-key>` |
| `SITE_KEY` | Site key used on the login page. | `<site-key>` |
| `SHOW_CAPTCHA` | Shows the captcha on login. | `true` or `false` |
| `FIREBASE_API_KEY` | Firebase API key. | `<key>` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain. | `<project>.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID. | `<project-id>` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket. | `<bucket>` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID. | `<id>` |
| `FIREBASE_APP_ID` | Firebase app ID. | `<app-id>` |
| `WEB_RTC_SDK_SERVER_URL` | WebRTC SDK server URL. | `https://<host>` |
| `WEB_RTC_TOKEN_SERVER_URL` | WebRTC token server URL (used as a prefix, keep the trailing slash). | `https://<host>/` |
| `EXTERNAL_PRESCRIPTION_CRED` | Credential for external prescription calls. Secret. | `<credential>` |
| `VAPID_PUBLIC_KEY` | VAPID public key for web push. | `<key>` |
| `AUTH_GATE_WAY_URL` | Auth gateway URL. | `https://<host>/v2` |
| `ABHA_ENABLED` | Turns ABHA features on. Written unquoted into the environment file. | `true` or `false` |
| `CONFIG_PUBLIC_URL` | Public base URL for config-hosted files. | `https://<host>` |
| `BRAND_NAME` | Brand name; some UI is shown or hidden by brand. | `<brand>` |
| `FEATURES_LIST` | JSON array of enabled feature names. Also read by `postbuild`. | `["<feature>"]` |
| `GAMEASUREMENTID` | Google Analytics measurement ID. | `G-XXXXXXXX` |
| `KALEYRA_API_KEY` | Kaleyra API key. Secret. | `<key>` |
| `DOCTOR_PHONE_NUMBER` | Doctor phone number. | `<number>` |
| `IS_TURN_SERVER` | Marks a Turn deployment. Written unquoted into the environment file. | `true` or `false` |

## Deployment

Deployments are owned by DevOps. The workflows are in `.github/workflows`; each one builds a Docker image and deploys it to its servers when its branch is pushed. Do not change these files yourself; ask DevOps for trigger changes.

Which branch deploys to which server is in [Branches and pull requests](#branches-and-pull-requests). Every merge into a deploying branch redeploys the webapp, whatever files changed.

## Development Standards

This is a first, lightweight set of standards. It will grow over time. When in doubt, follow the
pattern the surrounding code already uses.

### Branches and pull requests

| Branch | Role | Deploys to |
| --- | --- | --- |
| `development_master` | Testing only. May hold unstable changes. | dev, ttxai, testturn |
| `staging_master` | Stable base. Every branch starts here and returns here. | nasstaging, pathqa |
| `production_master` | Takes code from `staging_master` for a release. | staging server |
| `master` | Takes code from `staging_master` for a release. | demoai |
| `nas_production_master` | Takes code from `staging_master` for a NAS release. | NAS production |
| `ap_production_master` | Takes code from `staging_master` for an Arogya Path release. | Arogya Path production |

Production servers move onto their branch at their next planned release; until then they keep
their current triggers.

**Flow**

1. Cut your branch from `staging_master`. Name it `<type>/<ticket>-<short-description>` with type
   `feature`, `fix` or `patch`, e.g. `fix/ayu-46-override-reason-scope`, `feature/ai-llm-json-format`.
2. Open a PR into `development_master` and test the change on the dev server.
3. Once tested, open a PR from the **same branch** into `staging_master`.
4. For a release, `staging_master` is merged into `production_master`, `nas_production_master`,
   `ap_production_master` or `master`.
5. Build every feature so it can be switched on per server (configurable or pluggable) and is off
   by default. Pushing it to a server must not change anything there until it is enabled.

**Rules**

- Never merge `development_master` into `staging_master`, `production_master` or `master`. It can
  contain unstable testing changes.
- Never cut a branch from `development_master`. A branch must carry only stable code plus its own change.
- If testing on dev finds a problem, fix it on your branch and merge the branch into
  `development_master` again. Do not commit the fix on `development_master` only.
- Release merges from `staging_master` use **"Create a merge commit"**, never squash.
- `development_master` may be reset to `staging_master` with a force push to make the dev branch
  stable again. This discards every testing change that is on `development_master` only, so it is
  the Tech Lead's decision alone. Before a reset, make sure your work is on your own branch.
- Keep a PR to one logical change. Describe what changed and why; add screenshots for UI changes.
- Do not merge your own PR without a review.

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The husky `commit-msg`
hook runs commitlint (`.commitlintrc.json`) and rejects anything else.

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

A new variable must be added in four places: `.env`, `.env.example`, `src/assets/scripts/setEnv.ts`,
and the table in [Environment variables](#environment-variables). Never commit `.env` or any secret.

### Code hygiene

- Follow `.editorconfig` (2-space indent, final newline) and `tslint.json`.
- Unsubscribe from long-lived observables with `takeUntil` or the `async` pipe.
- Do not leave `console.log` or commented-out code in a PR.
- Never log, or send to third-party tools, patient data (names, identifiers, visit contents).

### Tests

Put specs next to the file they test (`<name>.spec.ts`). `npm test` currently runs only the
`admin-actions/webrtc` suite and `npm run test:queue` only the queue suites. Pass `--include` to run other specs.

## Voice Transcript (call recording & transcription)

- Admin flags live under **Admin Actions → AI LLM → Voice Transcript** (config microservice `/ai-llm-voice-transcript`, master feature key `ai_llm_voice_transcript_section`). Sub-flags: `record_transcribe_webapp`, `record_transcribe_mobile`, `feed_ai_ddx`, `autofill_doctor_notes`. Changes apply only after **Publish**.
- The doctor webapp records and transcribes a call only when the published config has `ai_llm_voice_transcript_section` on and `ai_llm_voice_transcript.record_transcribe_webapp === true` (`isVoiceTranscriptEnabled` in `src/app/utils/voice-transcript.ts`). Sessions are created with `source: 'webapp'`; a 403 from session creation skips audio capture, and a 403 on a chunk upload stops uploading.
- Kaleyra calls (Visit Summary V2): after a successful click2call, `VisitSummaryV2Service.kaleyraCallStarted$` emits and `app-kaleyra-call-recorder` opens a centered modal (Start recording / Not now) with a "Put the call on speaker" prompt; once recording starts it collapses to a floating bottom-right bar (timer, Pause/Resume, Stop with a confirm dialog, speaker reminder). Kaleyra audio never reaches the browser, so it records the doctor's laptop microphone (`VoicedocRecorderService.start(opts, 'mic')`) — the doctor should keep the phone on speaker. Same gate, same `/voicedoc` session/chunk/end APIs and `source: 'webapp'` as WebRTC calls; no `roomId` is sent. Paused audio is dropped and the partial chunk is flushed on pause. The widget has its own recorder instance, so it does not clash with a WebRTC call recording.
- Admins can browse recordings at `/admin/actions/ai-llm/voice-transcripts` (the "View" link on the Doctor webapp record & transcribe row; All / Web / Mobile tabs map to `?source=`). It lists `GET {MIND_MAP_URL}/voicedoc/transcripts` 10 per page, newest first, and opens a detail dialog with the transcript and the generated summary (`GET /voicedoc/transcripts/:id`). When the recording is `done`, the dialog shows the stored **Visit Summary** (the portal's summary of every recording in the visit, generated after each call) with the doctor-note status (saved / updated / autofill off / no encounter / error) and a Regenerate link (`POST /voicedoc/transcripts/:id/visit-summary`). For up to 10 minutes after a call it keeps polling until the summary arrives. With **Autofill doctor notes** on, the same summary is written into the visit's Doctor's Note → Note/Outcome. The per-chunk debug table is shown only when `localStorage.debug` is `1`/`true`/`yes`/`on` (`isDebugEnabled()` in `src/app/utils/utility-functions.ts`); set it in DevTools with `localStorage.setItem('debug', '1')` and reopen the dialog.

[Disclaimer](<https://github.com/Intelehealth/Intelehealth-Doctor-WebApp/blob/master/HEALTHCARE%20DISCLAIMER.md>)
