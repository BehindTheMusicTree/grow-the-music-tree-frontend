import { Suspense } from "react";
import { Page } from "@behindthemusictree/ui";
import RegionMapView from "@components/features/region-map/RegionMapView";

export default function RegionMapPage() {
  return (
    <Page title="Music by region" layout="canvas" visuallyHiddenTitle data-page="map">
      <div className="h-full min-h-96">
        <Suspense>
          <RegionMapView />
        </Suspense>
      </div>
    </Page>
  );
}
