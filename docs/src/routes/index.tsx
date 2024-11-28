export default function () {
  return (
    <>
      <div class="p-4">
        <h3 class="text-xl mb-4">Installation</h3>

        <div class="space-y-4">
          <div>
            <h4>Using JSR</h4>
            <pre class="bg-slate-200 p-2 rounded">
              <code>{`npx jsr add @birkskyum/maplibre-gl-draw
bunx jsr add @birkskyum/maplibre-gl-draw 
deno add jsr:@birkskyum/maplibre-gl-draw
pnpm dlx jsr add @birkskyum/maplibre-gl-draw
yarn dlx jsr add @birkskyum/maplibre-gl-draw`}</code>
            </pre>
          </div>

          <div>
            <h4>Using CDN</h4>
            <pre class="bg-slate-200 p-2 rounded">
              <code>{`<link rel="stylesheet" href="https://esm.sh/jsr/@birkskyum/maplibre-gl-draw@^2/dist/maplibre-gl-draw.css" />

import {MapLibreDraw} from 'https://esm.sh/jsr/@birkskyum/maplibre-gl-draw@^2';`}</code>
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
