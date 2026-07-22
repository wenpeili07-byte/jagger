import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicPages = [
  "./index.html",
  "./pages/about.html",
  "./pages/services.html",
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html",
  "./pages/cases.html",
  "./pages/cases/case-01.html",
  "./pages/cases/case-02.html",
  "./pages/cases/case-03.html",
  "./pages/cases/case-04.html",
  "./pages/cases/case-05.html",
  "./pages/cases/case-06.html",
  "./pages/contact.html",
];

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

test("all public pages ship English-first markup", () => {
  for (const path of publicPages) {
    const html = read(path);
    assert.match(html, /<html lang="en">/, `${path} should declare English`);
    assert.match(
      html,
      /<span class="lang-option is-current" data-lang-option="en">EN<\/span>/,
      `${path} should mark English current`,
    );
    assert.doesNotMatch(
      html,
      /<span class="lang-option is-current" data-lang-option="zh">中<\/span>/,
      `${path} should not mark Chinese current`,
    );

    const directBilingualNodes = [
      ...html.matchAll(/<([a-z][\w-]*)\b([^>]*\bdata-en="([^"]*)"[^>]*)>([^<]*)<\/\1>/gi),
    ];
    assert.ok(directBilingualNodes.length > 0, `${path} should expose bilingual direct text`);
    for (const match of directBilingualNodes) {
      assert.equal(match[4].trim(), decode(match[3]).trim(), `${path} should render data-en first`);
    }

    let translatableAttributeCount = 0;
    for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
      for (const attribute of ["placeholder", "aria-label", "alt"]) {
        const english = match[2].match(new RegExp(`\\bdata-en-${attribute}="([^"]*)"`));
        if (!english) {
          continue;
        }

        const live = match[2].match(new RegExp(`(?:^|\\s)${attribute}="([^"]*)"`));
        assert.ok(live, `${path} should expose a live ${attribute}`);
        assert.equal(decode(live[1]), decode(english[1]), `${path} should render English ${attribute} first`);
        translatableAttributeCount += 1;
      }
    }
    assert.ok(translatableAttributeCount > 0, `${path} should expose translatable live attributes`);
  }
});

test("language controllers keep preference within one tab only", () => {
  for (const path of ["./script.js", "./content-pages.js"]) {
    const source = read(path);
    assert.match(source, /sessionStorage\.getItem\("lonma-language"\)/);
    assert.match(source, /sessionStorage\.setItem\("lonma-language", language\)/);
    assert.doesNotMatch(source, /localStorage\.(?:getItem|setItem)\("lonma-language"/);
    assert.match(source, /supportedLanguages\.includes\(language\) \? language : "en"/);
  }
});

test("homepage uses canonical automotive service language", () => {
  const source = `${read("./index.html")}\n${read("./script.js")}`;
  for (const phrase of [
    "CORE SERVICES",
    "Custom Vehicle Builds",
    "Performance Parts",
    "Automotive Photography",
    "ECU Calibration",
    "Chassis Setup",
    "Intake & Exhaust",
  ]) {
    assert.match(source, new RegExp(phrase.replace(/[&]/g, "&(?:amp;)?"), "i"), `missing ${phrase}`);
  }
  for (const pattern of [
    /BUSINESS MODULES/i,
    /en:\s*"Automotive Photo"/i,
    /performance release/i,
    /road refinement/i,
  ]) {
    assert.doesNotMatch(source, pattern, `remove ${pattern}`);
  }
});

test("homepage runtime records keep the approved English automotive copy", () => {
  const source = read("./script.js");
  const detailsSource = source.slice(source.indexOf("const details = ["), source.indexOf("\n];", source.indexOf("const details = [")));
  const records = [...detailsSource.matchAll(/\n  \{([\s\S]*?)\n  \}(?:,|$)/g)].map((match) => match[1]);
  const englishValue = (record, field, label) => {
    const match = record.match(new RegExp(`(?:^|\\n)\\s{4}${field}:\\s*\\{[\\s\\S]*?\\ben:\\s*"([^"]*)"`));
    assert.ok(match, `missing runtime ${field} for ${label}`);
    return match[1];
  };
  const recordFor = (counter) => {
    const record = records.find((entry) => entry.includes(`counter: "${counter}"`));
    assert.ok(record, `missing runtime record ${counter}`);
    return record;
  };

  for (const { counter, title, text } of [
    {
      counter: "S1",
      title: "Custom Vehicle Builds",
      text: "Exterior, wheels, suspension, and braking upgrades developed around one complete vehicle.",
    },
    {
      counter: "S2",
      title: "Performance Parts",
      text: "A curated selection of performance, exterior, wheel, suspension, and OEM-grade components.",
    },
    {
      counter: "S3",
      title: "Automotive Photography",
      text: "Still photography, rolling shots, short films, and social content created around the car.",
    },
    {
      counter: "S4",
      title: "ECU Calibration",
      text: "Custom ECU calibration, data logging, road testing, and staged upgrade planning.",
    },
    {
      counter: "S5",
      title: "Chassis Setup",
      text: "Ride height, wheel fitment, alignment, and chassis settings for street or track use.",
    },
    {
      counter: "S6",
      title: "Intake & Exhaust",
      text: "Intake, downpipe, mid-pipe, and axle-back upgrades tuned for sound and response.",
    },
  ]) {
    const record = recordFor(counter);
    assert.equal(englishValue(record, "title", counter), title, `${counter} runtime service title`);
    assert.equal(englishValue(record, "text", counter), text, `${counter} runtime service summary`);
  }

  for (const { counter, title, text } of [
    {
      counter: "01",
      title: "Street Widebody",
      text: "A street-focused widebody build shaped around daily drivability, wheel fitment, braking, and a more assertive stance.",
    },
    {
      counter: "02",
      title: "Road & Track Setup",
      text: "Braking, chassis support, weight, and tire grip developed for repeatable performance on road and track.",
    },
    {
      counter: "03",
      title: "Low Stance",
      text: "Ride height, wheel fitment, and body clearance tuned together for a clean, usable low stance.",
    },
    {
      counter: "04",
      title: "Turbo Tuning",
      text: "Intake, exhaust, boost control, and ECU calibration matched for stronger, more predictable power delivery.",
    },
    {
      counter: "05",
      title: "Automotive Media Feature",
      text: "Exterior detail, lighting, location, and motion planned as one complete automotive media feature.",
    },
    {
      counter: "06",
      title: "Blue Performance Build",
      text: "Exterior, chassis, and power delivery developed around a single performance objective.",
    },
  ]) {
    const record = recordFor(counter);
    assert.equal(englishValue(record, "title", counter), title, `${counter} runtime case title`);
    assert.equal(englishValue(record, "text", counter), text, `${counter} runtime case summary`);
  }
});

test("editorial pages use the approved English copy system", () => {
  const about = read("./pages/about.html");
  const services = read("./pages/services.html");
  const cases = `${read("./pages/cases.html")}\n${read("./pages/cases.js")}`;
  const contact = read("./pages/contact.html");

  assert.match(about, /BUILT THROUGH ITERATION\./);
  assert.match(services, /FROM VISION TO COMPLETE BUILD/);
  assert.match(cases, /PROJECT ARCHIVE · LONMA ATTITUDE/);
  assert.match(cases, /ALL MAKES/);
  assert.match(cases, /MERCEDES-BENZ/);
  assert.doesNotMatch(cases, />BENZ</);
  assert.match(contact, /SEND PROJECT INQUIRY/);
  assert.match(contact, /WHAT DO YOU WANT TO CHANGE\?/);
});

test("detail sources retain every approved English canonical field", async () => {
  const { caseDetails, serviceDetails } = await import("./detail-pages-data.mjs");
  const approvedCases = [
    {
      id: "01",
      title: "STREET WIDEBODY",
      subtitle: "A VISUAL BENCHMARK FOR THE LONMA LINEUP",
      intro: "Body proportions, wheel fitment, and ride height establish one complete direction for a street-focused build.",
      story: "The process began with the car's overall silhouette. Each change was evaluated, test-fitted, and road-tested before becoming part of the final build.",
      meta: "LONMA DYNAMIC Case 01 STREET WIDEBODY focuses on body proportions, wheel fitment, and ride height.",
      primaryFocus: "body proportions, wheel fitment, and ride height",
    },
    {
      id: "02",
      title: "ROAD & TRACK SETUP",
      subtitle: "BALANCING ROAD AND TRACK",
      intro: "Braking, chassis feedback, and repeatable performance define a clearer road-and-track setup.",
      story: "There is no fixed answer. Vehicle feedback, tire condition, and real-world testing continue to shape each adjustment.",
      meta: "LONMA DYNAMIC Case 02 ROAD & TRACK SETUP focuses on braking, chassis feedback, and repeatable performance.",
      primaryFocus: "braking, chassis feedback, and repeatable performance",
    },
    {
      id: "03",
      title: "LOW STANCE",
      subtitle: "PROPORTION, RIDE HEIGHT, AND WHEEL FITMENT",
      intro: "Ride height, wheel fitment, and body clearance create a low, cohesive side profile.",
      story: "A low stance still has to work. Every change to ride height or fitment is checked for steering clearance, road usability, and visual balance.",
      meta: "LONMA DYNAMIC Case 03 LOW STANCE focuses on ride height, wheel fitment, and body clearance.",
      primaryFocus: "ride height, wheel fitment, and body clearance",
    },
    {
      id: "04",
      title: "TURBO TUNING",
      subtitle: "POWER DELIVERY AND ROAD TESTING",
      intro: "Staged calibration developed through vehicle health checks, data logging, and road testing.",
      story: "A calibration is not finished after one flash. Data logging, review, and road feedback determine each revision.",
      meta: "LONMA DYNAMIC Case 04 TURBO TUNING focuses on staged calibration, data logging, and road testing.",
      primaryFocus: "staged calibration, data logging, and road testing",
    },
    {
      id: "05",
      title: "AUTOMOTIVE MEDIA FEATURE",
      subtitle: "TURNING VEHICLE CHARACTER INTO VISUAL CONTENT",
      intro: "Still photography, rolling shots, and short films capture the finished car's stance and details.",
      story: "Automotive media is not an afterthought. Camera angle, location, and motion reveal the car's proportions and character.",
      meta: "LONMA DYNAMIC Case 05 AUTOMOTIVE MEDIA FEATURE focuses on still photography, rolling shots, and short films.",
      primaryFocus: "still photography, rolling shots, and short films",
    },
    {
      id: "06",
      title: "BLUE PERFORMANCE BUILD",
      subtitle: "ONE DIRECTION FOR PERFORMANCE AND DESIGN",
      intro: "Exterior, chassis, and power delivery are developed around one driving objective.",
      story: "A complete build is more than a parts list. The goal comes first, followed by repeated testing that keeps only the changes that improve the car.",
      meta: "LONMA DYNAMIC Case 06 BLUE PERFORMANCE BUILD focuses on exterior, chassis, and power delivery.",
      primaryFocus: "exterior, chassis, and power delivery",
    },
  ];

  const approvedServices = [
    {
      id: "build",
      title: "CUSTOM VEHICLE BUILDS",
      intro: "Exterior, wheels, suspension, and braking upgrades developed around one complete vehicle.",
      scope: "We begin with the goal and visual references, then select components, test-fit, adjust, and review them on the actual vehicle.",
      meta: "LONMA DYNAMIC CUSTOM VEHICLE BUILDS develops exterior, wheel, suspension, and braking upgrades around a complete vehicle.",
    },
    {
      id: "parts",
      title: "PERFORMANCE PARTS",
      intro: "Curated performance, exterior, wheel, suspension, and OEM-grade components selected for the vehicle.",
      scope: "We match each part to the platform, intended use, current setup, and complete build direction before installation.",
      meta: "LONMA DYNAMIC PERFORMANCE PARTS selects performance, exterior, wheel, suspension, and OEM-grade components for each vehicle.",
    },
    {
      id: "photo",
      title: "AUTOMOTIVE PHOTOGRAPHY",
      intro: "Still photography, rolling shots, short films, and social media content created around the car.",
      scope: "Location, timing, light, and vehicle presentation are planned as one visual direction across stills and motion.",
      meta: "LONMA DYNAMIC AUTOMOTIVE PHOTOGRAPHY creates stills, rolling shots, short films, and social media content around the car.",
    },
    {
      id: "ecu",
      title: "ECU CALIBRATION",
      intro: "Custom ECU calibration, data logging, road testing, and staged upgrade planning.",
      scope: "We confirm the vehicle's condition and performance goals first, then refine throttle response and power delivery through data and road testing.",
      meta: "LONMA DYNAMIC ECU CALIBRATION focuses on custom calibration, data logging, road testing, and staged upgrades.",
    },
    {
      id: "chassis",
      title: "CHASSIS SETUP",
      intro: "Ride height, wheel fitment, alignment, and chassis settings for street or track use.",
      scope: "Ride height, clearance, and alignment are adjusted from real vehicle feedback so the stance supports both appearance and driving goals.",
      meta: "LONMA DYNAMIC CHASSIS SETUP focuses on ride height, wheel fitment, alignment, and chassis settings for road or track use.",
    },
    {
      id: "exhaust",
      title: "INTAKE & EXHAUST",
      intro: "Intake, downpipe, mid-pipe, and axle-back upgrades for sound, flow, and response.",
      scope: "We select and review each combination around the desired sound, intended road use, and current powertrain setup.",
      meta: "LONMA DYNAMIC INTAKE & EXHAUST focuses on intake, downpipe, mid-pipe, and axle-back upgrades for sound, flow, and response.",
    },
  ];

  assert.deepEqual(
    caseDetails.map(({ id, title, subtitle, intro, story, meta }) => ({
      id,
      title: title.en,
      subtitle: subtitle.en,
      intro: intro.en,
      story: story.en,
      meta,
    })),
    approvedCases.map(({ primaryFocus, ...record }) => record),
  );
  assert.deepEqual(
    serviceDetails.map(({ id, title, intro, scope, meta }) => ({
      id,
      title: title.en,
      intro: intro.en,
      scope: scope.en,
      meta,
    })),
    approvedServices,
  );

  for (const { id, title, primaryFocus, meta } of approvedCases) {
    const record = caseDetails.find((candidate) => candidate.id === id);
    assert.equal(record.meta, meta, `${id} meta should match the approved fixture`);
    assert.ok(record.meta.includes("LONMA DYNAMIC"), `${id} meta should name LONMA DYNAMIC`);
    assert.ok(record.meta.includes(id), `${id} meta should contain its two-digit case number`);
    assert.ok(record.meta.includes(title), `${id} meta should contain its approved title`);
    assert.ok(record.meta.includes(primaryFocus), `${id} meta should contain its primary technical focus`);
  }
});

test("service detail renderer keeps the approved process line", async () => {
  const { serviceDetails } = await import("./detail-pages-data.mjs");
  const { renderServicePage } = await import("./scripts/render-detail-pages.mjs");
  assert.match(
    renderServicePage(serviceDetails[0]),
    /<p class="detail-process" data-zh="[^"]+" data-en="ASSESS · PLAN · EXECUTE · VERIFY">ASSESS · PLAN · EXECUTE · VERIFY<\/p>/,
  );
});
