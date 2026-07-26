import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { caseDetails } from "./detail-pages-data.mjs";
import { renderCasePage } from "./scripts/render-detail-pages.mjs";

const html = readFileSync(new URL("./pages/cases/case-02.html", import.meta.url), "utf8");
const caseController = readFileSync(new URL("./case-02.js", import.meta.url), "utf8");

test("Case 02 opens with a poster-only native video stage", () => {
  assert.match(html, /class="case02-video-stage"/);
  assert.match(
    html,
    /<video[^>]*data-case-video[^>]*poster="[^"]*case-02\.jpg"[^>]*controls[^>]*preload="metadata"/s
  );
  assert.match(html, /data-video-state="poster-only"/);
  assert.match(html, /data-en="FINAL FILM COMING SOON"/);
  assert.doesNotMatch(html, /<video[^>]*autoplay/);
  assert.doesNotMatch(html, /<source/);
});

test("Case 02 is an image-led bilingual story", () => {
  assert.match(html, /data-en="THE DIRECTION"/);
  assert.match(html, /data-en="TEST, ADJUST, REPEAT"/);
  assert.equal((html.match(/class="case02-story-media/g) || []).length, 3);
  assert.equal((html.match(/loading="lazy"/g) || []).length, 3);
  assert.doesNotMatch(html, /PARTS USED|data-case-marker|data-case-part/);
});

test("Case 02 preserves archive, adjacent case, and inquiry links", () => {
  assert.match(html, /href="\.\.\/cases\.html"/);
  assert.match(html, /href="\.\/case-01\.html"/);
  assert.match(html, /href="\.\/case-03\.html"/);
  assert.match(
    html,
    /href="\.\.\/contact\.html\?service=Custom%20Vehicle%20Builds&amp;vehicle=2024%20BMW%20G80%20M3&amp;message=Case%2002%20road%20and%20track%20direction\."/
  );
});

test("Case 02 poster-only controller never attempts playback", () => {
  let playCalls = 0;
  const removedAttributes = new Set();
  const videoAttributes = new Map();
  const stage = { dataset: {} };
  const video = {
    currentSrc: "",
    play() {
      playCalls += 1;
    },
    querySelector() {
      return null;
    },
    removeAttribute(name) {
      removedAttributes.add(name);
    },
    setAttribute(name, value) {
      videoAttributes.set(name, value);
    },
  };
  const motionNodes = [{ dataset: {} }, { dataset: {} }, { dataset: {} }];
  const document = {
    querySelector(selector) {
      if (selector === ".case02-video-stage") return stage;
      if (selector === "[data-case-video]") return video;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".case02-story-beat, .case02-story-wide") return motionNodes;
      return [];
    },
  };

  vm.runInNewContext(caseController, {
    document,
    window: { matchMedia: () => ({ matches: false }) },
  });

  assert.equal(stage.dataset.videoState, "poster-only");
  assert.equal(playCalls, 0);
  assert.ok(removedAttributes.has("controls"));
  assert.equal(videoAttributes.get("aria-disabled"), "true");
  assert.deepEqual(motionNodes.map((node) => node.dataset.motion), ["fade", "fade", "fade"]);
});

test("other cases retain the generic template", () => {
  for (const record of caseDetails.filter((item) => item.id !== "02")) {
    const output = renderCasePage(record);
    assert.match(output, /class="detail-hero"/);
    assert.doesNotMatch(output, /case02-video-stage|case02-story/);
  }
});
