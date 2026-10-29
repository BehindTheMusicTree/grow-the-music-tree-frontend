import Page from "@components/ui/Page";
import RegionMapView from "@components/features/region-map/RegionMapView";

export default function RegionMapPage() {
  return (
    <Page title="Music by region" dataPage="map">
      <div className="h-[calc(100dvh-12rem)] min-h-96">
        <RegionMapView />
      </div>
    </Page>
  );
}
