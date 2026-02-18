
# Angelo — Private Family Memory Network (Telegram Mini App Prototype)

## Overview
A complete, clickable prototype of "Angelo" — a warm, magazine-style family memory app. All data is mock/in-memory. A platform abstraction layer isolates Telegram SDK calls behind interfaces, making future PWA migration straightforward.

## Design System
- **Palette**: Warm cream backgrounds (#FFF8F0), amber/gold accents, brown typography, sepia-toned UI elements
- **Typography**: Elegant serif for headings (magazine feel), clean sans-serif for body
- **Style**: Large media cards, generous spacing, rounded corners, cozy "photo album" aesthetic — not social media
- **Mobile-first**: All layouts optimized for Telegram webview (~375px width)

## Architecture

### Platform Abstraction Layer
- `PlatformAdapter` interface with methods: `getUser()`, `hapticFeedback()`, `shareLink()`, `close()`, `expandView()`
- `TelegramAdapter` — stub using Telegram WebApp SDK globals
- `MockWebAdapter` — works in regular browser for development
- Context provider to inject the active adapter app-wide
- README section documenting how to swap adapters for PWA migration

### Data Layer
- Typed TypeScript interfaces for all entities: `FamilyMember`, `Publication`, `MediaItem`, `Comment`, `Invitation`, `FamilyTree`, `Subscription`
- Mock data store with 5 family members (3 generations), 50+ photo references, 10-20 videos, 5-10 audio records, 15-20 person family tree
- Mock API service with simulated loading delays and error states

### Reusable Components
- `AppLayout` with bottom navigation (Tree / Feed / + / Family / Store)
- `BottomNav` component with active state indicators
- `MediaCard`, `PublicationCard`, `FamilyMemberCard`
- `AvatarPlaceholder`, `TopicTag`, `UnreadMarker`
- Loading skeletons, empty states, and error states for all key screens

## Screens & Flows

### 1. Welcome Screen
- Angelo logo with warm styling, subtitle "your family album"
- "Sign In" and "Create Account" buttons
- "Terms / Privacy" link at bottom

### 2. Auth Flow (3 screens)
- **Login**: Phone/email input → "Get Code" button
- **Registration**: Phone/email + mandatory consent checkboxes (terms, privacy, data processing)
- **Code Confirmation**: 4-6 digit input, resend timer, change phone/email link
- Error states: invalid format, user not found, invalid/expired code — all shown inline

### 3. Onboarding Profile (Step 1)
- Fields: last name*, first name*, middle name, birth date*, city, about
- Avatar placeholder with "Add Photo" action
- Next / Skip buttons

### 4. Family Tree Screen
- Current user centered, family member cards radiating outward (simplified visual tree)
- Cards: rounded corners, avatar + nickname
- "Add" button with dropdown menu: add from contacts / create contact / send invite
- Bottom navigation bar

### 5. Feed Screen (2 modes)
- **Publications mode**: Title bar with mode switch toggle, sort (new/old), filter button. Cards in 60/40 layout (media left, text/meta right) showing author, dates, title preview, media counters, likes, comments, unread dot
- **Media mode**: Grid view with density selector (1 / 3 / 5 columns). Warm "milky" cream background. Same sort/filter controls

### 6. Feed Filters (Modal/Sheet)
- Filter by: author, participants, date ranges (publish & event), topic tag, favorites only, unread only
- "Show Results" and "Reset" actions
- Empty state when no results match

### 7. Publication Details
- Header: back arrow + "..." menu
- Author block with co-author add action
- Event date, place, title, full text
- Media blocks: photo gallery, video player placeholder, audio player placeholder, document list
- Participants list, topic tag
- Likes + comments section
- Author menu: edit / delete / unpublish

### 8. Create/Edit Publication
- Type chooser: photo / video / audio / document / text
- Form: title (optional), text/description, event date (with approximate option), place, participants picker, mandatory topic tag
- Media file list with preview thumbnails, name, size
- File validation UI: photo ≤ 20MB, video ≤ 500MB, audio ≤ 100MB — error shown if exceeded
- Visibility settings: visible for / exclude for specific members
- Publish / Cancel buttons
- Error states: upload error, no internet, file too large

### 9. Family List + Profiles (3 screens)
- **Family List**: Tabs — All / Active / Inactive. Invite button. Member cards
- **My Profile**: Sections — about, my posts, posts with me, media, subscription, settings, help
- **Contact Profile**: Relation type display, active/inactive status, actions (invite, add to tree, add to group, delete)

### 10. Invite Flow
- Invite screen with mock generated link
- Copy / Share / Done actions
- Link to sent invitations status screen
- Invitations list: sent/accepted statuses, incoming invitations with accept/reject

### 11. Subscription / Payment / Support (Prototype)
- Subscription status card showing current plan
- Plans comparison (Free / Premium)
- Payment screen with success and error result states
- Places management ("3 of 5 places used")
- Settings page, Help/FAQ accordion, Support form

### 12. AI Demo Features (Visible in UI)
- **Speech-to-text**: Upload audio → show mock transcript with "processing" → "complete" states
- **Text styling**: Show raw transcript → "Polish" button → show styled story output
- **AI Assistant**: Chat-style interface for searching family content with mock responses
- **Photo animation**: Select photo → "Animate" action → progress indicator → mock result placeholder

## Navigation Structure
- Bottom nav bar on all main screens: Tree / Feed / ➕ / Family / Store
- "➕" opens Create Publication flow
- All screens connected with proper back navigation
- Auth flow → Onboarding → Tree (main landing)

## States Coverage
- Loading: skeleton screens on Feed, Tree, Publication details
- Empty: "No publications yet", "No family members", "No results" with illustrations
- Error: network error, validation errors, file size errors
- Success: publication created, invite sent, code verified
