# Google Analytics 4 setup

Analytics is disabled until a real Google Analytics 4 Measurement ID is entered.

## 1. Add the Measurement ID

Open `analytics-config.js` and replace:

```js
measurementId: "G-XXXXXXXXXX",
```

with the Measurement ID from the Music Literacy Hub's GA4 web data stream, for example:

```js
measurementId: "G-ABC1234567",
```

This is the only file that needs to be changed. Leaving the placeholder in place prevents the Google Analytics script from loading.

## 2. Keep collection limited

In Google Analytics, open **Admin → Data streams → the Music Literacy Hub web stream** and turn **Enhanced Measurement** off. This prevents GA4 from automatically adding scroll, outbound-click, site-search, video and file-download events.

The website itself sends only:

- `page_view` — sent automatically when an HTML page opens.
- `app_opened` — includes the page/app title as `app_name`.
- `level_selected` — includes the explicitly selected level as `curriculum_level`.

It does not send questions, answers, scores, searches, worksheet details, timings or pupil data.

## 3. Make the two event details reportable

In **Admin → Custom definitions**, create these event-scoped custom dimensions:

| Dimension name | Event parameter |
| --- | --- |
| App name | `app_name` |
| Curriculum level | `curriculum_level` |

This allows the two values to be used in GA4 reports and Explorations.

## 4. Verify analytics

1. Publish the site with the real Measurement ID.
2. Open several pages and select a curriculum level.
3. In GA4, open **Reports → Realtime**.
4. Confirm that `page_view`, `app_opened` and `level_selected` appear.
5. Open each event to confirm that `app_name` and `curriculum_level` contain the expected values.

GA4's normal processed reports and new custom dimensions can take 24–48 hours to appear.
