# Map and tree URL contract

The URL is the source of truth for both views. Two rules:

- **Entity params** (`genre`, `artist`, `song`) travel between the tree `/` and the map `/map`
  (`viewSwitchHref` in `src/lib/searchHrefs.ts`).
- **View-state params** (`at`, `region`, `view`, `zoom`, `size`, `about`, legacy `path`) never leave their page.
  `updateUrlQuery` takes the writer's rendered pathname and drops a write whose page has been left, so a late
  camera or viewport report cannot land on the other view.

`?artist=&genre=` is a valid state; hand-edited URLs may carry several entities. The in-app setters below clear the
entities they outrank, and each view shows one panel.

## Map `/map`

Written by `useRegionMapUrlState`.

| Param | Meaning | Crosses views | History | Setting it clears | In share links |
|---|---|---|---|---|---|
| `genre` | Genre UUID, opens the genre panel | yes | push | `song` | yes |
| `artist` | Artist UUID, opens the entity panel | yes | push | `genre`, `song` | yes |
| `song` | Song UUID, opens the entity panel | yes | push | `genre`, `artist` | yes |
| `region` | Wikidata ID of the selected region | no | push | `artist`, `song` | no |
| `at` | Camera `lng,lat,zoom` | no | replace | nothing | no |
| `path` | Legacy drill path, read only to frame old links, then removed | no | replace | nothing | no |

Panel precedence when several are present: genre, then song or artist, then region. The tab title follows the displayed
panel, so with a genre open it is not named after a hidden artist or song.

## Tree `/`

Written by `useGenreTreeUrlState` and `GenreTreePage`.

| Param | Meaning | Crosses views | History | Setting it clears | In share links |
|---|---|---|---|---|---|
| `genre` | Genre UUID | yes | push | `about`, `song` | yes |
| `artist` | Artist UUID (filters the tree) | yes | push | `genre`, `about`, `song` | yes |
| `song` | Song UUID | yes | push | `genre`, `artist`, `about` | yes |
| `view` | Viewport `x,y,zoom` | no | replace | nothing | no |
| `zoom` | Focused genre (pop-core mode only) | no | push (replace when rejected) | `view` | no |
| `size` | Node size metric, `views` or default `songs` | no | replace | nothing | no |
| `about` | About panel | no | push (close) | nothing | no |

Changing the view mode drops `view`, and `zoom` outside pop-core, with replace.

## Tab title

`useEntityDocumentTitle` titles the tab after the open song (`Title — Artists`) or artist, re-applies it if Next's
layout `<title>` overwrites it after a navigation, and restores the app name when the entity closes.
