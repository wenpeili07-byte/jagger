export const caseDetails = [
  {
    id: "01",
    slug: "street-widebody",
    title: { zh: "街道宽体", en: "STREET WIDEBODY" },
    subtitle: { zh: "车队视觉基准案例", en: "A VISUAL BENCHMARK FOR THE LONMA LINEUP" },
    intro: {
      zh: "从车身比例、轮毂姿态到底盘高度，记录一台街道项目车的完整视觉方向。",
      en: "Body proportions, wheel fitment, and ride height establish one complete direction for a street-focused build.",
    },
    story: {
      zh: "这台车的调整从整体轮廓开始。每一次修改都经过观察、试装与道路使用，再保留真正适合车辆的部分。",
      en: "The process began with the car's overall silhouette. Each change was evaluated, test-fitted, and road-tested before becoming part of the final build.",
    },
    meta: "LONMA DYNAMIC Case 01 STREET WIDEBODY focuses on body proportions, wheel fitment, and ride height.",
    image: "assets/images/网页/optimized/case-01.jpg",
    previous: "06",
    next: "02",
  },
  {
    id: "02",
    slug: "track-setup",
    title: { zh: "赛道化升级", en: "ROAD & TRACK SETUP" },
    subtitle: { zh: "街道与赛道之间的平衡", en: "BALANCING ROAD AND TRACK" },
    intro: {
      zh: "围绕制动、底盘反馈与持续驾驶需求，整理更明确的性能升级方向。",
      en: "Braking, chassis feedback, and repeatable performance define a clearer road-and-track setup.",
    },
    story: {
      zh: "设定并不追求一组固定答案。车辆反馈、轮胎状态和实际道路会不断改变下一步调整。",
      en: "There is no fixed answer. Vehicle feedback, tire condition, and real-world testing continue to shape each adjustment.",
    },
    meta: "LONMA DYNAMIC Case 02 ROAD & TRACK SETUP focuses on braking, chassis feedback, and repeatable performance.",
    image: "assets/images/网页/optimized/case-02.jpg",
    partsUsed: [
      {
        number: "01",
        category: "brakes",
        label: { en: "BRAKES", zh: "刹车" },
        title: { en: "BRAKE SYSTEM", zh: "刹车系统" },
        note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
        image: "assets/images/shop/brake-kit.webp",
      },
      {
        number: "02",
        category: "suspension",
        label: { en: "SUSPENSION", zh: "避震" },
        title: { en: "CHASSIS CONTROL", zh: "底盘控制" },
        note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
        image: "assets/images/shop/coilover-kit.webp",
      },
      {
        number: "03",
        category: "wheels",
        label: { en: "WHEELS", zh: "轮毂" },
        title: { en: "WHEEL FITMENT", zh: "轮毂数据" },
        note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
        image: "assets/images/shop/forged-wheel.webp",
      },
      {
        number: "04",
        category: "ecu",
        label: { en: "PERFORMANCE", zh: "动力" },
        title: { en: "ECU CALIBRATION", zh: "ECU 特调" },
        note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
        image: "assets/images/网页/optimized/case-04.jpg",
      },
    ],
    previous: "01",
    next: "03",
  },
  {
    id: "03",
    slug: "low-stance",
    title: { zh: "姿态低趴", en: "LOW STANCE" },
    subtitle: { zh: "比例、车高与轮毂关系", en: "PROPORTION, RIDE HEIGHT, AND WHEEL FITMENT" },
    intro: {
      zh: "通过车高、轮毂数据与车身间隙，建立低而完整的侧面比例。",
      en: "Ride height, wheel fitment, and body clearance create a low, cohesive side profile.",
    },
    story: {
      zh: "低姿态仍然需要真实使用。每一次降低和数据变化，都要重新检查转向、通过性与视觉平衡。",
      en: "A low stance still has to work. Every change to ride height or fitment is checked for steering clearance, road usability, and visual balance.",
    },
    meta: "LONMA DYNAMIC Case 03 LOW STANCE focuses on ride height, wheel fitment, and body clearance.",
    image: "assets/images/网页/optimized/case-03.jpg",
    previous: "02",
    next: "04",
  },
  {
    id: "04",
    slug: "turbo-tune",
    title: { zh: "涡轮特调", en: "TURBO TUNING" },
    subtitle: { zh: "动力响应与道路优化", en: "POWER DELIVERY AND ROAD TESTING" },
    intro: {
      zh: "结合车辆状态、数据记录与道路反馈，规划阶段性的动力响应升级。",
      en: "Staged calibration developed through vehicle health checks, data logging, and road testing.",
    },
    story: {
      zh: "程序不是一次写入后的结束。记录、复查与道路反馈共同决定下一次修正。",
      en: "A calibration is not finished after one flash. Data logging, review, and road feedback determine each revision.",
    },
    meta: "LONMA DYNAMIC Case 04 TURBO TUNING focuses on staged calibration, data logging, and road testing.",
    image: "assets/images/网页/optimized/case-04.jpg",
    previous: "03",
    next: "05",
  },
  {
    id: "05",
    slug: "photo-feature",
    title: { zh: "影像作品车", en: "AUTOMOTIVE MEDIA FEATURE" },
    subtitle: { zh: "车辆状态转化为视觉内容", en: "TURNING VEHICLE CHARACTER INTO VISUAL CONTENT" },
    intro: {
      zh: "以静态、Rolling Shot 与短视频记录车辆完成后的姿态和细节。",
      en: "Still photography, rolling shots, and short films capture the finished car's stance and details.",
    },
    story: {
      zh: "影像不是改装结束后的附加项。拍摄角度、场地和运动方式会重新解释车辆的比例与性格。",
      en: "Automotive media is not an afterthought. Camera angle, location, and motion reveal the car's proportions and character.",
    },
    meta: "LONMA DYNAMIC Case 05 AUTOMOTIVE MEDIA FEATURE focuses on still photography, rolling shots, and short films.",
    image: "assets/images/网页/optimized/case-05.jpg",
    previous: "04",
    next: "06",
  },
  {
    id: "06",
    slug: "blue-performance",
    title: { zh: "蓝色性能车", en: "BLUE PERFORMANCE BUILD" },
    subtitle: { zh: "统一性能与视觉方向", en: "ONE DIRECTION FOR PERFORMANCE AND DESIGN" },
    intro: {
      zh: "让外观、底盘与动力响应围绕同一驾驶目标协同调整。",
      en: "Exterior, chassis, and power delivery are developed around one driving objective.",
    },
    story: {
      zh: "完整项目不是零件数量的叠加。先确定目标，再通过多次测试保留真正改善车辆的变化。",
      en: "A complete build is more than a parts list. The goal comes first, followed by repeated testing that keeps only the changes that improve the car.",
    },
    meta: "LONMA DYNAMIC Case 06 BLUE PERFORMANCE BUILD focuses on exterior, chassis, and power delivery.",
    image: "assets/images/网页/optimized/case-06.jpg",
    previous: "05",
    next: "01",
  },
];

export const serviceDetails = [
  {
    id: "build",
    number: "01",
    label: "BUILD",
    title: { zh: "汽车改装", en: "CUSTOM VEHICLE BUILDS" },
    intro: {
      zh: "外观、轮毂、避震、刹车与整车风格升级方案。",
      en: "Exterior, wheels, suspension, and braking upgrades developed around one complete vehicle.",
    },
    scope: {
      zh: "从目标沟通和视觉参考开始，结合车辆状态完成选型、试装、调整与最终复查。",
      en: "We begin with the goal and visual references, then select components, test-fit, adjust, and review them on the actual vehicle.",
    },
    meta: "LONMA DYNAMIC CUSTOM VEHICLE BUILDS develops exterior, wheel, suspension, and braking upgrades around a complete vehicle.",
    image: "assets/images/网页/optimized/case-01.jpg",
  },
  {
    id: "parts",
    number: "02",
    label: "PARTS",
    title: { zh: "汽车配件", en: "PERFORMANCE PARTS" },
    intro: {
      zh: "性能件、外观件、轮毂、避震与品牌配件选型供应。",
      en: "Curated performance, exterior, wheel, suspension, and OEM-grade components selected for the vehicle.",
    },
    scope: {
      zh: "根据车型、目标和现有配置筛选合适部件，并在安装前确认兼容性与整体方向。",
      en: "We match each part to the platform, intended use, current setup, and complete build direction before installation.",
    },
    meta: "LONMA DYNAMIC PERFORMANCE PARTS selects performance, exterior, wheel, suspension, and OEM-grade components for each vehicle.",
    image: "assets/images/网页/optimized/case-02.jpg",
  },
  {
    id: "photo",
    number: "03",
    label: "PHOTO",
    title: { zh: "汽车摄影", en: "AUTOMOTIVE PHOTOGRAPHY" },
    intro: {
      zh: "静态拍摄、Rolling Shot、短视频与社交媒体内容制作。",
      en: "Still photography, rolling shots, short films, and social media content created around the car.",
    },
    scope: {
      zh: "从场景、时间与车辆状态出发，规划静态、动态和短视频内容的统一视觉。",
      en: "Location, timing, light, and vehicle presentation are planned as one visual direction across stills and motion.",
    },
    meta: "LONMA DYNAMIC AUTOMOTIVE PHOTOGRAPHY creates stills, rolling shots, short films, and social media content around the car.",
    image: "assets/images/网页/optimized/case-03.jpg",
  },
  {
    id: "ecu",
    number: "04",
    label: "ECU",
    title: { zh: "ECU 特调", en: "ECU CALIBRATION" },
    intro: {
      zh: "动力程序、数据记录、道路优化与 Stage 方案规划。",
      en: "Custom ECU calibration, data logging, road testing, and staged upgrade planning.",
    },
    scope: {
      zh: "先确认车辆状态和升级目标，再通过数据与道路反馈逐步修正动力响应。",
      en: "We confirm the vehicle's condition and performance goals first, then refine throttle response and power delivery through data and road testing.",
    },
    meta: "LONMA DYNAMIC ECU CALIBRATION focuses on custom calibration, data logging, road testing, and staged upgrades.",
    image: "assets/images/网页/optimized/case-04.jpg",
  },
  {
    id: "chassis",
    number: "05",
    label: "CHASSIS",
    title: { zh: "底盘设定", en: "CHASSIS SETUP" },
    intro: {
      zh: "车高、轮毂数据、定位与街道 / 赛道驾驶设定。",
      en: "Ride height, wheel fitment, alignment, and chassis settings for street or track use.",
    },
    scope: {
      zh: "通过实际车辆反馈调整车高、间隙和定位，让视觉比例与驾驶目标保持一致。",
      en: "Ride height, clearance, and alignment are adjusted from real vehicle feedback so the stance supports both appearance and driving goals.",
    },
    meta: "LONMA DYNAMIC CHASSIS SETUP focuses on ride height, wheel fitment, alignment, and chassis settings for road or track use.",
    image: "assets/images/网页/optimized/case-05.jpg",
  },
  {
    id: "exhaust",
    number: "06",
    label: "EXHAUST",
    title: { zh: "进排气", en: "INTAKE & EXHAUST" },
    intro: {
      zh: "进气、头段、中尾段、声浪与动力响应升级。",
      en: "Intake, downpipe, mid-pipe, and axle-back upgrades for sound, flow, and response.",
    },
    scope: {
      zh: "围绕声音目标、道路使用和现有动力配置，选择并复查适合车辆的组合。",
      en: "We select and review each combination around the desired sound, intended road use, and current powertrain setup.",
    },
    meta: "LONMA DYNAMIC INTAKE & EXHAUST focuses on intake, downpipe, mid-pipe, and axle-back upgrades for sound, flow, and response.",
    image: "assets/images/网页/optimized/case-06.jpg",
  },
];

// "Shop the build" tags shown on case detail pages. Categories come from each
// case's own copy and are presented as category references, not exact part
// numbers. x / y are percentages of the cover photo (only where the part is
// actually visible in that photo).
export const caseBuildCatalog = {
  brakes: {
    note: { zh: "制动力、热衰减与踏板脚感，决定车辆能否稳定地重复每一圈。", en: "Braking force, fade resistance, and pedal feel decide whether a car can repeat every lap with confidence." },
    label: { zh: "刹车", en: "BRAKES" },
    title: { zh: "刹车系统", en: "BRAKE SYSTEM" },
    href: "../shop.html?category=brakes",
    image: "assets/images/shop/brake-kit.webp",
    kind: "shop",
  },
  suspension: {
    note: { zh: "车高、阻尼与几何设定共同决定底盘反馈，也决定日常道路的可用性。", en: "Ride height, damping, and geometry shape chassis feedback and everyday road usability." },
    label: { zh: "避震", en: "SUSPENSION" },
    title: { zh: "底盘控制", en: "CHASSIS CONTROL" },
    href: "../shop.html?category=suspension",
    image: "assets/images/shop/coilover-kit.webp",
    kind: "shop",
  },
  wheels: {
    note: { zh: "尺寸、偏距与重量影响姿态与操控，需要与刹车间隙和轮胎一起确认。", en: "Size, offset, and weight affect stance and handling, and are confirmed together with brake clearance and tires." },
    label: { zh: "轮毂", en: "WHEELS" },
    title: { zh: "锻造轮毂", en: "FORGED WHEELS" },
    href: "../shop.html?category=wheels",
    image: "assets/images/shop/forged-wheel.webp",
    kind: "shop",
  },
  aero: {
    note: { zh: "前唇、侧裙与尾翼统一车身比例，也影响高速时的稳定性。", en: "Splitters, skirts, and wings unify the body proportions and influence high-speed stability." },
    label: { zh: "空力", en: "AERO" },
    title: { zh: "碳纤维空力", en: "CARBON AERO" },
    href: "../shop.html?category=aero",
    image: "assets/images/shop/carbon-aero.webp",
    kind: "shop",
  },
  intake: {
    note: { zh: "进气系统影响响应与声浪，需要与 ECU 标定一起考虑。", en: "Intake changes response and sound, and is considered together with ECU calibration." },
    label: { zh: "进气", en: "INTAKE" },
    title: { zh: "进气系统", en: "INTAKE SYSTEM" },
    href: "../shop.html?category=intake",
    image: "assets/images/shop/carbon-intake.webp",
    kind: "shop",
  },
  ecu: {
    note: { zh: "分阶段标定，通过数据记录与道路测试逐步确认。", en: "Staged calibration, confirmed step by step through data logging and road testing." },
    label: { zh: "动力", en: "PERFORMANCE" },
    title: { zh: "ECU 特调", en: "ECU CALIBRATION" },
    href: "../services/ecu.html",
    image: "assets/images/网页/optimized/case-04.jpg",
    kind: "service",
  },
  exhaust: {
    note: { zh: "排气系统影响声浪与排气效率，需要与道路使用和动力配置一起确认。", en: "Exhaust shapes sound and flow, and is confirmed against road use and the current powertrain." },
    label: { zh: "排气", en: "EXHAUST" },
    title: { zh: "排气系统", en: "EXHAUST SYSTEM" },
    href: "../shop.html?category=exhaust",
    image: "assets/images/shop/performance-exhaust.webp",
    kind: "shop",
  },
  photo: {
    note: { zh: "机位、场地与运动镜头，把整车的比例与性格记录下来。", en: "Camera angle, location, and motion record the car’s proportions and character." },
    label: { zh: "影像", en: "MEDIA" },
    title: { zh: "汽车影像", en: "AUTOMOTIVE MEDIA" },
    href: "../services/photo.html",
    image: "assets/images/网页/optimized/case-05.jpg",
    kind: "service",
  },
};

export const caseBuildTags = {
  "01": [{ key: "aero" }, { key: "wheels" }, { key: "suspension" }],
  "02": [
    { key: "brakes", x: 11, y: 69 },
    { key: "suspension", x: 31, y: 71 },
    { key: "wheels", x: 90, y: 69 },
    { key: "ecu", x: 50, y: 50 },
  ],
  "03": [
    { key: "wheels", x: 8, y: 60 },
    { key: "suspension", x: 55, y: 71 },
  ],
  "04": [
    { key: "intake", x: 62, y: 66 },
    { key: "ecu", x: 40, y: 22 },
  ],
  "05": [{ key: "photo" }],
  "06": [{ key: "aero" }, { key: "suspension" }, { key: "ecu" }],
};

// Service detail extras. Included items, focus and method are taken from each
// service's own intro / scope copy; related cases come from caseBuildTags.
export const serviceProcess = [
  { kicker: { zh: "评估", en: "ASSESS" }, title: { zh: "目标与车辆状态", en: "GOAL AND VEHICLE CONDITION" }, body: { zh: "沟通目标，确认车辆状态与现有配置。", en: "We discuss the goal and confirm the vehicle's condition and current setup." } },
  { kicker: { zh: "规划", en: "PLAN" }, title: { zh: "方向与顺序", en: "DIRECTION AND SEQUENCE" }, body: { zh: "确定方向、部件与执行顺序。", en: "We agree on the direction, the components, and the order of work." } },
  { kicker: { zh: "执行", en: "EXECUTE" }, title: { zh: "安装、标定或拍摄", en: "INSTALL, CALIBRATE, OR SHOOT" }, body: { zh: "按计划执行，并记录每一步。", en: "The work is carried out as planned, with every step documented." } },
  { kicker: { zh: "复查", en: "VERIFY" }, title: { zh: "实车反馈", en: "REAL VEHICLE FEEDBACK" }, body: { zh: "根据实车反馈调整，直到完成交付。", en: "We adjust from real vehicle feedback until the car is handed over." } },
];

export const serviceExtras = {
  build: {
    included: [
      { zh: "外观", en: "EXTERIOR" },
      { zh: "轮毂", en: "WHEELS" },
      { zh: "避震", en: "SUSPENSION" },
      { zh: "刹车", en: "BRAKES" },
    ],
    focus: { zh: "整车风格升级", en: "One complete vehicle" },
    method: { zh: "选型 · 试装 · 复查", en: "Select · test-fit · review" },
    keys: ["aero", "wheels", "suspension", "brakes"],
    shop: ["aero", "wheels", "suspension", "brakes"],
  },
  parts: {
    included: [
      { zh: "性能件", en: "PERFORMANCE" },
      { zh: "外观件", en: "EXTERIOR" },
      { zh: "轮毂与避震", en: "WHEELS & SUSPENSION" },
      { zh: "品牌配件", en: "OEM-GRADE COMPONENTS" },
    ],
    focus: { zh: "按车型选型", en: "Matched to the platform" },
    method: { zh: "安装前确认兼容性", en: "Compatibility checked first" },
    keys: ["aero", "wheels", "suspension", "brakes", "intake"],
    shop: ["wheels", "brakes", "suspension", "aero"],
  },
  photo: {
    included: [
      { zh: "静态拍摄", en: "STILLS" },
      { zh: "Rolling Shot", en: "ROLLING SHOTS" },
      { zh: "短视频", en: "SHORT FILMS" },
      { zh: "社交媒体内容", en: "SOCIAL CONTENT" },
    ],
    focus: { zh: "统一视觉", en: "One visual direction" },
    method: { zh: "场景 · 时间 · 光线", en: "Location · timing · light" },
    keys: ["photo"],
    shop: [],
  },
  ecu: {
    included: [
      { zh: "动力程序", en: "CUSTOM CALIBRATION" },
      { zh: "数据记录", en: "DATA LOGGING" },
      { zh: "道路优化", en: "ROAD TESTING" },
      { zh: "Stage 方案规划", en: "STAGED UPGRADE PLANNING" },
    ],
    focus: { zh: "动力响应", en: "Power delivery" },
    method: { zh: "数据 + 道路测试", en: "Data + road testing" },
    keys: ["ecu", "intake"],
    shop: ["intake", "exhaust"],
  },
  chassis: {
    included: [
      { zh: "车高", en: "RIDE HEIGHT" },
      { zh: "轮毂数据", en: "WHEEL FITMENT" },
      { zh: "定位", en: "ALIGNMENT" },
      { zh: "街道 / 赛道设定", en: "STREET / TRACK SETTINGS" },
    ],
    focus: { zh: "姿态与驾驶目标", en: "Stance and driving goals" },
    method: { zh: "实车反馈调整", en: "Adjusted from real feedback" },
    keys: ["suspension", "wheels"],
    shop: ["suspension", "wheels", "brakes"],
  },
  exhaust: {
    included: [
      { zh: "进气", en: "INTAKE" },
      { zh: "头段", en: "DOWNPIPE" },
      { zh: "中尾段", en: "MID-PIPE & AXLE-BACK" },
      { zh: "声浪与响应", en: "SOUND & RESPONSE" },
    ],
    focus: { zh: "声音与动力响应", en: "Sound, flow, response" },
    method: { zh: "按道路使用复查", en: "Reviewed for road use" },
    keys: ["intake"],
    shop: ["exhaust", "intake"],
  },
};
