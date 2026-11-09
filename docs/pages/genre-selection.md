# Genre selection

Both the tree and map use `?genre=<genre entity UUID>`. The UUID identifies a genre,
not its playlist or renderer node. Old playlist UUID links show an unavailable
genre; there is no compatibility alias or `detailGenre` parameter.

A genre loads through its detail endpoint even when it is absent from the visible
tree, has no playlist, or has no geographic association. Loading and errors retain
a closable panel. Choosing the same genre again reopens a collapsed panel.

Map `region=<Wikidata ID>` is optional geographic context. An explicit genre takes
precedence over the region overview, and family navigation preserves the region
and camera. Closing the genre returns to the region overview when one is selected.

Regional genre discovery uses remote genre search, independent of the map lexicon.
Genre results open in the current view; place results keep geographic navigation.
Artist filters remain in tree URLs when a genre is selected.

This frontend change requires the coordinated app-kit entity-selection changes.
Validate with locally packed shared packages until that dependency is available;
package publication and application releases are separate operations.
