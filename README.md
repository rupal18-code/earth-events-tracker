# Earth Events Tracker

A live map of wildfires, severe storms, volcanoes, floods and other natural events, powered by NASA's
[EONET](https://eonet.gsfc.nasa.gov/) API.

**Stack:** Next.js 14 (App Router), Tailwind CSS, Leaflet, deployed on Vercel.

## Features
- Interactive dark map with color-coded markers and popups
- Filter by category, time range (7 / 30 / 90 days) and search text
- Click an event in the list and the map flies to it
- Loading, empty and error states with a retry button
- Server-side API route that normalizes EONET data and caches it for 10 minutes


## Project structure
```
app/api/events/route.js   fetches and normalizes EONET events
components/Dashboard.js   state, filters, event list
components/EventMap.js    Leaflet map (client only)
lib/categories.js         category colors
```

## Ideas to extend
- "Near me" filter using the browser Geolocation API
- Marker clustering with leaflet.markercluster
- Timeline view grouped by day
- Bookmarked events saved in localStorage
