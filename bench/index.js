/* global maplibregl, MapLibreDraw */
try {
  main();
} catch (err) {
  log("red", err.toString());
  throw err;
}

function main() {
  const benchmarks = {
    simple_select_small: require("./tests/simple_select_small").Benchmark,
    simple_select_large: require("./tests/simple_select_large").Benchmark,
    simple_select_large_two_maps:
      require("./tests/simple_select_large_two_maps").Benchmark,
    simple_select_large_zoomed:
      require("./tests/simple_select_large_zoomed").Benchmark,

    direct_select_small: require("./tests/direct_select_small").Benchmark,
    direct_select_small_zoomed:
      require("./tests/direct_select_small_zoomed").Benchmark,
    direct_select_large: require("./tests/direct_select_large").Benchmark,
    direct_select_large_zoomed:
      require("./tests/direct_select_large_zoomed").Benchmark,

    draw_line_string_small: require("./tests/draw_line_string_small").Benchmark,
    draw_line_string_large: require("./tests/draw_line_string_large").Benchmark,
    draw_line_string_large_zoomed:
      require("./tests/draw_line_string_large_zoomed").Benchmark,

    draw_polygon_small: require("./tests/draw_polygon_small").Benchmark,
    draw_polygon_large: require("./tests/draw_polygon_large").Benchmark,
    draw_polygon_large_zoomed:
      require("./tests/draw_polygon_large_zoomed").Benchmark,

    draw_land_polygon_small:
      require("./tests/draw_land_polygon_small").Benchmark,
    draw_land_polygon_large:
      require("./tests/draw_land_polygon_large").Benchmark,

    draw_urban_areas_polygon_small:
      require("./tests/draw_urban_areas_polygon_small").Benchmark,
    draw_urban_areas_polygon_large:
      require("./tests/draw_urban_areas_polygon_large").Benchmark,

    draw_point_small: require("./tests/draw_point_small").Benchmark,
    draw_point_large: require("./tests/draw_point_large").Benchmark,
    draw_point_large_zoomed:
      require("./tests/draw_point_large_zoomed").Benchmark,
  };

  const benchmarkName = location.hash.substr(1);
  console.warn(benchmarkName);

  const testDiv = document.getElementById("tests");
  const tests = Object.keys(benchmarks);

  let innerHTML = "";

  tests.forEach((test) => {
    innerHTML += '<div class="test">';
    innerHTML += `<a href="#${test}">${test}</a>`;
    innerHTML += "</div>";
    if (test === benchmarkName) {
      innerHTML += '<div id="logs"></div>';
    }
  });

  testDiv.innerHTML = innerHTML;

  window.addEventListener("hashchange", () => location.reload(), false);

  log(
    "dark",
    "please keep this window in the foreground and close the debugger",
  );

  const Benchmark = benchmarks[benchmarkName];
  if (!Benchmark) {
    log("dark", `${benchmarkName} is not a valid test name`);
    return;
  }

  const bench = new Benchmark({
    createMap,
  });

  bench.on("log", (event) => {
    log(event.color || "blue", event.message);
  });

  bench.on("pass", (event) => {
    log("green", `<strong class="prose-big">${event.message}</strong>`);
  });

  bench.on("fail", (event) => {
    log("red", `<strong class="prose-big">${event.message}</strong>`);
  });
}

function log(color, message) {
  document.getElementById("logs").innerHTML +=
    `<div class="log dark fill-${color}"><p>${message}</p></div>`;
}

function createMap(options) {
  const mapElement = document.getElementById("map");

  options = Object.assign({ width: 512, height: 512 }, options);

  mapElement.style.display = "block";
  mapElement.style.width = `${options.width}px`;
  mapElement.style.height = `${options.height}px`;

  const map = new maplibregl.Map(
    Object.assign(
      {
        container: "map",
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      },
      options,
    ),
  );

  const draw = new MapLibreDraw(options);

  map.addControl(draw);

  return {
    draw,
    map,
  };
}
