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
        assert.equal(live[1], decode(english[1]), `${path} should render English ${attribute} first`);
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
