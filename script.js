const details = [
  {
    label: "CAR 01",
    title: "街道宽体案例",
    text: "以日常驾驶为基础，加入宽体外观、轮毂姿态和刹车升级，让整车视觉更有压迫感，同时保留通勤可用性。",
    counter: "01"
  },
  {
    label: "CAR 02",
    title: "赛道化升级案例",
    text: "围绕刹车热衰、底盘支撑、轻量化和轮胎抓地做系统升级，让车辆更适合高强度驾驶。",
    counter: "02"
  },
  {
    label: "CAR 03",
    title: "姿态低趴案例",
    text: "通过避震高度、轮毂数据和车身比例调整，把视觉重心压低，做出干净利落的街头姿态。",
    counter: "03"
  },
  {
    label: "CAR 04",
    title: "涡轮特调案例",
    text: "在硬件升级后重新梳理进气、排气、增压和 ECU 标定，让动力输出更饱满也更可控。",
    counter: "04"
  },
  {
    label: "CAR 05",
    title: "影像作品车案例",
    text: "以拍摄呈现为目标规划外观细节、灯光质感和成片风格，让改装成果更适合社媒传播。",
    counter: "05"
  },
  {
    label: "BUILD",
    title: "汽车改装",
    text: "从外观姿态、轮毂刹车到底盘和动力升级，为每台车制定兼顾审美、可靠性和驾驶感的改装方案。",
    counter: "S1"
  },
  {
    label: "PARTS",
    title: "汽车配件",
    text: "精选进气、排气、轮毂、刹车、避震和车身套件，按车型和使用场景推荐更匹配的升级组合。",
    counter: "S2"
  },
  {
    label: "PHOTO",
    title: "汽车摄影",
    text: "提供静态棚拍、街景跟拍、活动记录和成片调色，让改装成果被看见，也被记住。",
    counter: "S3"
  },
  {
    label: "ECU",
    title: "ECU 特调",
    text: "基于车辆硬件状态和驾驶需求做定制标定，优化动力响应、扭矩输出和日常可控性。",
    counter: "S4"
  },
  {
    label: "CHASSIS",
    title: "底盘设定",
    text: "针对街道、山路或赛道使用，调整避震、定位和制动脚感，让车更稳、更准、更听话。",
    counter: "S5"
  },
  {
    label: "EXHAUST",
    title: "进排气系统",
    text: "围绕声浪、流量和法规友好度选择方案，兼顾性能释放、质感和长期使用体验。",
    counter: "S6"
  }
];

const cards = [...document.querySelectorAll("[data-detail]")];
const rows = [...document.querySelectorAll(".roll-row")];
const activeLabel = document.querySelector("#activeLabel");
const detailTitle = document.querySelector("#detailTitle");
const detailText = document.querySelector("#detailText");
const stripCount = document.querySelector("#stripCount");
let activeIndex = 0;

function setActive(index) {
  activeIndex = (index + details.length) % details.length;
  const detail = details[activeIndex];

  cards.forEach((card) => {
    card.classList.toggle("is-active", Number(card.dataset.index) === activeIndex);
  });

  rows.forEach((row) => {
    row.classList.toggle("is-active", Number(row.dataset.index) === activeIndex);
  });

  activeLabel.textContent = detail.label;
  detailTitle.textContent = detail.title;
  detailText.textContent = detail.text;
  stripCount.textContent = detail.counter;
}

cards.forEach((card) => {
  const index = Number(card.dataset.index);
  card.addEventListener("mouseenter", () => setActive(index));
  card.addEventListener("focus", () => setActive(index));
  card.addEventListener("click", () => setActive(index));
});

rows.forEach((row) => {
  row.addEventListener("click", () => setActive(Number(row.dataset.index)));
});

document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => setActive(activeIndex + Number(button.dataset.step)));
});
