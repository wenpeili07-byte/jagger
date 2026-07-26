import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const readOptional = (path) => {
  const target = new URL(path, import.meta.url);
  return existsSync(target) ? readFileSync(target, "utf8") : "";
};
const html = readOptional("./pages/project.html");
const source = readOptional("./project.js");
const css = readOptional("./project.css");

class PlannerNode {
  constructor({ checked = false, dataset = {}, value = "" } = {}) {
    this.attributes = new Map();
    this.checked = checked;
    this.dataset = { ...dataset };
    this.disabled = false;
    this.hidden = false;
    this.href = "";
    this.listeners = new Map();
    this.textContent = "";
    this.value = value;
  }

  addEventListener(name, listener) {
    const listeners = this.listeners.get(name) ?? [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }

  dispatch(name) {
    for (const listener of this.listeners.get(name) ?? []) {
      listener({ currentTarget: this, target: this });
    }
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  toggleAttribute(name, enabled) {
    if (enabled) this.attributes.set(name, "");
    else this.attributes.delete(name);
  }
}

function createPlannerHarness(search = "") {
  const steps = Array.from({ length: 4 }, (_, index) =>
    new PlannerNode({ dataset: { plannerStep: String(index) } })
  );
  const progress = Array.from({ length: 4 }, (_, index) =>
    new PlannerNode({ dataset: { progressStep: String(index) } })
  );
  const vehicle = {
    make: new PlannerNode({ value: "BMW" }),
    model: new PlannerNode({ value: "G80 M3" }),
    chassis: new PlannerNode({ value: "G8X" }),
    year: new PlannerNode({ value: "2024" }),
  };
  const goals = [
    new PlannerNode({ checked: true, value: "street" }),
    new PlannerNode({ value: "road-track" }),
    new PlannerNode({ value: "show" }),
  ];
  const directions = ["build", "parts", "photo", "ecu", "chassis", "exhaust"].map(
    (value) => new PlannerNode({ value })
  );
  const back = new PlannerNode();
  const next = new PlannerNode();
  const submit = new PlannerNode();
  const error = new PlannerNode();
  const reviewVehicle = new PlannerNode();
  const reviewGoal = new PlannerNode();
  const reviewDirections = new PlannerNode();
  const reviewProduct = new PlannerNode();
  const reviewProductRow = new PlannerNode();
  const langToggle = new PlannerNode();
  const singleNodes = new Map([
    ["[data-project-planner]", new PlannerNode()],
    ["[data-vehicle-make]", vehicle.make],
    ["[data-vehicle-model]", vehicle.model],
    ["[data-vehicle-chassis]", vehicle.chassis],
    ["[data-vehicle-year]", vehicle.year],
    ["[data-planner-back]", back],
    ["[data-planner-next]", next],
    ["[data-planner-submit]", submit],
    ["[data-project-error]", error],
    ["[data-review-vehicle]", reviewVehicle],
    ["[data-review-goal]", reviewGoal],
    ["[data-review-directions]", reviewDirections],
    ["[data-review-product]", reviewProduct],
    ["[data-review-product-row]", reviewProductRow],
    [".lang-toggle", langToggle],
  ]);
  const document = {
    documentElement: { lang: "en" },
    querySelector: (selector) => singleNodes.get(selector) ?? null,
    querySelectorAll(selector) {
      if (selector === "[data-planner-step]") return steps;
      if (selector === "[data-progress-step]") return progress;
      if (selector === 'input[name="goal"]') return goals;
      if (selector === ".project-direction-grid input") return directions;
      return [];
    },
  };
  langToggle.addEventListener("click", () => {
    document.documentElement.lang = document.documentElement.lang === "en" ? "zh-CN" : "en";
  });
  const testBridge = {};
  const window = {
    location: { href: "", search },
    LonmaPlannerTest: testBridge,
  };

  vm.runInNewContext(source, { URLSearchParams, document, window });

  return {
    back,
    directions,
    document,
    error,
    goals,
    langToggle,
    next,
    progress,
    reviewDirections,
    reviewGoal,
    reviewProduct,
    reviewProductRow,
    reviewVehicle,
    steps,
    submit,
    testBridge,
    vehicle,
    window,
  };
}

test("planner exposes four bilingual steps and one primary handoff", () => {
  assert.equal((html.match(/data-planner-step=/g) || []).length, 4);
  assert.match(html, /data-en="VEHICLE" data-zh="车辆"/);
  assert.match(html, /data-en="GOAL" data-zh="目标"/);
  assert.match(html, /data-en="DIRECTION" data-zh="方向"/);
  assert.match(html, /data-en="REVIEW" data-zh="确认"/);
  assert.equal((html.match(/data-planner-submit/g) || []).length, 1);
  assert.match(html, /assets\/images\/网页\/optimized\/case-01\.jpg/);
});

test("planner query selections are bounded, cleaned, and preselect parts", () => {
  const longProduct = "x".repeat(140);
  const harness = createPlannerHarness(
    `?direction=parts&product=${longProduct}%0Aunsafe&finish=Satin%0ABlack&quantity=1234567890`
  );
  const state = harness.testBridge.getState();

  assert.deepEqual([...state.directions], ["parts"]);
  assert.equal(harness.directions.find((node) => node.value === "parts").checked, true);
  assert.equal(state.product.includes("\n"), false);
  assert.match(state.product, /^x{120}, Finish: Satin Black, Quantity: 12345678$/);
});

test("planner hydrates a bounded vehicle from the Add to Build query", () => {
  const configured = createPlannerHarness(
    "?vehicle=2025%00BMW%09G82%20M4%0AG8X&direction=parts"
  );

  assert.deepEqual(
    { ...configured.testBridge.getState().vehicle },
    { make: "BMW", model: "G82 M4", chassis: "G8X", year: "2025" }
  );
  assert.deepEqual(
    Object.fromEntries(Object.entries(configured.vehicle).map(([key, node]) => [key, node.value])),
    { make: "BMW", model: "G82 M4", chassis: "G8X", year: "2025" }
  );

  const bounded = createPlannerHarness(
    `?vehicle=2026%20BMW%20${"M".repeat(70)}%20G8X`
  );
  assert.equal(bounded.testBridge.getState().vehicle.model.length, 40);
  assert.equal(bounded.vehicle.model.value.length, 40);
});

test("planner review switches selected services and product labels to Chinese", () => {
  const query = new URLSearchParams({
    direction: "parts",
    product: "forged-wheel",
    diameter: "19 inch",
    width: "9.5J / 10.5J",
    finish: "Satin Black",
    quantity: "4",
  });
  const harness = createPlannerHarness(`?${query}`);

  harness.progress[3].dispatch("click");
  assert.equal(harness.reviewDirections.textContent, "Performance Parts");
  assert.equal(
    harness.reviewProduct.textContent,
    "Forged Wheel, Diameter: 19 inch, Width: 9.5J / 10.5J, Finish: Satin Black, Quantity: 4"
  );

  harness.langToggle.dispatch("click");
  assert.equal(harness.document.documentElement.lang, "zh-CN");
  assert.equal(harness.reviewGoal.textContent, "街道");
  assert.equal(harness.reviewDirections.textContent, "汽车配件");
  assert.equal(
    harness.reviewProduct.textContent,
    "锻造轮毂, 直径: 19 inch, 宽度: 9.5J / 10.5J, 颜色: 缎面黑, 数量: 4"
  );
  assert.match(harness.testBridge.getState().product, /forged-wheel/);
  assert.match(harness.testBridge.getState().product, /Satin Black/);
});

test("planner translates a visible validation error on language change", () => {
  const harness = createPlannerHarness();

  harness.vehicle.model.value = " ";
  harness.vehicle.model.dispatch("input");
  harness.next.dispatch("click");
  assert.equal(harness.error.textContent, "COMPLETE ALL VEHICLE FIELDS TO CONTINUE.");

  harness.langToggle.dispatch("click");
  assert.equal(harness.error.textContent, "请完整填写车辆资料后继续。");
});

test("inactive progress numbers stay neutral until current or complete", () => {
  assert.match(
    css,
    /\.project-progress button span:first-child\s*\{[^}]*color:\s*var\(--muted\)/s
  );
  assert.match(
    css,
    /\.project-progress button\[aria-current="step"\] span:first-child,\s*\.project-progress button\[data-complete\] span:first-child\s*\{[^}]*color:\s*var\(--accent-bright\)/s
  );
});

test("planner validates transitions and preserves browser-driven selections", () => {
  const harness = createPlannerHarness("?product=forged-wheel&finish=Satin%20Black");

  harness.vehicle.model.value = " ";
  harness.vehicle.model.dispatch("input");
  harness.next.dispatch("click");
  assert.equal(harness.testBridge.getState().step, 0);
  assert.match(harness.error.textContent, /vehicle/i);

  harness.vehicle.model.value = "G82 M4";
  harness.vehicle.model.dispatch("input");
  harness.next.dispatch("click");
  assert.equal(harness.testBridge.getState().step, 1);

  harness.goals[0].checked = false;
  harness.goals[1].checked = true;
  harness.goals[1].dispatch("change");
  harness.next.dispatch("click");
  assert.equal(harness.testBridge.getState().step, 2);

  harness.next.dispatch("click");
  assert.equal(harness.testBridge.getState().step, 2);
  assert.match(harness.error.textContent, /direction/i);

  const chassis = harness.directions.find((node) => node.value === "chassis");
  chassis.checked = true;
  chassis.dispatch("change");
  harness.next.dispatch("click");

  assert.equal(harness.testBridge.getState().step, 3);
  assert.equal(harness.reviewVehicle.textContent, "2024 BMW G82 M4 G8X");
  assert.equal(harness.reviewGoal.textContent, "ROAD & TRACK");
  assert.equal(harness.reviewDirections.textContent, "Chassis Setup");
  assert.equal(harness.reviewProduct.textContent, "Forged Wheel, Finish: Satin Black");
  assert.equal(harness.reviewProductRow.hidden, false);
  assert.equal(harness.steps[3].hidden, false);
  assert.equal(harness.steps[2].hidden, true);
  assert.equal(harness.progress[3].getAttribute("aria-current"), "step");

  const target = new URL(harness.submit.href, "https://example.test/pages/project.html");
  assert.equal(target.pathname, "/pages/contact.html");
  assert.equal(target.searchParams.get("vehicle"), "2024 BMW G82 M4 G8X");
  assert.equal(target.searchParams.get("service"), "Chassis Setup");
  assert.equal(target.searchParams.get("product"), "forged-wheel");
  assert.match(target.searchParams.get("message"), /Goal: ROAD & TRACK\./);
  assert.match(target.searchParams.get("message"), /forged-wheel/i);
  assert.match(target.searchParams.get("message"), /Satin Black/);

  harness.back.dispatch("click");
  harness.progress[3].dispatch("click");
  assert.equal(harness.testBridge.getState().goal, "road-track");
  assert.deepEqual([...harness.testBridge.getState().directions], ["chassis"]);
});

test("Audi product selection stays intact from planner review to contact", () => {
  const query = new URLSearchParams({
    vehicle: "2024 AUDI RS 5 B9.5",
    direction: "parts",
    product: "forged-wheel",
    diameter: "19 inch",
    width: "9.5J / 10.5J",
    finish: "Satin Black",
    quantity: "4",
  });
  const harness = createPlannerHarness(`?${query}`);

  harness.progress[3].dispatch("click");
  const target = new URL(harness.submit.href, "https://example.test/pages/project.html");

  assert.equal(harness.reviewVehicle.textContent, "2024 AUDI RS 5 B9.5");
  assert.equal(target.searchParams.get("vehicle"), "2024 AUDI RS 5 B9.5");
  assert.equal(target.searchParams.get("product"), "forged-wheel");
  assert.match(target.searchParams.get("message"), /Product selection: forged-wheel/);
});

test("planner submit click uses the allowlisted contact URL", () => {
  const harness = createPlannerHarness();
  const chassis = harness.directions.find((node) => node.value === "chassis");

  chassis.checked = true;
  chassis.dispatch("change");
  harness.testBridge.setStep(3);
  harness.submit.dispatch("click");

  assert.equal(harness.window.location.href, harness.submit.href);
  assert.doesNotMatch(harness.submit.href, /subject=|product=/);
});
