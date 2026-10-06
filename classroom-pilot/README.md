# Keyboard classroom pilot

Status: Supabase Free project provisioned; schema and rolled-back synthetic game
verified on 6 October 2026. The separate Netlify pilot is deployed privately,
and its database is enabled for testing. Pupil access still awaits approval.
Pilot: https://mlh-keyboard-classroom-pilot.netlify.app/
Project: https://supabase.com/dashboard/project/kqunooxqmvkvnlechzcq
Normal `keyboard-notes.html` and the homepage are untouched. Pilot entry is
`keyboard-classroom.html`; the normal activity remains at `keyboard-notes.html`.

## Isolated deployment

Use a new Supabase **Free** project and a separate Netlify pilot site, not the
main Hub deployment. The pilot site may use the same repository, with base
directory `classroom-pilot` and its included netlify.toml. Check the current
Netlify account allowance first: separate sites in the same team can still
share a quota. The user selected the existing free team, so the pilot and main Hub share
Netlify credits. A separate site does not provide billing isolation.
The pilot build publishes only the keyboard pages and shared assets (about
4.3 MB), not the complete Hub or any database/server setup files.

Run schema.sql in the new project's SQL editor. Keep the default database switch
off until checks pass. Add these environment values to the pilot site's protected
configuration, never to browser code or Git. The Netlify Free plan makes secret
values available to builds, functions and runtime; limiting them to Functions
alone requires an upgrade. Set secrets for Production only and leave preview,
branch and local development contexts blank:

- SUPABASE_URL: the project URL
- SUPABASE_SERVICE_ROLE_KEY: server-only service-role key
- CLASSROOM_ENABLED: true after validation

Then enable the database switch using the commented statement in schema.sql.
No Supabase browser SDK, Realtime connections, or pupil accounts are required.
The browser calls only its own pilot site's .netlify/functions/classroom endpoint.
Updates poll every five seconds; this deliberately trades a small delay for lower
usage. Answers and teacher actions return an immediate refreshed snapshot.

## Pilot limits and data

Two concurrent rooms, 35 pupils each, five new games daily, 50,000 successful
service requests monthly, 45-minute room expiry, 5–20 questions, 20 seconds per
question, 1,000 points per correct answer (no speed bonus). N3/N4 white keys;
N5 standard sharps/flats. Nicknames and temporary scores only. The creator alone receives the room-control token. Room and player
credentials are random tokens stored hashed in Supabase; pupil tokens stay in
memory and refresh requires rejoining. Expired rooms are deleted on the next
service request. No browser can access the room tables or RPC directly using a
public key. Service-role credentials belong only in the isolated backend.

Application limits do not prevent all malicious HTTP requests from consuming
hosting quota. Hosting needs no teacher key: anyone with site access can create games and use
the shared daily allowance. Do not promote this pilot to the
Hub's public audience. Review usage after each session, and set provider-side
rate limits/alerts before a broader rollout. Monthly budget is not a substitute
for verifying Netlify's compute, request and bandwidth allowances.

## Required verification before activation

1. Apply SQL to the new project and test create/join/start/answer/reveal/next/end
   with at least two browser sessions. Verify duplicate answers and late answers
   are rejected and that only the teacher can control a room.
2. Verify RLS and function grants: anon/authenticated cannot read either table or
   execute keyboard_pilot. Ensure no service key appears in published assets.
3. Check all three levels, all accepted enharmonic answers for enabled options,
   room/player/day/month limits, expired rooms, disconnect/reconnect and closure.
4. Create a game on the teacher computer and join from a pupil device over
   the actual school Wi-Fi. A home-network pass cannot prove school access.
5. Trial one class before inviting other teachers; inspect Supabase and Netlify
   usage afterwards. No automatic paid-plan upgrade is part of this setup.

## Emergency revert

Set CLASSROOM_ENABLED=false on the pilot deployment, or execute:

```sql
update public.keyboard_pilot_settings set enabled=false where id=true;
```

The database switch blocks existing sessions on their next request. Pupils can
open `keyboard-notes.html` for individual practice. The normal Hub has no dependencies on this service.
To fully remove the pilot, unpublish the isolated site and delete the pilot-only
files. Do not reset the repository: unrelated activity edits may be present.

Local tests cover request validation, default-off behaviour and question creation.
The real Supabase database passed smoke.sql: create, join, host-only control,
answer, duplicate rejection, score hiding until reveal, scoring, finish and end.
The transaction rolled back; enabled=false, requests=0, games=0, rooms=0.
Public table and RPC access are denied. Two live browser sessions verified
create, join, shared questions, answering, the 1,000-point leaderboard and host
closure. A polling collision that could discard a click was fixed and protected
by a regression test. The actual school network and classroom load still need
verification. The database off switch was verified against the deployed site.
The build always runs for pilot-branch updates because its keyboard source and
shared assets live outside the Netlify base directory.
