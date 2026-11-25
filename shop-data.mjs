const shopVehicleTuples = [
  { make: "BMW", model: "G80 M3", year: "2024", chassis: "G8X" },
  { make: "AUDI", model: "RS 5", year: "2024", chassis: "B9.5" },
  { make: "MERCEDES-BENZ", model: "C 63 S", year: "2024", chassis: "W206" },
];

export const shopVehicles = {
  makes: ["BMW", "AUDI", "MERCEDES-BENZ"],
  models: {
    BMW: ["G80 M3"],
    AUDI: ["RS 5"],
    "MERCEDES-BENZ": ["C 63 S"],
  },
  years: {
    "G80 M3": ["2024"],
    "RS 5": ["2024"],
    "C 63 S": ["2024"],
  },
  chassis: {
    "G80 M3": ["G8X"],
    "RS 5": ["B9.5"],
    "C 63 S": ["W206"],
  },
  tuples: shopVehicleTuples,
};

// Fallback enquiry copy only. These are questions to confirm with the owner,
// never product specifications or claims of vehicle fitment.
export const shopCategoryDefaults = {
  wheels: { label: { en: "WHEELS", zh: "轮毂" }, confirm: [
    { en: "VEHICLE FITMENT", zh: "车型适配" }, { en: "SIZE", zh: "尺寸" },
    { en: "OFFSET", zh: "偏距" }, { en: "FINISH", zh: "表面颜色" },
  ] },
  intake: { label: { en: "INTAKE", zh: "进气" }, confirm: [
    { en: "PLATFORM", zh: "车辆平台" }, { en: "ENGINE", zh: "发动机" },
    { en: "INSTALLATION REQUIREMENTS", zh: "安装需求" },
  ] },
  suspension: { label: { en: "SUSPENSION", zh: "悬挂" }, confirm: [
    { en: "INTENDED USE", zh: "使用场景" }, { en: "RIDE HEIGHT", zh: "车高" },
    { en: "CHASSIS SETUP", zh: "底盘设定" },
  ] },
  brakes: { label: { en: "BRAKES", zh: "刹车" }, confirm: [
    { en: "ROTOR", zh: "碟盘" }, { en: "CALIPER", zh: "卡钳" },
    { en: "WHEEL CLEARANCE", zh: "轮毂空间" }, { en: "INTENDED USE", zh: "用途" },
  ] },
  aero: { label: { en: "AERO", zh: "空气动力" }, confirm: [
    { en: "BODY STYLE", zh: "车身版本" }, { en: "FINISH", zh: "表面" },
    { en: "INSTALLATION", zh: "安装" }, { en: "COMPLETE-CAR DIRECTION", zh: "整车方向" },
  ] },
  exhaust: { label: { en: "EXHAUST", zh: "排气" }, confirm: [
    { en: "SOUND TARGET", zh: "声浪目标" }, { en: "CONFIGURATION", zh: "配置" },
    { en: "ROAD USE", zh: "道路使用" }, { en: "INSTALLATION", zh: "安装" },
  ] },
};

export const shopProducts = [
  {
    id: "forged-wheel",
    category: "wheels",
    title: { en: "FORGED WHEEL", zh: "锻造轮毂" },
    description: {
      en: "A sample wheel category shown for design review. Confirm size, offset, finish, and vehicle fitment with LONMA DYNAMIC.",
      zh: "用于设计预览的轮毂分类示例。尺寸、ET、颜色与车型适配请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/forged-wheel.webp",
    alt: { en: "Forged performance wheel sample", zh: "锻造性能轮毂示例" },
    compatibility: { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" },
    inquirySubject: { en: "FORGED WHEEL INQUIRY", zh: "锻造轮毂咨询" },
    shopifyProductId: null,
    detail: {
      gallery: [
        { label: { en: "FULL VIEW", zh: "整体" }, zoom: 1, origin: "50% 50%" },
        { label: { en: "CENTRE DETAIL", zh: "中心细节" }, zoom: 2.15, origin: "51% 46%" },
        { label: { en: "RIM EDGE", zh: "轮辋边缘" }, zoom: 2.5, origin: "16% 58%" },
        {
          label: { en: "ON A BUILD · CASE 03 REFERENCE", zh: "装车参考 · 案例 03" },
          zoom: 1, origin: "50% 50%", scene: true,
          image: "assets/images/generated/case-03/case-03-960w.webp",
          alt: { en: "Reference wheel on a purple BMW build from Case 03", zh: "案例 03 紫色宝马上的轮毂参考" },
        },
      ],
      kicker: { en: "WHEELS / FORGED", zh: "轮毂 / 锻造" },
      title: { en: "MONOBLOCK FORGED WHEEL", zh: "单片式锻造轮毂" },
      seoTitle: "Monoblock Forged Wheel",
      displayName: { en: "Forged Wheel", zh: "锻造轮毂" },
      summary: {
        en: "A lightweight wheel direction configured around vehicle fitment, brake clearance, and complete-car proportion.",
        zh: "围绕车型适配、刹车空间与整车比例配置的轻量化轮毂方向。",
      },
      specifications: {
        construction: { en: "MONOBLOCK FORGED", zh: "单片式锻造" },
        application: {
          en: "STREET & ROAD PERFORMANCE",
          zh: "街道与道路性能",
        },
        fitment: {
          en: "REFERENCE SET · CONFIRM BEFORE ORDER",
          zh: "参考适配 · 下单前确认",
        },
      },
      referencePrice: {
        display: "US$3,200",
        note: {
          en: "Final quote follows fitment verification.",
          zh: "最终报价以适配确认后为准。",
        },
      },
      options: {
        diameter: [
          { id: "19 inch", label: { en: '19"', zh: '19"' } },
          { id: "20 inch", label: { en: '20"', zh: '20"' } },
        ],
        width: [
          { id: "9.5J / 10.5J", label: { en: "9.5J / 10.5J", zh: "9.5J / 10.5J" } },
          { id: "10J / 11J", label: { en: "10J / 11J", zh: "10J / 11J" } },
        ],
        finish: [
          {
            id: "Satin Black",
            label: { en: "SATIN BLACK", zh: "缎面黑" },
            swatch: "black",
          },
          {
            id: "Brushed Silver",
            label: { en: "BRUSHED SILVER", zh: "拉丝银" },
            swatch: "silver",
          },
        ],
      },
      optionLabels: {
        diameter: { en: "DIAMETER", zh: "直径" },
        width: { en: "WIDTH", zh: "宽度" },
        finish: { en: "FINISH", zh: "颜色" },
      },
      defaults: {
        vehicle: shopVehicleTuples[0],
        diameter: "19 inch",
        width: "9.5J / 10.5J",
        finish: "Satin Black",
        quantity: 4,
      },
      fitments: [
        {
          make: "BMW",
          model: "G80 M3",
          year: "2024",
          chassis: "G8X",
          combinations: [
            { diameter: "19 inch", width: "9.5J / 10.5J" },
            { diameter: "20 inch", width: "10J / 11J" },
          ],
        },
        {
          make: "AUDI",
          model: "RS 5",
          year: "2024",
          chassis: "B9.5",
          combinations: [
            { diameter: "19 inch", width: "9.5J / 10.5J" },
          ],
        },
      ],
      fitmentCopy: {
        supported: {
          en: "REFERENCE FITMENT · FINAL CLEARANCE CHECK REQUIRED",
          zh: "参考适配 · 仍需最终空间确认",
        },
        unsupported: {
          en: "FITMENT CONSULTATION REQUIRED",
          zh: "需要确认车型适配",
        },
      },
    },
  },
  {
    id: "carbon-intake",
    category: "intake",
    title: { en: "CARBON INTAKE SYSTEM", zh: "碳纤维进气系统" },
    description: {
      en: "A sample intake category shown for design review. Confirm platform, engine, and installation requirements with LONMA DYNAMIC.",
      zh: "用于设计预览的进气分类示例。平台、发动机与安装需求请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/carbon-intake.webp",
    alt: { en: "Carbon intake system sample", zh: "碳纤维进气系统示例" },
    compatibility: { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" },
    inquirySubject: { en: "CARBON INTAKE SYSTEM INQUIRY", zh: "碳纤维进气系统咨询" },
    shopifyProductId: null,
    inquiry: {
      kicker: { en: "INTAKE / CARBON", zh: "进气 / 碳纤维" },
      confirm: [
        { en: "PLATFORM", zh: "车辆平台" },
        { en: "ENGINE", zh: "发动机" },
        { en: "INSTALLATION REQUIREMENTS", zh: "安装需求" },
      ],
      reference: { caseId: "04", image: "assets/images/generated/case-04/case-04-960w.webp", label: { en: "ON A BUILD · CASE 04 REFERENCE", zh: "装车参考 · 案例 04" }, alt: { en: "Intake reference in the Case 04 engine bay", zh: "案例 04 发动机舱中的进气参考" } },
    },
  },
  {
    id: "coilover-kit",
    category: "suspension",
    title: { en: "COILOVER KIT", zh: "绞牙避震套件" },
    description: {
      en: "A sample suspension category shown for design review. Confirm intended use, ride height, and chassis setup with LONMA DYNAMIC.",
      zh: "用于设计预览的避震分类示例。使用场景、车高与底盘设定请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/coilover-kit.webp",
    alt: { en: "Performance coilover kit sample", zh: "性能绞牙避震套件示例" },
    compatibility: { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" },
    inquirySubject: { en: "COILOVER KIT INQUIRY", zh: "绞牙避震套件咨询" },
    shopifyProductId: null,
    inquiry: {
      kicker: { en: "SUSPENSION / COILOVER", zh: "悬挂 / 绞牙避震" },
      confirm: [
        { en: "INTENDED USE", zh: "使用场景" },
        { en: "RIDE HEIGHT", zh: "车高" },
        { en: "CHASSIS SETUP", zh: "底盘设定" },
      ],
      reference: { caseId: "03", image: "assets/images/generated/case-03/case-03-960w.webp", label: { en: "ON A BUILD · CASE 03 REFERENCE", zh: "装车参考 · 案例 03" }, alt: { en: "Lowered stance reference from Case 03", zh: "案例 03 的降低车身参考" } },
    },
  },
  {
    id: "brake-kit",
    category: "brakes",
    title: { en: "BIG BRAKE KIT", zh: "高性能刹车套件" },
    description: {
      en: "A sample brake category shown for design review. Confirm rotor, caliper, wheel-clearance, and use requirements with LONMA DYNAMIC.",
      zh: "用于设计预览的刹车分类示例。碟盘、卡钳、轮毂空间与用途请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/brake-kit.webp",
    alt: { en: "Performance brake kit sample", zh: "高性能刹车套件示例" },
    compatibility: { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" },
    inquirySubject: { en: "BIG BRAKE KIT INQUIRY", zh: "高性能刹车套件咨询" },
    shopifyProductId: null,
    inquiry: {
      kicker: { en: "BRAKES / BIG BRAKE KIT", zh: "刹车 / 大刹车套件" },
      confirm: [
        { en: "ROTOR", zh: "碟盘" },
        { en: "CALIPER", zh: "卡钳" },
        { en: "WHEEL CLEARANCE", zh: "轮毂空间" },
        { en: "INTENDED USE", zh: "用途" },
      ],
      reference: { caseId: "02", image: "assets/images/generated/case-02/case-02-960w.webp", label: { en: "ON A BUILD · CASE 02 REFERENCE", zh: "装车参考 · 案例 02" }, alt: { en: "Road and track reference from Case 02", zh: "案例 02 的道路与赛道参考" } },
    },
  },
  {
    id: "carbon-aero",
    category: "aero",
    title: { en: "CARBON AERO", zh: "碳纤维空气动力套件" },
    description: {
      en: "A sample aero category shown for design review. Confirm body style, finish, installation, and complete-car direction with LONMA DYNAMIC.",
      zh: "用于设计预览的空气动力分类示例。车身版本、表面、安装与整车方向请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/carbon-aero.webp",
    alt: { en: "Carbon aerodynamic component sample", zh: "碳纤维空气动力部件示例" },
    compatibility: { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" },
    inquirySubject: { en: "CARBON AERO INQUIRY", zh: "碳纤维空气动力套件咨询" },
    shopifyProductId: null,
    inquiry: {
      kicker: { en: "AERO / CARBON", zh: "空气动力 / 碳纤维" },
      confirm: [
        { en: "BODY STYLE", zh: "车身版本" },
        { en: "FINISH", zh: "表面" },
        { en: "INSTALLATION", zh: "安装" },
        { en: "COMPLETE-CAR DIRECTION", zh: "整车方向" },
      ],
      reference: { caseId: "01", image: "assets/images/generated/case-01/case-01-960w.webp", label: { en: "ON A BUILD · CASE 01 REFERENCE", zh: "装车参考 · 案例 01" }, alt: { en: "Widebody lineup reference from Case 01", zh: "案例 01 的宽体车队参考" } },
    },
  },
  {
    id: "performance-exhaust",
    category: "exhaust",
    title: { en: "PERFORMANCE EXHAUST", zh: "性能排气系统" },
    description: {
      en: "A sample exhaust category shown for design review. Confirm sound target, configuration, road use, and installation with LONMA DYNAMIC.",
      zh: "用于设计预览的排气分类示例。声浪目标、配置、道路使用与安装请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/performance-exhaust.webp",
    alt: { en: "Performance exhaust system sample", zh: "性能排气系统示例" },
    compatibility: { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" },
    inquirySubject: { en: "PERFORMANCE EXHAUST INQUIRY", zh: "性能排气系统咨询" },
    shopifyProductId: null,
    inquiry: {
      kicker: { en: "EXHAUST / PERFORMANCE", zh: "排气 / 性能" },
      confirm: [
        { en: "SOUND TARGET", zh: "声浪目标" },
        { en: "CONFIGURATION", zh: "配置" },
        { en: "ROAD USE", zh: "道路使用" },
        { en: "INSTALLATION", zh: "安装" },
      ],
      reference: null,
    },
  },
];
