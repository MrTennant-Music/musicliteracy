# Keyboard classroom service

The classroom feature is part of `main`. `Join a Game` opens
`keyboard-classroom.html?mode=join` on the main Hub, and `Host a Game` opens
that same page with the teacher's current keyboard settings. No second Netlify
project is needed once the main deployment is configured and verified.

## Main Hub deployment

The repository-root `netlify.toml` builds the complete Hub into `dist` and
bundles `classroom-pilot/functions/classroom.js` as the main project's
`/.netlify/functions/classroom` endpoint. The historical `classroom-pilot`
folder contains backend code, schema and tests; its name does not require a
separate hosted site. The public build excludes this folder and server files.

The existing Supabase database is retained; no new database or data migration
is needed. Configure these variables on the **main** Netlify project, for
Production only. Leave preview and branch contexts unset. On plans that allow
scope selection, choose Functions only; Personal currently limits secret
variables to Builds, Functions and Runtime. The build never embeds these
variables in public assets. Root configuration disables classroom access in
Deploy Previews and branch deploys:

- `SUPABASE_URL`: copy the existing pilot project's database URL.
- `SUPABASE_SERVICE_ROLE_KEY`: copy the existing server-only credential; mark
  it as secret. Never put its value in Git or public browser assets.
- `CLASSROOM_ENABLED`: `true` after the deployment is ready to verify.

The Supabase database's existing enabled switch must also be on. Service
credentials are used only by the backend; browsers call the same-origin
Netlify endpoint and have no direct access to the database.

## Retiring the separate project

1. Stop automatic builds on `mlh-keyboard-classroom-pilot` while leaving its
   current deployment available during the transition.
2. Configure the main project's Production/Functions variables above.
3. Commit and push the consolidated changes to `main` once. Confirm the main
   Netlify build succeeds and deploys the classroom function.
4. On the main Hub, verify create, join, start, answer, reveal, next and end in
   two browser sessions. Verify host settings, game PIN/QR links, rejection of
   duplicate/late answers and host-only room control.
5. Only after that check, delete the obsolete Netlify project with explicit
   deletion confirmation. Keep the Supabase project: the main site uses it.

Deleting the old project removes its Netlify URL and deployment history.
Existing bookmarks to the old pilot URL must be updated to the main Hub.

The former `classroom-pilot/netlify.toml` and `build.cjs` remain historical
rollback tools and must not be used to create another production site.
GitHub Pages can still host the static Hub, but cannot execute this Netlify
backend; the classroom feature requires the main Netlify deployment.

## Game behaviour and checks

Rooms expire after 45 minutes. Teachers choose 5–20 questions, with 20 seconds
per question and 1,000 points per correct answer. Questions honour the selected
level, note groups, octave range and C labels. Nicknames and temporary scores
only are stored. Random room/player tokens are hashed in the database; pupil
tokens stay in browser memory and refreshing requires rejoining. The creator
alone receives the room-control token. Public database table/RPC access is
blocked. Expired rooms are deleted on the next service request.

Updates poll every five seconds; answers and teacher actions refresh
immediately. There are no application-level room, pupil or monthly caps, but
Netlify and Supabase plan allowances still apply. Hosting needs no teacher
key, so site visitors can create games and consume shared service quota.

`pnpm test` includes `classroom-pilot/tests/classroom.test.cjs`. Before wider
classroom use, verify the school Wi-Fi and trial one class, then inspect both
providers' usage. An existing database from before cap removal needs
`remove-capacity-limits.sql`; do not recreate or reset the database.

## Emergency switch-off

Set `CLASSROOM_ENABLED=false` on the main Netlify project and redeploy, or
immediately disable the service in Supabase with:

```sql
update public.keyboard_pilot_settings set enabled=false where id=true;
```

The database switch blocks existing sessions on their next request.
`keyboard-notes.html` remains available for individual practice.
