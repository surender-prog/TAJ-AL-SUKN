/* Taj Al Sukun — Arabic dictionary (Modern Standard Arabic)
   Loaded BEFORE i18n.js. Keys mirror the data-cms keys used across pages;
   `ui` holds shared chrome (nav, buttons, tabs, steps). Missing keys fall
   back to English automatically. */
window.TAJ_I18N = {
  /* ---------------- Shared chrome (text-node swaps; icons preserved) -------- */
  ui: {
    // nav
    'Home': 'الرئيسية',
    'About': 'من نحن',
    'About Us': 'من نحن',
    'Services': 'خدماتنا',
    'Gallery': 'المعرض',
    'Membership': 'العضوية',
    'Contact': 'اتصل بنا',
    'Sign In': 'تسجيل الدخول',
    'Reserve': 'احجز',
    'Member': 'عضو',
    // hero / common CTAs & buttons
    'Begin a New Chapter': 'ابدأ فصلاً جديدًا',
    'Explore the Menu': 'استكشف القائمة',
    'Read Our Story': 'اقرأ قصتنا',
    'Become a Member': 'كن عضوًا',
    'View Membership': 'عرض العضوية',
    'Chat with us': 'تحدّث معنا',
    'Ask a Question': 'اطرح سؤالاً',
    'Send via WhatsApp': 'أرسل عبر واتساب',
    'Send Message': 'إرسال الرسالة',
    'Reserve & Pay on WhatsApp': 'احجز وادفع عبر واتساب',
    "Book Men's Service on WhatsApp": 'احجز خدمة الرجال عبر واتساب',
    'Book Now': 'احجز الآن',
    'Book a Treatment': 'احجز جلسة',
    'Get Directions': 'احصل على الاتجاهات',
    // services tabs (audience + type)
    'Common': 'للجميع',
    'Ladies': 'سيدات',
    'Men': 'رجال',
    'All Treatments': 'جميع العلاجات',
    'Massage': 'تدليك',
    'Hammam': 'حمّام',
    'Foot Rituals': 'طقوس القدم',
    'Signature': 'مميّز',
    // booking steps
    'Member Status': 'حالة العضوية',
    'Choose Service': 'اختر الخدمة',
    'Date & Details': 'التاريخ والتفاصيل',
    'Confirm': 'تأكيد',
    // footer headings (best-effort; unknown ones stay English)
    'Explore': 'استكشف',
    'Quick Links': 'روابط سريعة',
    'Visit': 'تصفّح',
    'Experience': 'التجربة',
    'Book Online': 'احجز عبر الإنترنت',
    'Packages': 'الباقات',
    'Treatments': 'العلاجات',
    'Admin': 'الإدارة',
    'Taj Al Sukun': 'تاج السكون',
    '— All rights reserved.': '— جميع الحقوق محفوظة.',
    'Taj Al Sukun Spa W.L.L.': 'تاج السكون سبا ش.م.م.',
    'CR: 182250-1 · Crafted with care in Manama ·': 'س.ت: 182250-1 · صُنع بعناية في المنامة ·',
    // Home founder bullet list (Sofia Marini)
    'Internationally certified Thai massage practitioner': 'معالجة تدليك تايلاندي معتمدة دوليًا',
    'Holds a medical degree with 15 years of hospital experience': 'حاصلة على شهادة طبية مع 15 عامًا من الخبرة في المستشفيات',
    'Internationally certified Access Bars practitioner': 'معتمدة دوليًا في تقنية Access Bars',
    'Over 5 years of expertise in professional body relaxation': 'أكثر من 5 سنوات من الخبرة في الاسترخاء الجسدي الاحترافي',
    'Welcomes clients of any gender, age, and physical condition': 'ترحّب بالعملاء من جميع الأعمار والحالات الجسدية',
    "Gently activates the body's natural self-healing processes": 'تنشّط بلطف عمليات الشفاء الذاتي الطبيعية في الجسم',

    // Services page — Curated Packages list (12 rows)
    'Moroccan Bath + Argan Oil Massage': 'الحمّام المغربي + تدليك بزيت الأركان',
    'The classic pairing — exfoliating Hammam followed by an argan oil massage.': 'الثنائي الكلاسيكي — حمّام تقشير يتبعه تدليك بزيت الأركان.',
    'Moroccan Bath + Massage + Waxing': 'الحمّام المغربي + تدليك + إزالة شعر',
    'A full-care ritual combining Hammam, signature massage, and waxing.': 'طقسٌ متكامل يجمع الحمّام والتدليك المميَّز وإزالة الشعر.',
    'Royal Hammam + Massage': 'الحمّام الملكي + تدليك',
    'Our most popular pairing — Royal Hammam followed by a signature massage.': 'باقتنا الأكثر طلبًا — الحمّام الملكي يتبعه تدليك مميَّز.',
    'Sultan Suite': 'جناح السلطان',
    'A premium sequence designed for full-day restoration.': 'تتابعٌ فاخرٌ مصمَّم لاستعادةٍ تستغرق اليوم بكامله.',
    'Massage + Moroccan Bath': 'تدليك + الحمّام المغربي',
    'Choose your massage style and follow with the traditional Moroccan Hammam.': 'اختر نوع التدليك واتبعه بالحمّام المغربي التقليدي.',
    'Royal Hammam + Luxury Manicure': 'الحمّام الملكي + مانيكير فاخر',
    'Cleanse, exfoliate, and finish with a luxury manicure ritual.': 'تنظيف وتقشير، يختتم بطقس مانيكير فاخر.',
    'Royal Hammam + Luxury Pedicure': 'الحمّام الملكي + باديكير فاخر',
    'The full Royal Hammam followed by a complete luxury pedicure.': 'الحمّام الملكي الكامل يتبعه باديكير فاخرٌ متكامل.',
    'Moroccan Bath + Mani & Pedicure': 'الحمّام المغربي + مانيكير وباديكير',
    'Full Hammam experience with a classic manicure and pedicure.': 'تجربة حمّامٍ كاملة مع مانيكير وباديكير كلاسيكي.',
    'Balinese Massage + Body Scrub': 'التدليك البالي + تقشير الجسم',
    'Aromatic Balinese massage paired with an invigorating full-body scrub.': 'تدليكٌ بالي عطري مع تقشيرٍ منعش لكامل الجسم.',
    'Swedish Massage + Brazilian Waxing': 'التدليك السويدي + إزالة شعر برازيلية',
    'Our gentle Swedish massage paired with a precise Brazilian wax.': 'تدليكنا السويدي اللطيف مع إزالة شعرٍ برازيلية دقيقة.',
    'Swedish Massage + Jacuzzi': 'التدليك السويدي + جاكوزي',
    'Tension-easing Swedish massage followed by a private jacuzzi soak.': 'تدليكٌ سويدي مزيلٌ للتوتر يتبعه استرخاء في جاكوزي خاص.',
    'Massage + Body Scrub': 'تدليك + تقشير الجسم',
    'Choose your massage and pair it with a full-body exfoliation ritual.': 'اختر تدليكك واقترنه بطقس تقشيرٍ لكامل الجسم.',
    'Follow Us': 'تابعنا',
    'Opening Hours': 'ساعات العمل',
    'Send a Message': 'أرسل رسالة',
    'Reserve Your Visit': 'احجز زيارتك',

    // contact info cards
    'Call Us': 'اتصل بنا',
    'WhatsApp': 'واتساب',
    'Location': 'الموقع',
    'Fastest response': 'الأسرع للرد',
    'Within 24 hours': 'خلال 24 ساعة',
    'Walk-Ins Welcome': 'الزيارات بدون موعد مرحَّب بها',

    // day names + hours
    'Saturday': 'السبت',
    'Sunday':   'الأحد',
    'Monday':   'الإثنين',
    'Tuesday':  'الثلاثاء',
    'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس',
    'Friday':   'الجمعة',
    '10:00 AM – 6:00 PM': '10:00 ص – 6:00 م',

    // form labels (contact + booking + signup)
    'Full Name': 'الاسم الكامل',
    'Phone': 'الهاتف',
    'Email': 'البريد الإلكتروني',
    'Subject': 'الموضوع',
    'Message': 'الرسالة',
    'Date': 'التاريخ',
    'Time': 'الوقت',
    'Notes': 'ملاحظات',
    'Notes / Special Requests': 'ملاحظات / طلبات خاصة',
    'Email (optional)': 'البريد الإلكتروني (اختياري)',
    'Membership Tier': 'فئة العضوية',
    'Member ID': 'رقم العضوية',

    // contact subject options
    'General Inquiry': 'استفسار عام',
    'Booking Question': 'استفسار عن الحجز',
    'Group / Couple Booking': 'حجز جماعي / للأزواج',
    'Membership Inquiry': 'استفسار عن العضوية',
    'Corporate / Event': 'شركات / فعاليات',
    'Feedback': 'ملاحظات وآراء',

    // placeholders
    'Your name': 'اسمك',
    'you@email.com': 'you@email.com',
    'How can we help?': 'كيف يمكننا مساعدتك؟',
    'TAS-2025-XXXX': 'TAS-2025-XXXX',
    'Any preferences or notes for your visit?': 'هل لديك أي تفضيلات أو ملاحظات لزيارتك؟',
    'MBR-001 or TAS-2025-XXXX': 'MBR-001 أو TAS-2025-XXXX',

    // booking form section headings + member toggle
    'Choose Your Treatment': 'اختر علاجك',
    'Pick Date & Time': 'حدّد التاريخ والوقت',
    'Your Details': 'بياناتك',
    'Are you a Taj Al Sukun member?': 'هل أنت عضو في تاج السكون؟',
    'Select tier…': 'اختر الفئة…',
    'Silver — 10% off': 'فضّي — خصم 10٪',
    'Gold — 15% off': 'ذهبي — خصم 15٪',
    'Platinum — 20% off': 'بلاتيني — خصم 20٪',
    'Silver': 'فضّي',
    'Gold': 'ذهبي',
    'Platinum': 'بلاتيني',

    // signin / signup buttons + labels
    'Welcome back': 'أهلاً بعودتك',
    'Forgot ID?': 'نسيت رقم العضوية؟',
    'My Portal': 'حسابي',
    'Not you?': 'لست أنت؟',
    'Sign Out': 'تسجيل الخروج',
    'Save Changes': 'حفظ التغييرات',
    'Edit Profile': 'تعديل الملف الشخصي',

    // booking summary
    'Guest': 'ضيف',
    'Service': 'الخدمة',
    'Service Fee': 'رسوم الخدمة',
    'Member Discount': 'خصم العضوية',
    'Total': 'الإجمالي',
    'Need Help?': 'تحتاج إلى مساعدة؟',

    // services tabs sub
    'Salon': 'صالون',
    'Foot Ritual': 'طقس القدم',
    'Couple': 'للأزواج',
    'Package': 'باقة',

    // misc small labels
    'Discover': 'اكتشف',
    'Spa & Wellness': 'سبا وعافية',
    'Become a Silver Member': 'كن عضوًا فضّيًا',
    'Become a Gold Member': 'كن عضوًا ذهبيًا',
    'Become a Platinum Member': 'كن عضوًا بلاتينيًا',

    // home — "After Your Visit" numbered cards
    'Steps to a world of healing': 'خطواتٌ إلى عالمٍ من الشفاء',
    'For your body and soul.': 'لجسدك وروحك.',
    'Begin your journey': 'ابدأ رحلتك',
    'Of rejuvenation and healing.': 'من التجديد والشفاء.',
    'Deep relaxation': 'استرخاءٌ عميق',
    'Enjoy deep relaxation and rest.': 'استمتع بالاسترخاء العميق والراحة.',
    'Lightness in your body': 'خِفّةٌ في جسدك',
    'Experience lightness in muscles and joints.': 'اختبر الخفّة في العضلات والمفاصل.',

    // home — pricing plans
    'Basic': 'أساسي',
    'Standard': 'قياسي',
    'Premium': 'فاخر',
    'Three ways to experience Taj Al Sukun — choose what fits today.': 'ثلاث طرق لاختبار تاج السكون — اختر ما يناسبك اليوم.',
    'Book Your Massage': 'احجز جلستك',
    '60-min Swedish or Casablanca': 'تدليك سويدي أو كازابلانكا 60 دقيقة',
    'Aromatic oils': 'زيوت عطرية',
    'Herbal tea after session': 'شاي أعشاب بعد الجلسة',
    'Hot herbal compress': 'كمّادة أعشاب ساخنة',
    'Foot reflexology': 'ريفلكسولوجي للقدم',
    '90-min Traditional Massage': 'تدليك تقليدي 90 دقيقة',
    'Foot reflexology (15 min)': 'ريفلكسولوجي للقدم (15 دقيقة)',
    'Hot stone therapy': 'علاج بالحجر الحار',
    '120-min Luxury Ritual': 'طقس فاخر 120 دقيقة',
    'Foot reflexology (30 min)': 'ريفلكسولوجي للقدم (30 دقيقة)',

    // home — Manama-area location names (kept; used elsewhere in chrome)
    'Manama': 'المنامة',
    'Riffa': 'الرفاع',
    'Adliya': 'العدلية',
    'Seef': 'السيف',

    // about — values cards
    'Quality': 'الجودة',
    'Premium ingredients, vetted techniques, no shortcuts — ever.': 'مكوّناتٌ فاخرة، وتقنياتٌ مُختبَرة، بلا اختصارات — أبدًا.',
    'Privacy': 'الخصوصية',
    'Discreet, private rooms designed for your absolute comfort.': 'غرفٌ هادئة وخاصة صُمّمت لراحتك المطلقة.',
    'Care': 'الرعاية',
    'Genuine warmth in every welcome, every touch, every farewell.': 'دفءٌ صادقٌ في كل ترحيب، وكل لمسة، وكل وداع.',
    'Excellence': 'التميّز',
    'Trained professionals committed to mastery of their craft.': 'محترفون مدرَّبون ملتزمون بإتقان صنعتهم.',

    // footer columns
    'Visit': 'تصفّح',
    'Experience': 'تجربة',
    'Book Online': 'احجز عبر الإنترنت',
    'Packages': 'الباقات',
    'Treatments': 'العلاجات',

    // member portal — hero
    'MEMBER ID': 'رقم العضوية',
    'My Profile': 'ملفي الشخصي',

    // member portal — stats
    'Complimentary Services Left': 'خدمات مجانية متبقّية',
    'Account Balance': 'الرصيد',
    'Visits This Year': 'زيارات هذا العام',
    // (Member Discount already mapped)

    // member portal — tabs + bookings section
    'Bookings': 'الحجوزات',
    'Profile': 'الملف الشخصي',
    'Benefits': 'المزايا',
    'Upcoming & Past Visits': 'الزيارات القادمة والسابقة',
    'Upcoming': 'القادمة',
    'Past': 'السابقة',
    'All Visits': 'جميع الزيارات',
    'All': 'الكل',
    'Confirmed': 'مؤكَّد',
    'Pending': 'قيد المراجعة',
    'Completed': 'مكتمل',
    'Cancelled': 'مُلغى',

    // signup wizard
    'Choose Tier': 'اختر الفئة',
    'Payment': 'الدفع',
    'Welcome': 'أهلاً',
    'Confirm & Activate': 'تأكيد وتفعيل',

    // membership comparison — section headers
    'Benefit': 'الميزة',
    'Annual Investment': 'الاشتراك السنوي',
    'Complimentary Services': 'الخدمات المجانية',
    'Member Pricing': 'أسعار الأعضاء',
    'Booking & Privileges': 'الحجز والامتيازات',
    'Welcome & Special Occasions': 'الترحيب والمناسبات الخاصة',
    'Booking Privileges': 'امتيازات الحجز',
    'Extras': 'مزايا إضافية',
    'Price per year': 'السعر السنوي',
    // comparison feature rows
    '60-min signature massages': 'جلسات تدليك مميَّز (60 دقيقة)',
    'Royal Hammam rituals': 'طقوس الحمّام الملكي',
    'Foot rituals (reflexology)': 'طقوس القدم (ريفلكسولوجي)',
    'Hot Stone sessions': 'جلسات الحجر الحار',
    'Discount on additional treatments': 'خصم على العلاجات الإضافية',
    'Discount on products': 'خصم على المنتجات',
    'Priority booking window': 'نافذة الحجز ذات الأولوية',
    'Guest passes per year': 'تصاريح ضيوف سنويًا',
    'Personal therapist match': 'مطابقة معالجٍ شخصي',
    'Birthday gift': 'هدية عيد الميلاد',
    'Welcome ritual': 'طقس الترحيب',
    'Member events': 'فعاليات الأعضاء',
    'Concierge scheduling': 'جدولة عبر الكونسيرج',
    // comparison value cells
    'Unlimited (2/mo)': 'غير محدود (2 شهريًا)',
    'Unlimited': 'غير محدود',
    '12 per year': '12 سنويًا',
    '24 hours ahead': 'قبل 24 ساعة',
    '48 hours ahead': 'قبل 48 ساعة',
    'Anytime': 'في أي وقت',
    '90 min': '90 دقيقة',
    '4 hours': '4 ساعات',
    'Foot Relaxing': 'راحة القدم',
    'Spa journey': 'رحلة سبا',
    'Day at the Spa': 'يوم في السبا',
    'Yes': 'نعم',
    'No': 'لا',
    'Seasonal offers': 'عروض موسمية',
    'Seasonal events': 'فعاليات موسمية',

    // about — multi-lingual list
    'Multi-lingual team (Arabic, English & more)': 'فريقٌ متعدّد اللغات (العربية والإنجليزية وأكثر)',
    'Kingdom of Bahrain · CR No. 182250-1': 'مملكة البحرين · س.ت رقم 182250-1',

    // portal — tier-specific taglines (set dynamically by member-auth.js)
    'Your year of considered moments awaits.': 'عامٌ من اللحظات المختارة بعناية بانتظارك.',
    'A generous year of restoration is yours.': 'عامٌ سخيّ من الاستعادة لك.',
    'The fullest expression of care, at your call.': 'أرفع تعبيرٍ عن العناية، في خدمتك.',
    'Your sanctuary is ready.': 'ملاذك جاهز.',

    // signup wizard panel headings + welcome eyebrow
    'Tell us a little about you.': 'أخبرنا قليلاً عنك.',
    'Choose your tier.': 'اختر فئتك.',
    'How would you like to pay?': 'كيف تودّ الدفع؟',
    'WELCOME TO THE CIRCLE': 'أهلاً بك في الدائرة',

    // about — numbered section chips (.numlabel .lbl)
    'Our Story': 'قصتنا',
    'Our Purpose': 'مهمتنا',
    'Meet the Team': 'تعرّف على الفريق',
    'Leadership': 'القيادة',
    'Continuous training in new techniques': 'تدريبٌ مستمر على تقنياتٍ جديدة',

    // about — mission italic taglines
    '— To create moments of complete restoration for body, mind, and spirit.':
      '— أن نصنع لحظاتٍ من الاستعادة الكاملة للجسد والعقل والروح.',
    '— To be Bahrain\'s most-trusted name in holistic wellness.':
      '— أن نكون الاسم الأكثر ثقةً في البحرين في مجال العافية الشاملة.',
    'We deliver authentic, expertly-performed wellness rituals using premium natural ingredients in an environment designed for serenity.':
      'نقدّم طقوس عافية أصيلة يؤدّيها خبراء مهرة باستخدام مكوّناتٍ طبيعية فاخرة في بيئةٍ صُمّمت للهدوء.',
    'A destination where guests return — not just for the treatments, but for the feeling that lingers long after they leave.':
      'وجهةٌ يعود إليها الضيوف — لا للعلاجات فحسب، بل لذلك الشعور الذي يبقى معهم طويلاً بعد المغادرة.',

    // about — team certified list items
    'Internationally certified therapists': 'معالجون معتمدون دوليًا',
    'Premium products from Morocco, Bali & Thailand': 'منتجاتٌ فاخرة من المغرب وبالي وتايلاند'
  },

  /* ---------------- Page content (keyed by data-cms) ----------------------- */
  cms: {
    /* ---- shared footer ---- */
    'page-footer.brand.tagline': 'ملاذٌ عصري للعافية في المنامة، يمزج الطقوس العربية الأصيلة بأرقى تقاليد السبا في العالم.',
    'page-footer.contact.address': 'الفاتح، المنامة<br>مجمع 324 · طريق 2416 · مبنى 950',
    'page-footer.contact.hours': 'يوميًا · 10ص – 6م',

    /* ---- HOME ---- */
    'page-home.hero.eyebrow': 'المنامة · البحرين · تأسّس 2024',
    'page-home.hero.title': 'انغمس <em>بنفسك</em> في أجواء السكون والانسجام.',
    'page-home.hero.subtitle': 'ادخل إلى تاج السكون — ملاذٌ خاص تلتقي فيه الطقوس العربية بأرقى تقاليد السبا في العالم: حمّامات أصيلة، وجلسات تدليك مميّزة، وعنايةٌ على مهل.',
    'page-home.loving.title': 'العناية بلمسةٍ حانية',
    'page-home.loving.body': 'معالج تدليك محترف يتمتع بخبرة واسعة، جاهزٌ للعناية بصحتك الجسدية والنفسية. كل طقسٍ يبدأ بك.',
    'page-home.stress.title': 'مكانٌ <em>يتلاشى فيه التوتر</em> ويبدأ الانسجام.',
    'page-home.stress.body': 'اختبر قوة الطقوس العربية الأصيلة في الشفاء — مزيجٌ من التقاليد والعناية صُمّم لتخفيف التوتر، وتنشيط الدورة الدموية، واستعادة السلام الداخلي. كل جلسةٍ رحلةٌ نحو التوازن والصفاء والتجدّد العميق.',
    'page-home.benefits.title': 'يمكن للتدليك أن يساعدك <em>إذا كنت</em>...',
    'page-home.welcome.eyebrow': 'أهلاً بك',
    'page-home.welcome.title': 'ملاذٌ عصري <em>متجذّرٌ في التقاليد</em>.',
    'page-home.welcome.body': '«السكون» كلمةٌ عربية تعني الهدوء العميق الذي يعقب الراحة الحقيقية. منذ لحظة دخولك، صُمّم كل تفصيلٍ ليأخذك إلى هناك: دفء الخشب، وضوء الشموع، وأيادٍ خبيرة، وطقوسٌ مستوحاة من المغرب وتايلاند وبالي وشبه الجزيرة العربية. ساعةً كانت أم أصيلاً أم يومًا كاملاً — ستغادر أخفّ مما أتيت.',
    'page-home.after.eyebrow': 'بعد زيارتك',
    'page-home.after.title': 'كيف <em>ستشعر</em>',
    'page-home.treatments.eyebrow': 'طقوسنا المميّزة',
    'page-home.treatments.title': 'علاجاتٌ مصمّمة <em>من أجلك</em>',
    'page-home.philosophy.quote': '«حيث ينتهي ضجيج العالم، يبدأ سكون الذات. <em>ذلك هو السكون.</em>»',
    'page-home.philosophy.by': '— فلسفتنا',
    'page-home.founder.eyebrow': 'مديرة الاستوديو',
    'page-home.founder.title':   'أيادٍ <em>تفهم</em>.',
    'page-home.founder.name':    'صوفيا ماريني',
    'page-home.founder.role':    'المؤسِّسة',
    'page-home.pricing.eyebrow': 'أسعارٌ مرنة',
    'page-home.pricing.title': 'لكل <em>لحظة</em>',
    'page-home.offer.eyebrow': 'عرض الترحيب',
    'page-home.offer.title': 'استمتع بخصم <em>10٪</em>',
    'page-home.offer.body': 'املأ النموذج وسنتواصل معك لتأكيد موعدك والاستمتاع بخصمٍ ترحيبي على زيارتك الأولى.',
    'page-home.cta.eyebrow': 'احجز لحظتك',
    'page-home.cta.title': 'ملاذك <em>بانتظارك</em>',
    'page-home.cta.body': 'تتوفر مواعيد في اليوم نفسه غالبًا. احجز عبر الإنترنت أو راسلنا مباشرةً على واتساب.',

    /* ---- ABOUT ---- */
    'page-about.hero.title': 'حكاية <em>السكون</em>',
    'page-about.hero.subtitle': '«تاج» هو الإكليل، و«السكون» هو الهدوء — معًا أرقى صور السلام الداخلي.',
    'page-about.quote.quote': '«غايتنا بسيطة — أن نمنح كل ضيفٍ أعمق سكونٍ في أسبوعه، في كل زيارة.»',
    'page-about.quote.by': '— مديرة السبا',
    'page-about.values.eyebrow': 'قيمنا',
    'page-about.values.title': 'المبادئ التي توجّه <em>كل تفصيل</em>',
    'page-about.team.eyebrow': 'موثوقون ومعتمدون',
    'page-about.team.title': 'مرخّصون رسميًا في <em>البحرين</em>',
    'page-about.cta.eyebrow': 'مستعدٌّ لاختبار الفرق؟',
    'page-about.cta.title': 'ادخل إلى <em>الملاذ</em>',
    'page-about.cta.body': 'احجز جلستك عبر الإنترنت أو تحدّث معنا مباشرةً على واتساب.',
    // about — section editorial titles + paragraphs
    'page-about.story.title': 'ملاذٌ وُلد من <em>أمنيةٍ بسيطة</em>.',
    'page-about.story.p1': 'تأسّس «تاج السكون» على إيمانٍ هادئ — بأن كل شخصٍ يستحقّ مكانًا يضع فيه ثقل العالم جانبًا. في مدينةٍ تعجّ بالحركة، صنعنا فضاءً يُبطئ خطواتك بلطفٍ وكمال.',
    'page-about.story.p2': 'مستلهَمين من تقاليد العافية العميقة في شبه الجزيرة العربية وشمال إفريقيا وجنوب شرق آسيا، يجمع السبا أرقى الطقوس من حول العالم — تؤدّيها أيادٍ تدرّبت سنواتٍ لتقدّمها بعناية.',
    'page-about.story.p3': 'كلّ علاج، وكلّ عطر، وكلّ تفصيلٍ هادئٍ في المكان مُختارٌ لغايةٍ واحدة: <em>أن نعيدك إلى نفسك.</em>',
    'page-about.mission.title': 'الرسالة <em>والرؤية</em>.',
    'page-about.team.h2': 'أيادٍ <em>تفهم</em>.',
    'page-about.team.p1': 'يحمل معالجونا سنواتٍ من التدريب في الأساليب التايلاندية والبالية والمغربية والسويدية والعميقة. كلٌّ منهم يحمل شهاداتٍ دولية، ويُختار قدر اختياره لمهارته التقنية لدفئه وحضوره.',
    'page-about.team.p2': 'ما يجمعهم إيمانٌ مشترك — أن العافية الحقيقية تحدث حين يشعر الضيوف بأمانٍ كامل، وبأنهم مرئيّون، ومُعتنىً بهم تمامًا.',
    'page-about.leadership.title': 'الرؤية خلف <em>الملاذ</em>.',
    'page-about.leadership.p1': 'بأكثر من عقدَين من القيادة في الضيافة والعافية، تَصوغ مديرة السبا كل عنصرٍ من تجربة تاج السكون — من اختيار الزيوت إلى درجة حرارة شاي الترحيب.',
    'page-about.leadership.p2': 'التزامها بالتميّز هو ما يجعل تاج السكون يبدو لا كسبا، بل كملاذٍ ستعود إليه دائمًا.',

    /* ---- SERVICES ---- */
    'page-services.hero.title': '<em>علاجاتنا</em>',
    'page-services.hero.subtitle': 'كل طقسٍ يُقدَّم على مهل، شخصيٌّ بعمق، ومصمَّمٌ ليعيد إليك توازنك.',
    'page-services.intro.eyebrow': 'تصفّح القائمة',
    'page-services.intro.title': 'اعثر على <em>لحظتك</em>',
    'page-services.quote.quote': '«اختر ما يطلبه جسدك اليوم. <em>قد يرغب الغد بشيءٍ آخر.</em>»',
    'page-services.quote.by': '— مديرة السبا',
    'page-services.packages.eyebrow': 'باقاتٌ منتقاة',
    'page-services.packages.title': 'رحلة السبا <em>الكاملة</em>',
    'page-services.cta.eyebrow': 'بحاجةٍ للمساعدة في الاختيار؟',
    'page-services.cta.title': 'دع فريقنا <em>يرشدك</em>',
    'page-services.cta.body': 'أخبرنا بما تشعر به اليوم، وسنوصي لك بالطقس الأمثل وفق أهدافك.',

    /* ---- GALLERY ---- */
    'page-gallery.hero.title': 'ادخل إلى <em>الملاذ</em>',
    'page-gallery.hero.subtitle': 'جولةٌ بصرية في الغرف والطقوس والتفاصيل الصغيرة التي تصوغ كل زيارة.',
    'page-gallery.intro.eyebrow': 'الرحلة البصرية',
    'page-gallery.intro.title': 'الجمال في <em>كل تفصيل</em>',
    'page-gallery.quote.quote': '«كل تفصيلٍ مُتقَن — كل عطر، وكل صوت، وكل صمت. <em>إنه السكون.</em>»',
    'page-gallery.quote.by': '— تاج السكون',

    /* ---- MEMBERSHIP ---- */
    'page-membership.hero.title': 'عضوية <em>تاج السكون</em>',
    'page-membership.hero.subtitle': 'دائرةٌ سنوية من الخدمات المجانية، وأسعارٌ خاصة بالأعضاء، وعنايةٌ ذات أولوية.',
    'page-membership.quote.quote': '«العضوية ليست صفقة — بل <em>دعوةٌ دائمة</em>.»',
    'page-membership.quote.by': '— وعد تاج السكون',
    'page-membership.compare.eyebrow': 'قارن جميع الفئات',
    'page-membership.compare.title': 'كل ميزةٍ <em>جنبًا إلى جنب</em>',
    'page-membership.portal.eyebrow': 'حساب العضو',
    'page-membership.portal.title': 'تابع كل شيءٍ في <em>مكانٍ واحد</em>',
    'page-membership.process.eyebrow': 'كيف تعمل العضوية',
    'page-membership.process.title': 'أربع خطواتٍ <em>بسيطة</em>',

    /* ---- CONTACT ---- */
    'page-contact.hero.title': 'يسعدنا أن <em>نسمع منك</em>',
    'page-contact.hero.subtitle': 'تواصل معنا هاتفيًا أو عبر واتساب أو من خلال النموذج أدناه — نردّ بسرعة.',
    'page-contact.visit.eyebrow': 'موقعنا',
    'page-contact.visit.title': 'مبنى <em>950</em>',

    /* ---- MEMBER PORTAL ---- */
    'page-portal.hero.eyebrow': 'بوابة العضو',
    'page-portal.hero.welcome': 'أهلاً بعودتك،',
    'page-portal.hero.tagline': 'ملاذك جاهز. هذا ما ينتظرك.',

    /* ---- MEMBERSHIP — tier cards ---- */
    'page-membership.perks-label': 'مشمولة سنويًا',
    'page-membership.most-popular': 'الأكثر شعبية',

    // Silver
    'page-membership.silver.name': 'الرفيق',
    'page-membership.silver.sub': 'دعوةٌ للبدء — عامٌ من اللحظات المختارة بعناية.',
    'page-membership.silver.price': '150<small>د.ب · سنويًا</small>',
    'page-membership.silver.p1': '<strong>2 جلسات</strong> تدليك مميَّز مجانية (60 دقيقة)',
    'page-membership.silver.p2': '<strong>1 طقس</strong> ريفلكسولوجي للقدم مجاني',
    'page-membership.silver.p3': '<strong>خصم 10٪</strong> على جميع العلاجات الإضافية',
    'page-membership.silver.p4': 'حجز ذو أولوية — قبل 24 ساعة',
    'page-membership.silver.p5': 'طقس ترحيبي عند الاشتراك',
    'page-membership.silver.p6': 'هدية عيد الميلاد — جلسة قدم مجانية',
    'page-membership.silver.p7': 'عروض موسمية حصرية للأعضاء',
    'page-membership.silver.cta': '<i class="fas fa-gem"></i> كن عضوًا فضّيًا',

    // Gold
    'page-membership.gold.name': 'الملاذ',
    'page-membership.gold.sub': 'عامٌ سخيّ من الاستعادة المنتظمة والعناية المميَّزة.',
    'page-membership.gold.price': '350<small>د.ب · سنويًا</small>',
    'page-membership.gold.p1': '<strong>6 جلسات</strong> تدليك مميَّز مجانية (60 دقيقة)',
    'page-membership.gold.p2': '<strong>1 طقس</strong> الحمّام الملكي مشمول',
    'page-membership.gold.p3': '<strong>2 طقوس</strong> قدم مجانية',
    'page-membership.gold.p4': '<strong>خصم 15٪</strong> على جميع العلاجات الإضافية',
    'page-membership.gold.p5': 'حجز ذو أولوية — قبل 48 ساعة',
    'page-membership.gold.p6': '<strong>تصريح ضيف</strong> واحد سنويًا',
    'page-membership.gold.p7': 'طقس ترحيبي بالحمّام عند الاشتراك',
    'page-membership.gold.p8': 'رحلة سبا ليوم عيد الميلاد (90 دقيقة)',
    'page-membership.gold.p9': 'فعاليات موسمية حصرية للأعضاء',
    'page-membership.gold.cta': '<i class="fas fa-crown"></i> كن عضوًا ذهبيًا',

    // Platinum
    'page-membership.platinum.name': 'الدائرة الملكية',
    'page-membership.platinum.sub': 'سكونٌ بلا حدود — أعلى مستويات العناية، للأكثر تفانيًا.',
    'page-membership.platinum.price': '750<small>د.ب · سنويًا</small>',
    'page-membership.platinum.p1': '<strong>غير محدودة</strong> جلسات التدليك المميَّز (حد أقصى 2 شهريًا)',
    'page-membership.platinum.p2': '<strong>12 طقسًا</strong> للحمّام الملكي سنويًا',
    'page-membership.platinum.p3': '<strong>4 جلسات</strong> الحجر الحار مشمولة',
    'page-membership.platinum.p4': '<strong>خصم 20٪</strong> على العلاجات والمنتجات الإضافية',
    'page-membership.platinum.p5': 'حجز ذو أولوية — في أي وقت',
    'page-membership.platinum.p6': '<strong>4 تصاريح ضيوف</strong> سنويًا',
    'page-membership.platinum.p7': 'طقس ترحيبي في «جناح السلطان»',
    'page-membership.platinum.p8': 'مطابقة معالجٍ شخصي',
    'page-membership.platinum.p9': 'يوم عيد ميلاد في السبا (4 ساعات)',
    'page-membership.platinum.p10': 'صندوق هدايا سنوي من المنتجات الفاخرة',
    'page-membership.platinum.p11': 'جدولة المواعيد عبر الكونسيرج',
    'page-membership.platinum.cta': '<i class="fas fa-star"></i> كن عضوًا بلاتينيًا',

    /* ---------------- HOME — extras added via admin CMS ---------------- */
    'page-home.marquee.items': 'الحمّام الملكي\nطقس زيت الأركان\nالحجر الحار\nحمّام الدار البيضاء\nملاذ الأزواج\nالتدليك العميق',
    'page-home.benefits.c1Title': 'تشعر بالتوتّر والتيبّس طوال اليوم',
    'page-home.benefits.c1Body':  'جسدك يبدو ثقيلًا ومشدودًا ويصعب تحريكه — حتى بعد الراحة.',
    'page-home.benefits.c2Title': 'تعيش مع ألمٍ مستمر',
    'page-home.benefits.c2Body':  'تتعامل مع الأوجاع، أو الألم المزمن، أو عدم الراحة الجسدية يوميًا.',
    'page-home.benefits.c3Title': 'تكافح للنوم ليلاً',
    'page-home.benefits.c3Body':  'تستلقي مرهقًا لكن لا تستطيع التوقّف أو الاستراحة كما يجب.',
    'page-home.benefits.c4Title': 'مغمورٌ بالضغوط',
    'page-home.benefits.c4Body':  'تشعر بالقلق والتوتر وعدم القدرة على الاسترخاء مهما حاولت.',
    'page-home.benefits.c5Title': 'تشعر بالإرهاق والتعب',
    'page-home.benefits.c5Body':  'طاقةٌ منخفضة، ومزاجٌ متعب، وصعوبةٌ في الشعور بأنك على طبيعتك.',

    'page-home.after.c1Title': 'استرخاءٌ عميق',
    'page-home.after.c1Body':  'تمتّع باسترخاءٍ عميقٍ وراحة.',
    'page-home.after.c2Title': 'خطواتٌ نحو عالم الشفاء',
    'page-home.after.c2Body':  'لجسدك وروحك.',
    'page-home.after.c3Title': 'خفّةٌ في جسدك',
    'page-home.after.c3Body':  'اشعر بالخفّة في العضلات والمفاصل.',
    'page-home.after.c4Title': 'ابدأ رحلتك',
    'page-home.after.c4Body':  'للتجديد والشفاء.',

    'page-home.treatments.subtitle': 'من العلاج العميق إلى الحمّام الملكي — كل طقسٍ يُقدَّم بهدوء، شخصي بعمق، ومصمَّم لاستعادة توازنك.',
    'page-home.treatments.button':   'استعرض القائمة الكاملة',

    'page-home.pricing.subtitle': 'ثلاث طرق لاختبار تاج السكون — اختر ما يناسبك اليوم.',
    'page-home.pricing.button':   'احجز جلستك',
    'page-home.pricing.unit':     '/ جلسة · د.ب',
    'page-home.pricing.c1Name':   'أساسي',
    'page-home.pricing.c1Bullets':'تدليك سويدي أو كازابلانكا (60 دقيقة)\nزيوت عطرية\nشاي عشبي بعد الجلسة\n~ كمّادة الأعشاب الساخنة\n~ ريفلكسولوجي القدم',
    'page-home.pricing.c2Name':   'قياسي',
    'page-home.pricing.c2Bullets':'تدليك تقليدي 90 دقيقة\nزيوت عطرية\nكمّادة الأعشاب الساخنة\nريفلكسولوجي القدم (15 دقيقة)\n~ علاج الحجر الحار',
    'page-home.pricing.c3Name':   'مميّز',
    'page-home.pricing.c3Bullets':'طقس فاخر 120 دقيقة\nزيوت عطرية\nكمّادة الأعشاب الساخنة\nريفلكسولوجي القدم (30 دقيقة)\nعلاج الحجر الحار',

    'page-home.offer.namePh':  'الاسم *',
    'page-home.offer.emailPh': 'البريد الإلكتروني *',
    'page-home.offer.phonePh': 'الهاتف (اختياري)',
    'page-home.offer.button':  'احصل على خصم 10٪',

    /* ---------------- ABOUT — extras added via admin CMS ---------------- */
    'page-about.story.eyebrow': 'قصتنا',

    'page-about.mission.eyebrow':     'غايتنا',
    'page-about.mission.missionLine': '— أن نخلق لحظاتٍ من الاستعادة الكاملة للجسد والعقل والروح.',
    'page-about.mission.missionBody': 'نقدّم طقوس عافيةٍ أصيلةٍ يؤديها خبراء بمكوّناتٍ طبيعيةٍ فاخرة في بيئةٍ مصمّمة للسكينة.',
    'page-about.mission.visionLine':  '— أن نكون الاسم الأكثر ثقةً في البحرين في العافية الشاملة.',
    'page-about.mission.visionBody':  'وجهةٌ يعود إليها الضيوف — ليس فقط من أجل العلاجات، بل من أجل الشعور الذي يمتدّ طويلًا بعد رحيلهم.',

    'page-about.values.c1Title': 'الجودة',
    'page-about.values.c1Body':  'مكوّناتٌ فاخرة، تقنياتٌ موثوقة، ولا اختصارات — أبدًا.',
    'page-about.values.c2Title': 'الخصوصية',
    'page-about.values.c2Body':  'غرفٌ خاصة ومريحة مصممة لراحتك المطلقة.',
    'page-about.values.c3Title': 'العناية',
    'page-about.values.c3Body':  'دفءٌ صادق في كل ترحيب وكل لمسة وكل وداع.',
    'page-about.values.c4Title': 'التميّز',
    'page-about.values.c4Body':  'محترفون مدرَّبون متفانون في إتقان حرفتهم.',

    'page-about.meetTeam.eyebrow': 'تعرّف على الفريق',
    'page-about.meetTeam.title':   'أيادٍ <em>تفهم</em>.',
    'page-about.meetTeam.p1':      'يحمل معالجونا سنواتٍ من التدريب في الأساليب التايلاندية والبالية والمغربية والسويدية والعميقة. كلٌّ منهم يحمل شهاداتٍ دولية، ويُختار قدر اختياره لمهارته التقنية لدفئه وحضوره.',
    'page-about.meetTeam.p2':      'ما يجمعهم إيمانٌ مشترك — أن العافية الحقيقية تحدث حين يشعر الضيوف بأمانٍ كامل، وبأنهم مرئيّون، ومُعتنىً بهم تمامًا.',
    'page-about.meetTeam.bullet1': 'معالجون معتمدون دوليًا',
    'page-about.meetTeam.bullet2': 'فريقٌ متعدّد اللغات (العربية، الإنجليزية وغيرها)',
    'page-about.meetTeam.bullet3': 'تدريبٌ مستمر على التقنيات الحديثة',

    'page-about.team.body':    'مملكة البحرين · س.ت. 182250-1',
    'page-about.team.b1Label': 'مرخّص في البحرين',
    'page-about.team.b2Label': 'منتجات طبيعية',
    'page-about.team.b3Label': 'معتمَد للنظافة',
    'page-about.team.b4Label': 'خدمةٌ بمستوى الجوائز',

    /* ---------------- GALLERY — tile captions ---------------- */
    'page-gallery.tiles.t01Label': 'ملاذ السكون',
    'page-gallery.tiles.t02Label': 'جناحٌ خاص',
    'page-gallery.tiles.t03Label': 'ترحيبٌ دافئ',
    'page-gallery.tiles.t04Label': 'علاج التدليك العميق',
    'page-gallery.tiles.t05Label': 'ممرٌّ إلى السكون',
    'page-gallery.tiles.t06Label': 'البهو',
    'page-gallery.tiles.t07Label': 'الصالة',
    'page-gallery.tiles.t08Label': 'تحضير الطقس',
    'page-gallery.tiles.t09Label': 'ملاذ الأزواج',
    'page-gallery.tiles.t10Label': 'زيوت فاخرة',
    'page-gallery.tiles.t11Label': 'منتجات منتقاة',
    'page-gallery.tiles.t12Label': 'تفصيلٌ هادئ',
    'page-gallery.tiles.t13Label': 'محور البهو',
    'page-gallery.tiles.t14Label': 'تفاصيل داخلية',
    'page-gallery.tiles.t15Label': 'الفريق',
    'page-gallery.tiles.t16Label': 'جناح الاسترخاء',
    'page-gallery.tiles.t17Label': 'الحجر الحار',
    'page-gallery.tiles.t18Label': 'طقس القدم',
    'page-gallery.tiles.t19Label': 'المدخل',
    'page-gallery.tiles.t20Label': 'مبنى 950',
    // Gallery — Instagram CTA + Reserve CTA banner
    'page-gallery.instagram.eyebrow': 'تابع رحلتنا',
    'page-gallery.instagram.title':   'تابعنا على <em>إنستغرام</em>.',
    'page-gallery.instagram.body':    'لحظاتٌ يومية من داخل الملاذ — علاجات، طقوس، وعروض موسمية.',
    'page-gallery.cta.eyebrow': 'هل أنت مستعد للدخول؟',
    'page-gallery.cta.title':   'احجز <em>زيارتك</em>.',
    'page-gallery.cta.body':    'مواعيد اليوم نفسه متاحة غالبًا — احجز لحظتك.',

    // Membership intro — user's edited copy translated
    'page-membership.intro.eyebrow': 'ثلاث فئات · ملاذٌ واحد',
    'page-membership.intro.title':   'عضوية <em>مصمَّمة للزوّار الدائمين</em>.',

    // Membership second big quote (below tier cards)
    'page-membership.quote2.quote': '«في عامٍ كامل، يتحوّل ما يبدو اليوم رفاهيةً إلى <em>إيقاعٍ هادئ</em> — يُعيد تشكيلك.»',
    'page-membership.quote2.by':    '— مديرة السبا',

    // Contact "Find Us" body
    'page-contact.visit.body': 'الفاتح، المنامة · مجمع 324 · طريق 2416 · مبنى 950 · مملكة البحرين',

    /* ---------------- MEMBERSHIP — intro + new tier schema ---------------- */
    'page-membership.intro.body': 'اختر الفئة التي تناسب إيقاعك. كل عضوية تُشترى سنويًا، وتشمل مجموعةً سخيّة من الخدمات المميَّزة المجانية، وتفتح أسعارًا خاصة بالأعضاء على كل علاجٍ وباقة ومنتج إضافي.',

    'page-membership.tiersShared.perksLabel': 'مشمولة سنويًا',
    'page-membership.tiersShared.badgeText':  'الأكثر شعبية',

    'page-membership.silver.tier':     'فضّي',
    'page-membership.silver.sub':      'دعوةٌ للبدء — عامٌ من اللحظات المختارة بعناية.',
    'page-membership.silver.unit':     'د.ب · سنويًا',
    'page-membership.silver.perks':    '**2 جلسات** تدليك مميَّز مجانية (60 دقيقة)\n**1 طقس** ريفلكسولوجي للقدم مجاني\n**خصم 10٪** على جميع العلاجات الإضافية\nحجز ذو أولوية — قبل 24 ساعة\nطقس ترحيبي عند الاشتراك\nهدية عيد الميلاد — جلسة قدم مجانية\nعروض موسمية حصرية للأعضاء',
    'page-membership.silver.ctaLabel': 'كن عضوًا فضّيًا',

    'page-membership.gold.tier':     'ذهبي',
    'page-membership.gold.sub':      'عامٌ سخيّ من الاستعادة المنتظمة والعناية المميَّزة.',
    'page-membership.gold.unit':     'د.ب · سنويًا',
    'page-membership.gold.perks':    '**6 جلسات** تدليك مميَّز مجانية (60 دقيقة)\n**1 طقس** الحمّام الملكي مشمول\n**2 طقوس** قدم مجانية\n**خصم 15٪** على جميع العلاجات الإضافية\nحجز ذو أولوية — قبل 48 ساعة\n**تصريح ضيف** واحد سنويًا\nطقس ترحيبي بالحمّام عند الاشتراك\nرحلة سبا ليوم عيد الميلاد (90 دقيقة)\nفعاليات موسمية حصرية للأعضاء',
    'page-membership.gold.ctaLabel': 'كن عضوًا ذهبيًا',

    'page-membership.platinum.tier':     'بلاتيني',
    'page-membership.platinum.sub':      'سكونٌ بلا حدود — أعلى مستويات العناية، للأكثر تفانيًا.',
    'page-membership.platinum.unit':     'د.ب · سنويًا',
    'page-membership.platinum.perks':    '**غير محدودة** جلسات التدليك المميَّز (حد أقصى 2 شهريًا)\n**12 طقسًا** للحمّام الملكي سنويًا\n**4 جلسات** الحجر الحار مشمولة\n**خصم 20٪** على العلاجات والمنتجات الإضافية\nحجز ذو أولوية — في أي وقت\n**4 تصاريح ضيوف** سنويًا\nطقس ترحيبي في «جناح السلطان»\nمطابقة معالجٍ شخصي\nيوم عيد ميلاد في السبا (4 ساعات)\nصندوق هدايا سنوي من المنتجات الفاخرة\nجدولة المواعيد عبر الكونسيرج',
    'page-membership.platinum.ctaLabel': 'كن عضوًا بلاتينيًا',

    'page-membership.compare.headerBenefit': 'الميزة',
    'page-membership.compare.colSilver':     'فضّي',
    'page-membership.compare.colGold':       'ذهبي',
    'page-membership.compare.colPlatinum':   'بلاتيني',
    'page-membership.compare.rows':          '== الاستثمار السنوي\n**السعر سنويًا** | 150 BHD | 350 BHD | 750 BHD\n\n== الخدمات المجانية\nجلسات تدليك مميَّز (60 دقيقة) | 2 | 6 | غير محدودة (2/شهر)\nطقوس الحمّام الملكي | x | 1 | 12 سنويًا\nطقوس القدم (ريفلكسولوجي) | 1 | 2 | غير محدودة\nجلسات الحجر الحار | x | x | 4 سنويًا\n\n== أسعار العضو\nخصم على العلاجات الإضافية | 10٪ | 15٪ | 20٪\nخصم على المنتجات | x | 10٪ | 20٪\n\n== الحجز والامتيازات\nنافذة الحجز ذو الأولوية | 24 ساعة | 48 ساعة | في أي وقت\nتصاريح الضيوف سنويًا | x | 1 | 4\nمطابقة معالجٍ شخصي | x | x | ✓\nجدولة الكونسيرج | x | x | ✓\n\n== الترحيب والمناسبات الخاصة\nطقس الترحيب عند الاشتراك | راحة القدم | الحمّام | جناح السلطان\nهدية عيد الميلاد | راحة القدم | رحلة سبا 90 دقيقة | يوم سبا 4 ساعات\nصندوق هدايا سنوي | x | x | ✓\nفعاليات حصرية للأعضاء | x | ✓ | ✓',
    'page-membership.compare.ctaLabel':      'تحدّث مع فريقنا',

    'page-membership.portal.copyTitle': 'لوحة عضوٍ <em>أنيقة وبسيطة</em>.',
    'page-membership.portal.copyBody':  'يحصل كل عضو في تاج السكون على حسابٍ شخصي يعرض رصيد خدماته المجانية، وحجوزاته القادمة، ورقم العضوية للدفع السريع.',
    'page-membership.portal.bullets':   'تابع رصيد خدماتك المجانية فورًا\nاحجز برقم العضوية — دون الحاجة للدفع للخدمات المشمولة\nطبّق خصم العضوية تلقائيًا عند الدفع\nاستقبل تذكيرات التجديد قبل 30 يومًا من انتهاء العضوية\nأدِر تصاريح الضيوف والهدايا',
    'page-membership.portal.ctaLabel':  'استعرض بوابة العضو',
    'page-membership.portal.cardName':   'فاطمة أ.',
    'page-membership.portal.cardJoined': 'عضوة منذ 2025',
    'page-membership.portal.cardTier':   'ذهبي',
    'page-membership.portal.idLabel':    'رقم العضوية',
    'page-membership.portal.cardId':     'TAS-2025-0047',
    'page-membership.portal.stat1Num':   '4',
    'page-membership.portal.stat1Label': 'تدليكات متبقية',
    'page-membership.portal.stat2Num':   '1',
    'page-membership.portal.stat2Label': 'حمّامات متبقية',
    'page-membership.portal.stat3Num':   '2',
    'page-membership.portal.stat3Label': 'طقوس قدم',
    'page-membership.portal.stat4Num':   '15٪',
    'page-membership.portal.stat4Label': 'خصم العضو',

    'page-membership.process.s1Title': 'اختر فئتك',
    'page-membership.process.s1Body':  'فضّي، ذهبي، أو بلاتيني — اختر الباقة التي تناسب إيقاعك.',
    'page-membership.process.s2Title': 'ادفع سنويًا',
    'page-membership.process.s2Body':  'دفعةٌ سنوية واحدة عبر التحويل البنكي أو في السبا. لا رسوم شهرية.',
    'page-membership.process.s3Title': 'طقس الترحيب',
    'page-membership.process.s3Body':  'استلم بطاقة عضويتك واستمتع بجلسة ترحيبٍ مجانية.',
    'page-membership.process.s4Title': 'استمتع وجدّد',
    'page-membership.process.s4Body':  'استخدم خدماتك على مدار العام. تذكيرٌ تلقائي قبل التجديد.',

    'page-membership.perks.eyebrow':  'لماذا تصبح عضوًا',
    'page-membership.perks.title':    'أكثر <em>المزايا</em> محبّةً.',
    'page-membership.perks.p1Title':  'ادفع مرة، ووفّر طوال العام',
    'page-membership.perks.p1Body':   'حتى 40٪ توفير مقارنةً بالدفع لكل زيارة. الأعضاء يوفّرون أكثر في كل مرة.',
    'page-membership.perks.p2Title':  'حجزٌ ذو أولوية',
    'page-membership.perks.p2Body':   'الأعضاء يحصلون على أولوية الوصول إلى المواعيد المسائية وعطلات نهاية الأسبوع والمواسم.',
    'page-membership.perks.p3Title':  'اصطحب ضيفًا',
    'page-membership.perks.p3Body':   'يحصل الأعضاء الذهبيون والبلاتينيون على تصاريح ضيوف — شارك السكون.',
    'page-membership.perks.p4Title':  'هدية عيد الميلاد',
    'page-membership.perks.p4Body':   'طقس احتفالٍ مجاني في يوم ميلادك أو حوله، كل عام.',

    'page-membership.faq.eyebrow': 'أسئلة شائعة',
    'page-membership.faq.title':   'إجاباتٌ <em>لأسئلتك</em>.',
    'page-membership.faq.items':   'Q: ما مدة سريان العضوية؟\nA: 12 شهرًا من تاريخ التفعيل. تُرسَل تذكيرات التجديد قبل 30 يومًا.\n\nQ: هل يمكنني مشاركة عضويتي مع العائلة؟\nA: العضويات شخصية، لكن الفئتين الذهبية والبلاتينية تشملان تصاريح ضيوف للمشاركة. تتوفر عضويات عائلية — تحدّث مع فريقنا.\n\nQ: ماذا يحدث إن لم أستخدم كل خدماتي المشمولة؟\nA: لا تُرحَّل الخدمات غير المستخدَمة، لكنّك تحصل على حوافز تجديدٍ إذا استخدمت معظم مزاياك في السنة الأولى.\n\nQ: هل يمكنني الترقية من الفضّي إلى الذهبي في منتصف السنة؟\nA: نعم. يُحتسَب الفرق بالتناسب وتُفعَّل مزاياك فورًا.\n\nQ: كيف أدفع؟\nA: شخصيًا في السبا، أو بتحويل بنكي، أو عبر رابط الدفع الآمن المُرسَل على واتساب.\n\nQ: هل تتوفر باقات شركاتٍ أو عافيةٍ مؤسّسية؟\nA: نعم — نقدّم عضويات عافيةٍ مخصّصة للشركات لفِرَقٍ من 5 أشخاص أو أكثر. تواصل معنا للتفاصيل.',

    /* ---------------- CONTACT — full coverage ---------------- */
    'page-contact.form.eyebrow':        'أرسل رسالة',
    'page-contact.form.title':          'استفسر أو <em>احجز</em>.',
    'page-contact.form.body':           'أخبرنا كيف نساعدك — أسئلة الأسعار، الحجوزات الجماعية، استفسارات العضوية، أو أي شيءٍ آخر. سنرسل رسالتك مباشرةً إلى فريق الاستقبال عبر واتساب.',
    'page-contact.form.labelName':      'الاسم الكامل',
    'page-contact.form.phName':         'اسمك',
    'page-contact.form.labelPhone':     'الهاتف',
    'page-contact.form.phPhone':        '+973 …',
    'page-contact.form.labelEmail':     'البريد الإلكتروني',
    'page-contact.form.phEmail':        'you@email.com',
    'page-contact.form.labelSubject':   'الموضوع',
    'page-contact.form.subjectOptions': 'استفسارٌ عام\nسؤال عن الحجز\nحجز جماعي / للأزواج\nاستفسار عن العضوية\nشركاتٌ / فعاليات\nملاحظات',
    'page-contact.form.labelMessage':   'الرسالة',
    'page-contact.form.phMessage':      'كيف يمكننا مساعدتك؟',
    'page-contact.form.buttonText':     'إرسال عبر واتساب',

    'page-contact.hours.eyebrow': 'ساعات العمل',
    'page-contact.hours.title':   'متى <em>تزور</em>.',
    'page-contact.hours.list':    'السبت | 10:00 ص – 6:00 م\nالأحد | 10:00 ص – 6:00 م\nالاثنين | 10:00 ص – 6:00 م\nالثلاثاء | 10:00 ص – 6:00 م\nالأربعاء | 10:00 ص – 6:00 م\nالخميس | 10:00 ص – 6:00 م\nالجمعة | 10:00 ص – 6:00 م',

    'page-contact.walkins.title': 'الزيارات بدون حجز مرحَّبٌ بها',
    'page-contact.walkins.body':  'نحرص على استقبال الزيارات بدون موعد قدر الإمكان. لضمان وقتك، خاصةً في المساء وعطلات نهاية الأسبوع، يُفضَّل الحجز مسبقًا.',
    'page-contact.follow.title':  'تابعنا',
    'page-contact.cta.eyebrow':   'أو تخطّ النموذج',
    'page-contact.cta.title':     'تواصل معنا <em>عبر واتساب</em>.',
    'page-contact.cta.body':      'الأسرع للوصول إلينا — الرد عادةً خلال 10 دقائق.',
    'page-contact.cta.button':    'تواصل عبر واتساب الآن'
  },

  /* ---------------- Service catalogue (dynamic cards) ---------------------- */
  // Keyed by the English service name (matches the service row in Supabase).
  // Both name and desc are swapped on the rendered .svc-card and the booking
  // service picker; caching uses data-en-name / data-en-desc for EN-restore.
  services: {
    'Royal Hammam':      { name: 'الحمّام الملكي',       desc: 'طقس بخار فاخر يجمع التقشير والتنظيف العميق — لتنقية الجسد والبشرة.' },
    'Casablanca Hammam': { name: 'حمّام الدار البيضاء',   desc: 'طقس عافية مميَّز يجمع البخار والتقشير والتنظيف لاستعادة التوازن الداخلي.' },
    'Argan Oil Ritual':  { name: 'طقس زيت الأركان',       desc: 'تدليكٌ فاخر بزيت الأركان المغربي الغني لتغذية البشرة وتخفيف التوتر.' },
    'Hot Stone Therapy': { name: 'علاج الحجر الحار',     desc: 'أحجارٌ بركانية دافئة تُرخي العضلات، وتنشّط الدورة الدموية، وتعزّز العافية الشاملة.' },
    'Aroma Relaxing':    { name: 'التدليك العطري المريح', desc: 'تدليكٌ مهدّئٌ بعمق بالزيوت العطرية الأساسية لتخفيف التوتر وموازنة الحواس.' },
    'Balinese Massage':  { name: 'التدليك البالي',        desc: 'علاجٌ شامل يمزج التمدّدات اللطيفة والحركات الإيقاعية والزيوت العطرية.' },
    'Royal Thai':        { name: 'التايلاندي الملكي',     desc: 'تمدّدات إيقاعية تقليدية وحركات مساعِدة لاستعادة تدفّق الطاقة.' },
    'Swedish Massage':   { name: 'التدليك السويدي',       desc: 'تدليكٌ كلاسيكي لكامل الجسم بضغطٍ خفيف إلى متوسط لتخفيف التوتر.' },
    'Deep Tissue':       { name: 'التدليك العميق',        desc: 'تخفيفٌ موجَّه للتوتر المزمن، وتحسينٌ للحركة، وتعافٍ عضلي يدوم.' },
    'Reflexology':       { name: 'الريفلكسولوجي',         desc: 'تدليكٌ علاجي للقدم بضغطٍ لطيف على نقاطٍ محدّدة لتخفيف التوتر.' },
    'Foot Relaxing':     { name: 'راحة القدم',            desc: 'تدليكٌ مهدّئ للقدم يخفّف التعب ويدعم التوازن العام.' },
    'Couples Sanctuary': { name: 'ملاذ الأزواج',          desc: 'تجربةٌ للزوجين جنبًا إلى جنب — اختر تدليكك في جناحٍ خاص مع الشموع والشاي.' },
    'Sultan Suite':      { name: 'جناح السلطان',          desc: 'تتابعٌ فاخرٌ مصمَّم لاستعادةٍ تستغرق اليوم بكامله.' }
  }
};
