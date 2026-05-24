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

    // home — testimonial quotes + locations
    'Manama': 'المنامة',
    'Riffa': 'الرفاع',
    'Adliya': 'العدلية',
    'Seef': 'السيف',
    "A perfect escape from the city. The Royal Hammam left my skin glowing and my mind completely at ease. Sofia's touch is sheer magic.":
      'ملاذٌ مثاليّ بعيدًا عن صخب المدينة. الحمّام الملكي ترك بشرتي متألّقة وذهني في راحةٍ تامّة. لمسة صوفيا سحرٌ خالص.',
    "The atmosphere in the studio is incredibly calming from the very first minute. Sofia's touch is gentle and powerful, more than just a massage — it's therapy for the soul.":
      'الأجواء في الاستوديو مهدّئة بعمقٍ من الدقيقة الأولى. لمسة صوفيا لطيفةٌ وقويةٌ في آنٍ معًا — أكثر من مجرّد تدليك، إنه علاجٌ للروح.',
    "I've tried many massage therapists before, but Sofia's approach is truly unique. Each movement feels thoughtful and precise. My back pain has eased.":
      'جرّبت معالجين كثيرين من قبل، لكن أسلوب صوفيا فريدٌ حقًا. كل حركة تبدو مدروسة ودقيقة. وآلام ظهري خفّت.',
    "Last night I slept like a child! I immediately felt my upper back, my legs, neck and lower body felt so much lighter. After my session everything was toned. Thank you.":
      'نمت ليلة أمس كطفل! شعرت فورًا أن أعلى ظهري وساقَيّ ورقبتي وأسفل جسدي أصبحت أخفّ بكثير. بعد جلستي كان كل شيء في توازنه. شكرًا لكم.'
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
    'page-contact.visit.title': 'مبنى <em>950</em>',

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
    'page-membership.platinum.cta': '<i class="fas fa-star"></i> كن عضوًا بلاتينيًا'
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
