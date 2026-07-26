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
      kicker: { en: "WHEELS / FORGED", zh: "轮毂 / 锻造" },
      title: { en: "MONOBLOCK FORGED WHEEL", zh: "单片式锻造轮毂" },
      displayName: { en: "Forged Wheel", zh: "锻造轮毂" },
      summary: {
        en: "A lightweight wheel direction configured around vehicle fitment, brake clearance, and complete-car proportion.",
        zh: "围绕车型适配、刹车空间与整车比例配置的轻量化轮毂方向。",
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
  },
];
