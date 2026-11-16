# LunchLink

A mobile-friendly campus lunch club for meeting people beyond your lecture hall. This MVP starts at Mensa Garching, with small groups and 30-minute lunches between 11:00 and 14:00.

## Run locally

Requires Node.js 22.18+ and npm.

```sh
npm install
npm run dev
```

Vite prints the local URL and a network URL for testing on a phone. If the default port is occupied, use `npm run dev -- --port 5174`.

```sh
npm test
npm run build
npm run preview
```

## Included

- Discover lunches by topic, language, date, and available seats; search and sort results.
- Create public or invite-only lunches with a title, description, topic, language, date, time, and 2-8 seats.
- Join, leave, save, and cancel lunches; view your plans and the people at your table.
- Redeem an invite code or URL, copy invites, and export a calendar event in the Europe/Berlin timezone.
- Find the meeting spot, share post-lunch feedback, and record a concern.
- Accessible dialogs, keyboard navigation, reduced-motion support, and responsive layouts.

## Preview boundaries

**This is a functional, local frontend MVP, not a deployed multi-user service.** Six sample lunches and a demo student account let you try the whole flow without credentials.

- TUM single sign-on is not integrated. No password is collected and enrollment is not verified. The demo must not be used to claim verified student access.
- Lobbies, memberships, saves, feedback, and reports are stored in this browser's `localStorage`. Changes sync between tabs on the same origin, not across devices. Clearing browser data resets the preview. Avoid submitting sensitive information.
- Private lobbies are hidden from discovery unless you are a participant. Invite checks demonstrate the intended behavior, but frontend storage is not a security boundary. Cross-device invitations require a backend.
- Feedback and reports are saved locally only. No moderator or project team receives them, and there is no AI moderation or live emergency response.
- There is no Mensa partnership or reserved seating. Groups meet by the main entrance and choose a table together.
- Lunch photos and demo avatar assets are stored locally. Fonts load from Google Fonts, with sans-serif fallbacks.

## Before a live campus pilot

Connect institution-approved TUM SSO and server-side enrollment checks. Add a shared database, session handling, authorized APIs, transactional seat allocation, secure invitations, moderation/report delivery, a privacy notice and retention policy. Confirm the meeting arrangement with Mensa administration before advertising reserved tables. Sponsor placements, ads, and expansion beyond Garching are intentionally outside this MVP.

## Stack and checks

React 19, TypeScript, Vite, Base UI accessible primitives, Lucide icons, Sonner notifications, and Vitest. Lobby rules and persistence recovery are tested in `src/model.test.ts`. Browser checks cover discovery, filters, saved lunches, demo login, joining/leaving, creation, private invites, cancellation, calendar content, feedback, and responsive layouts. Phone emulation does not replace testing Safari/Chrome and the software keyboard on real hardware.

The occasional dialog transitions use transform/opacity, a 200-250ms custom ease-out, and reduced-motion handling. Functional lists and filter results do not animate. The supplied `.agents/skills` design-engineering, mobile-native, animation, UI-library, and Sonner guidance informed the implementation.

Photography: [shared lunch photograph via Unsplash](https://images.unsplash.com/photo-1528605248644-14dd04022da1); demo portraits via [Pravatar](https://pravatar.cc/).
