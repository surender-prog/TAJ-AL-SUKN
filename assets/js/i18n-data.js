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
    'Become a Platinum Member': 'كن عضوًا بلاتينيًا'
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
    'page-home.founder.role': 'المؤسِّسة',
    'page-home.testimonials.eyebrow': 'آراء عملائنا',
    'page-home.testimonials.title': 'كلماتٌ ممّن <em>زارونا</em>.',
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
    'page-contact.visit.title': 'مبنى <em>950</em>'
  }
};
