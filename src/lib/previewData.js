// نسخة المعاينة (npm run build:preview): ملف HTML واحد يعمل بدون Firebase،
// يُعرض داخل Claude أو يُفتح من الكمبيوتر مباشرة. البيانات هنا أمثلة فقط.
export const PREVIEW = import.meta.env.VITE_PREVIEW === "1";

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const SAMPLE_PROS = [
  {
    id: "demo-pro-1",
    display_name: "محمود عبد الرحمن",
    profession: "كهرباء",
    city: "مدينة نصر، القاهرة",
    bio: "كهربائي معتمد بخبرة ١٢ سنة في التمديدات، اللوحات الكهربائية وأعطال الطوارئ.",
    account_type: "professional",
    verified: true,
    rating_sum: 48,
    rating_count: 10,
  },
  {
    id: "demo-pro-2",
    display_name: "أحمد سمير",
    profession: "سباكة",
    city: "المعادي، القاهرة",
    bio: "سبّاك محترف: كشف التسريبات، تركيب السخانات والأدوات الصحية.",
    account_type: "professional",
    verified: true,
    rating_sum: 33,
    rating_count: 7,
  },
  {
    id: "demo-pro-3",
    display_name: "كريم فتحي",
    profession: "دهان",
    city: "الدقي، الجيزة",
    bio: "دهانات حديثة وديكورات، معجون وورق حائط.",
    account_type: "professional",
    verified: false,
    rating_sum: 9,
    rating_count: 2,
  },
  {
    id: "demo-pro-4",
    display_name: "ياسر النجار",
    profession: "نجارة",
    city: "الإسكندرية",
    bio: "تفصيل وتصليح المطابخ والدواليب والأبواب.",
    account_type: "professional",
    verified: false,
    rating_sum: 0,
    rating_count: 0,
  },
];

export const SAMPLE_REQUESTS = [
  {
    id: "demo-req-1",
    service_type: "سباكة",
    description: "تسريب مياه تحت حوض المطبخ، والمياه بتنزل على الأرضية من امبارح.",
    budget: 400,
    execution_date: "٢٠٢٦-١٠-٠١",
    status: "open",
    media: [],
    created_by: "demo-client-1",
    created_by_name: "سارة إبراهيم",
    created_date: minutesAgo(35),
  },
  {
    id: "demo-req-2",
    service_type: "كهرباء",
    description: "تركيب ٦ سبوت لايت في الصالة وتغيير مفتاحين.",
    budget: 750,
    execution_date: "٢٠٢٦-١٠-٠٣",
    status: "in_progress",
    assigned_to: "demo-pro-1",
    assigned_name: "محمود عبد الرحمن",
    media: [],
    created_by: "demo-client-2",
    created_by_name: "عمر خالد",
    created_date: minutesAgo(60 * 20),
  },
  {
    id: "demo-req-3",
    service_type: "دهان",
    description: "دهان غرفة نوم ٤×٤ متر، لون فاتح، مع معالجة شروخ بسيطة في السقف.",
    budget: 2500,
    execution_date: null,
    status: "open",
    media: [],
    created_by: "demo-client-3",
    created_by_name: "منى حسن",
    created_date: minutesAgo(60 * 50),
  },
  {
    id: "demo-req-4",
    service_type: "تكييف",
    description: "تنظيف وصيانة تكييف سبليت ١.٥ حصان وتعبئة فريون لو محتاج.",
    budget: 600,
    execution_date: "٢٠٢٦-٠٩-٢٥",
    status: "done",
    assigned_to: "demo-pro-2",
    assigned_name: "أحمد سمير",
    media: [],
    created_by: "demo-client-1",
    created_by_name: "سارة إبراهيم",
    created_date: minutesAgo(60 * 24 * 6),
  },
];

const comment = (id, pro, text, offer, m) => ({
  id,
  author_uid: pro.id,
  author_name: pro.display_name,
  author_photo: null,
  author_type: "professional",
  text,
  offer_price: offer,
  created_date: minutesAgo(m),
});

export const SAMPLE_COMMENTS = {
  "demo-req-1": [
    comment("c1", SAMPLE_PROS[1], "أقدر أعدّي عليك النهارده بعد العصر، غالبًا المشكلة في الوصلة المرنة.", 350, 20),
    comment("c2", SAMPLE_PROS[3], "لو محتاج تغيير الدولاب اللي تحت الحوض أقدر أساعد كمان.", null, 12),
  ],
  "demo-req-2": [comment("c3", SAMPLE_PROS[0], "متاح يوم الجمعة، السعر شامل التركيب والتوصيل.", 700, 60 * 19)],
  "demo-req-3": [comment("c4", SAMPLE_PROS[2], "المعاينة مجانية، وأقدر أبدأ من السبت.", 2300, 60 * 30)],
  "demo-req-4": [],
};

export const SAMPLE_REVIEWS = [
  {
    id: "demo-req-4",
    pro_uid: "demo-pro-2",
    reviewer_name: "سارة إبراهيم",
    service_type: "تكييف",
    rating: 5,
    text: "وصل في الميعاد وشغله نضيف جدًا.",
    created_date: minutesAgo(60 * 24 * 5),
  },
];
