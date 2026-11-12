import { AppLanguage } from '@/src/types/settings';

export interface TranslationStrings {
  nav: {
    home: string;
    liveTv: string;
    categories: string;
    favorites: string;
    search: string;
    settings: string;
    admin: string;
  };
  common: {
    watchNow: string;
    live: string;
    demoPlaceholder: string;
    favorite: string;
    favorited: string;
    share: string;
    all: string;
    clear: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    retry: string;
    loading: string;
    channelsCount: string;
    offlineBanner: string;
    localDemoBadge: string;
    cloudSyncBadge: string;
    installApp: string;
    installIos: string;
  };
  home: {
    featuredKicker: string;
    continueWatching: string;
    recentlyAdded: string;
    popularChannels: string;
    favoriteChannels: string;
    recommendedChannels: string;
    browseByCategory: string;
    viewAll: string;
  };
  browse: {
    liveTitle: string;
    liveSubtitle: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
    favoritesTitle: string;
    favoritesSubtitle: string;
    favoritesEmptyTitle: string;
    favoritesEmptyDesc: string;
    searchTitle: string;
    searchPlaceholder: string;
    recentSearches: string;
    sortOrder: string;
    sortAlpha: string;
    sortRecent: string;
    sortPopular: string;
    onlyFavorites: string;
    noResultsTitle: string;
    noResultsDesc: string;
    exploreChannels: string;
  };
  player: {
    back: string;
    previousChannel: string;
    nextChannel: string;
    settings: string;
    quality: string;
    aspectRatio: string;
    fit: string;
    fill: string;
    original: string;
    speed: string;
    pip: string;
    fullscreen: string;
    exitFullscreen: string;
    reconnecting: string;
    connectionError: string;
    demoNoticeTitle: string;
    demoNoticeBody: string;
    previewTestSignal: string;
    stopTestSignal: string;
    openChannelManager: string;
    liveBroadcast: string;
    tryBackupStream: string;
    capabilitiesTitle: string;
  };
  settings: {
    title: string;
    subtitle: string;
    generalSection: string;
    language: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    appVersion: string;
    clearLocalData: string;
    clearLocalConfirm: string;
    playerSection: string;
    defaultAspectRatio: string;
    defaultVolume: string;
    autoplay: string;
    preferredQuality: string;
    rememberLastChannel: string;
    adminSection: string;
    openAdminConsole: string;
    dataSourceStatus: string;
    configureFirebase: string;
    aboutSection: string;
    aboutNova: string;
    privacyPolicy: string;
    termsOfUse: string;
    contactUs: string;
  };
  admin: {
    title: string;
    subtitle: string;
    addChannel: string;
    importM3u: string;
    exportJson: string;
    exportM3u: string;
    resetDefaults: string;
    signOut: string;
    localModeNoticeTitle: string;
    localModeNoticeBody: string;
    enterDemoAdmin: string;
    firebaseSignInTitle: string;
    firebaseSignInBody: string;
    email: string;
    password: string;
    signIn: string;
    searchPlaceholder: string;
    active: string;
    inactive: string;
    featured: string;
    testStream: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationStrings> = {
  en: {
    nav: {
      home: 'Home',
      liveTv: 'Live TV',
      categories: 'Categories',
      favorites: 'Favorites',
      search: 'Search',
      settings: 'Settings',
      admin: 'Channel Admin',
    },
    common: {
      watchNow: 'Watch Now',
      live: 'LIVE',
      demoPlaceholder: 'Demo Stream',
      favorite: 'Save to Favorites',
      favorited: 'Saved',
      share: 'Share',
      all: 'All',
      clear: 'Clear',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      retry: 'Retry',
      loading: 'Loading...',
      channelsCount: 'channels',
      offlineBanner: 'Offline Mode — Cached channel directory active',
      localDemoBadge: 'Local Demo Mode',
      cloudSyncBadge: 'Firebase Cloud Active',
      installApp: 'Install App',
      installIos: 'Install on iOS',
    },
    home: {
      featuredKicker: 'Featured Broadcast',
      continueWatching: 'Continue Watching',
      recentlyAdded: 'Recently Added',
      popularChannels: 'Popular Channels',
      favoriteChannels: 'Your Favorites',
      recommendedChannels: 'Recommended For You',
      browseByCategory: 'Browse by Category',
      viewAll: 'View All',
    },
    browse: {
      liveTitle: 'Live Television',
      liveSubtitle: 'Browse active free-to-air channels ready for streaming.',
      categoriesTitle: 'Channel Categories',
      categoriesSubtitle: 'Dynamically organized from the active channel catalog.',
      favoritesTitle: 'Favorite Channels',
      favoritesSubtitle: 'Quick access to the channels you watch most often.',
      favoritesEmptyTitle: 'No favorite channels yet',
      favoritesEmptyDesc: 'Tap the heart button on any channel card or player screen to save it here.',
      searchTitle: 'Search Channels',
      searchPlaceholder: 'Search by channel name, category, country, or language...',
      recentSearches: 'Recent Searches',
      sortOrder: 'Default Order',
      sortAlpha: 'A–Z',
      sortRecent: 'Recently Added',
      sortPopular: 'Most Popular',
      onlyFavorites: 'Favorites Only',
      noResultsTitle: 'No matching channels found',
      noResultsDesc: 'Try adjusting your search query or clearing active category filters.',
      exploreChannels: 'Explore Live TV',
    },
    player: {
      back: 'Back',
      previousChannel: 'Previous Channel',
      nextChannel: 'Next Channel',
      settings: 'Player Settings',
      quality: 'Stream Quality',
      aspectRatio: 'Aspect Ratio',
      fit: 'Fit',
      fill: 'Fill',
      original: 'Original',
      speed: 'Playback Speed',
      pip: 'Picture-in-Picture',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      reconnecting: 'Reconnecting to broadcast...',
      connectionError: 'Unable to load stream',
      demoNoticeTitle: 'Demonstration Placeholder Channel',
      demoNoticeBody:
        'This channel uses a non-operational example URL (.invalid). Replace it with your authorized HLS (.m3u8) or MP4 broadcast URL in Channel Admin, or launch the local test pattern below to verify player controls.',
      previewTestSignal: 'Preview Local Test Signal',
      stopTestSignal: 'Close Test Signal',
      openChannelManager: 'Edit in Channel Admin',
      liveBroadcast: 'Live Broadcast',
      tryBackupStream: 'Try Alternative Stream',
      capabilitiesTitle: 'Detected Browser Capabilities',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize playback, language, theme, and external channel storage.',
      generalSection: 'General',
      language: 'Language',
      theme: 'Appearance',
      themeDark: 'Dark (Cinema)',
      themeLight: 'Light',
      appVersion: 'App Version',
      clearLocalData: 'Clear Local Preferences',
      clearLocalConfirm: 'Local watch history, favorites, and search history have been cleared.',
      playerSection: 'Video Player',
      defaultAspectRatio: 'Default Aspect Ratio',
      defaultVolume: 'Default Volume',
      autoplay: 'Autoplay on Channel Open',
      preferredQuality: 'Preferred Stream Quality',
      rememberLastChannel: 'Remember Last Watched Channel',
      adminSection: 'Administration & Data Source',
      openAdminConsole: 'Open Channel Management',
      dataSourceStatus: 'Data Source Status',
      configureFirebase: 'Optional Firebase Connection',
      aboutSection: 'About & Legal',
      aboutNova: 'About NOVA TV',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      contactUs: 'Contact',
    },
    admin: {
      title: 'Channel Management',
      subtitle: 'Add, organize, test, import, and export authorized broadcast channels.',
      addChannel: 'Add Channel',
      importM3u: 'Import M3U',
      exportJson: 'Export JSON',
      exportM3u: 'Export M3U',
      resetDefaults: 'Reset Demo Data',
      signOut: 'Lock Workspace',
      localModeNoticeTitle: 'Local Demo Mode (Browser Storage Only)',
      localModeNoticeBody:
        'Firebase is not connected. Channel changes persist only in this browser via IndexedDB and no server authentication is active. Connect Firebase Authentication + Firestore in Settings or .env for real administrator access control.',
      enterDemoAdmin: 'Enter Local Demo Workspace',
      firebaseSignInTitle: 'Administrator Sign-In (Firebase Auth)',
      firebaseSignInBody: 'Sign in with an authorized administrator account configured in Firebase Authentication.',
      email: 'Administrator Email',
      password: 'Password',
      signIn: 'Sign In',
      searchPlaceholder: 'Filter channels by name, category, or country...',
      active: 'Active',
      inactive: 'Inactive',
      featured: 'Featured',
      testStream: 'Test URL',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      liveTv: 'البث المباشر',
      categories: 'التصنيفات',
      favorites: 'المفضلة',
      search: 'بحث',
      settings: 'الإعدادات',
      admin: 'إدارة القنوات',
    },
    common: {
      watchNow: 'شاهد الآن',
      live: 'مباشر',
      demoPlaceholder: 'قناة تجريبية',
      favorite: 'أضف للمفضلة',
      favorited: 'في المفضلة',
      share: 'مشاركة',
      all: 'الكل',
      clear: 'مسح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      retry: 'إعادة المحاولة',
      loading: 'جارٍ التحميل...',
      channelsCount: 'قناة',
      offlineBanner: 'وضع عدم الاتصال — يتم استخدام الدليل المخزن مؤقتًا',
      localDemoBadge: 'الوضع التجريبي المحلي',
      cloudSyncBadge: 'متصل بسحابة Firebase',
      installApp: 'تثبيت التطبيق',
      installIos: 'تثبيت على iOS',
    },
    home: {
      featuredKicker: 'البث المميز',
      continueWatching: 'متابعة المشاهدة',
      recentlyAdded: 'أُضيفت حديثًا',
      popularChannels: 'القنوات الأكثر متابعة',
      favoriteChannels: 'قنواتك المفضلة',
      recommendedChannels: 'مقترحة لك',
      browseByCategory: 'تصفح حسب التصنيف',
      viewAll: 'عرض الكل',
    },
    browse: {
      liveTitle: 'البث التلفزيوني المباشر',
      liveSubtitle: 'استكشف القنوات المفتوحة المجانية المصرّح بها.',
      categoriesTitle: 'تصنيفات القنوات',
      categoriesSubtitle: 'مصنفة تلقائيًا من قاعدة بيانات القنوات النشطة.',
      favoritesTitle: 'القنوات المفضلة',
      favoritesSubtitle: 'وصول سريع إلى القنوات التي تتابعها باستمرار.',
      favoritesEmptyTitle: 'لا توجد قنوات مفضلة بعد',
      favoritesEmptyDesc: 'اضغط على زر القلب في أي بطاقة قناة أو داخل المشغل لحفظها هنا.',
      searchTitle: 'البحث عن القنوات',
      searchPlaceholder: 'ابحث باسم القناة أو التصنيف أو الدولة أو اللغة...',
      recentSearches: 'عمليات البحث الأخيرة',
      sortOrder: 'الترتيب الافتراضي',
      sortAlpha: 'أبجديًا',
      sortRecent: 'الأحدث إضافة',
      sortPopular: 'الأكثر شعبية',
      onlyFavorites: 'المفضلة فقط',
      noResultsTitle: 'لم يتم العثور على قنوات مطابقة',
      noResultsDesc: 'جرّب تعديل كلمات البحث أو إزالة الفلاتر المحددة.',
      exploreChannels: 'استكشاف البث المباشر',
    },
    player: {
      back: 'رجوع',
      previousChannel: 'القناة السابقة',
      nextChannel: 'القناة التالية',
      settings: 'إعدادات المشغل',
      quality: 'جودة البث',
      aspectRatio: 'نسبة العرض',
      fit: 'احتواء',
      fill: 'ملء الشاشة',
      original: 'الأصلي',
      speed: 'سرعة التشغيل',
      pip: 'صورة داخل صورة',
      fullscreen: 'ملء الشاشة',
      exitFullscreen: 'إنهاء ملء الشاشة',
      reconnecting: 'جارٍ إعادة الاتصال بالبث...',
      connectionError: 'تعذر تحميل البث',
      demoNoticeTitle: 'قناة تجريبية توضيحية',
      demoNoticeBody:
        'تستخدم هذه القناة رابطًا تجريبيًا غير فعّال (.invalid). استبدله برابط HLS (.m3u8) أو MP4 مصرّح به من لوحة إدارة القنوات، أو شغّل إشارة الاختبار المحلية أدناه لتجربة المشغل.',
      previewTestSignal: 'معاينة إشارة اختبار محلية',
      stopTestSignal: 'إغلاق إشارة الاختبار',
      openChannelManager: 'تعديل في إدارة القنوات',
      liveBroadcast: 'بث مباشر',
      tryBackupStream: 'تجربة الرابط البديل',
      capabilitiesTitle: 'قدرات المتصفح المكتشفة',
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'تخصيص المشغل واللغة والمظهر ومصدر بيانات القنوات.',
      generalSection: 'عام',
      language: 'اللغة',
      theme: 'المظهر',
      themeDark: 'داكن (سينمائي)',
      themeLight: 'فاتح',
      appVersion: 'إصدار التطبيق',
      clearLocalData: 'مسح البيانات المحلية',
      clearLocalConfirm: 'تم مسح سجل المشاهدة والمفضلة وسجل البحث المحلي.',
      playerSection: 'مشغل الفيديو',
      defaultAspectRatio: 'نسبة العرض الافتراضية',
      defaultVolume: 'مستوى الصوت الافتراضي',
      autoplay: 'التشغيل التلقائي عند فتح القناة',
      preferredQuality: 'الجودة المفضلة للبث',
      rememberLastChannel: 'تذكر آخر قناة تمت مشاهدتها',
      adminSection: 'الإدارة ومصدر البيانات',
      openAdminConsole: 'فتح إدارة القنوات',
      dataSourceStatus: 'حالة مصدر البيانات',
      configureFirebase: 'ربط Firebase الاختياري',
      aboutSection: 'حول التطبيق والسياسات',
      aboutNova: 'حول NOVA TV',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfUse: 'شروط الاستخدام',
      contactUs: 'تواصل معنا',
    },
    admin: {
      title: 'إدارة القنوات الخارجية',
      subtitle: 'إضافة القنوات المصرّح بها وتعديلها واختبار روابطها واستيرادها وتصديرها.',
      addChannel: 'إضافة قناة',
      importM3u: 'استيراد M3U',
      exportJson: 'تصدير JSON',
      exportM3u: 'تصدير M3U',
      resetDefaults: 'استعادة البيانات التجريبية',
      signOut: 'قفل لوحة الإدارة',
      localModeNoticeTitle: 'الوضع التجريبي المحلي (تخزين المتصفح فقط)',
      localModeNoticeBody:
        'لم يتم ربط Firebase بعد. تُحفظ التعديلات في هذا المتصفح فقط عبر IndexedDB ولا يوجد تحقق خادمي. اربط Firebase Authentication وFirestore لتفعيل صلاحيات المدير الحقيقية.',
      enterDemoAdmin: 'فتح مساحة التجربة المحلية',
      firebaseSignInTitle: 'تسجيل دخول المدير (Firebase Auth)',
      firebaseSignInBody: 'سجّل الدخول بحساب المدير المعتمد في Firebase Authentication.',
      email: 'البريد الإلكتروني للمدير',
      password: 'كلمة المرور',
      signIn: 'تسجيل الدخول',
      searchPlaceholder: 'تصفية القنوات حسب الاسم أو التصنيف أو الدولة...',
      active: 'مفعّلة',
      inactive: 'معطّلة',
      featured: 'مميزة',
      testStream: 'اختبار الرابط',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      liveTv: 'TV en direct',
      categories: 'Catégories',
      favorites: 'Favoris',
      search: 'Recherche',
      settings: 'Paramètres',
      admin: 'Gestion TV',
    },
    common: {
      watchNow: 'Regarder',
      live: 'DIRECT',
      demoPlaceholder: 'Flux Démo',
      favorite: 'Ajouter aux favoris',
      favorited: 'En favoris',
      share: 'Partager',
      all: 'Tout',
      clear: 'Effacer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      retry: 'Réessayer',
      loading: 'Chargement...',
      channelsCount: 'chaînes',
      offlineBanner: 'Mode hors ligne — Catalogue en cache utilisé',
      localDemoBadge: 'Mode Démo Local',
      cloudSyncBadge: 'Cloud Firebase Actif',
      installApp: "Installer l'app",
      installIos: 'Installer sur iOS',
    },
    home: {
      featuredKicker: 'À la une',
      continueWatching: 'Reprendre la lecture',
      recentlyAdded: 'Ajouts récents',
      popularChannels: 'Chaînes populaires',
      favoriteChannels: 'Vos favoris',
      recommendedChannels: 'Recommandées pour vous',
      browseByCategory: 'Parcourir par catégorie',
      viewAll: 'Tout voir',
    },
    browse: {
      liveTitle: 'Télévision en direct',
      liveSubtitle: 'Parcourez les chaînes gratuites autorisées prêtes pour la diffusion.',
      categoriesTitle: 'Catégories de chaînes',
      categoriesSubtitle: 'Générées dynamiquement depuis le catalogue actif.',
      favoritesTitle: 'Chaînes favorites',
      favoritesSubtitle: 'Accès rapide à vos chaînes préférées.',
      favoritesEmptyTitle: 'Aucun favori pour le moment',
      favoritesEmptyDesc: 'Touchez le cœur sur une carte ou dans le lecteur pour enregistrer une chaîne.',
      searchTitle: 'Rechercher une chaîne',
      searchPlaceholder: 'Rechercher par nom, catégorie, pays ou langue...',
      recentSearches: 'Recherches récentes',
      sortOrder: 'Ordre par défaut',
      sortAlpha: 'A–Z',
      sortRecent: 'Plus récentes',
      sortPopular: 'Plus populaires',
      onlyFavorites: 'Favoris uniquement',
      noResultsTitle: 'Aucune chaîne correspondante',
      noResultsDesc: 'Modifiez votre recherche ou réinitialisez les filtres de catégorie.',
      exploreChannels: 'Explorer le direct',
    },
    player: {
      back: 'Retour',
      previousChannel: 'Chaîne précédente',
      nextChannel: 'Chaîne suivante',
      settings: 'Paramètres du lecteur',
      quality: 'Qualité du flux',
      aspectRatio: "Format d'image",
      fit: 'Ajuster',
      fill: 'Remplir',
      original: 'Original',
      speed: 'Vitesse',
      pip: 'Image dans l’image',
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter le plein écran',
      reconnecting: 'Reconnexion au flux...',
      connectionError: 'Impossible de charger le flux',
      demoNoticeTitle: 'Chaîne de démonstration',
      demoNoticeBody:
        'Cette chaîne utilise une URL exemple non fonctionnelle (.invalid). Remplacez-la par votre flux HLS (.m3u8) ou MP4 autorisé dans Gestion TV, ou testez le signal local ci-dessous.',
      previewTestSignal: 'Aperçu du signal test local',
      stopTestSignal: 'Fermer le signal test',
      openChannelManager: 'Modifier dans Gestion TV',
      liveBroadcast: 'Diffusion en direct',
      tryBackupStream: 'Tester le flux alternatif',
      capabilitiesTitle: 'Capacités détectées du navigateur',
    },
    settings: {
      title: 'Paramètres',
      subtitle: 'Personnalisez la lecture, la langue, le thème et la source de données.',
      generalSection: 'Général',
      language: 'Langue',
      theme: 'Apparence',
      themeDark: 'Sombre (Cinéma)',
      themeLight: 'Clair',
      appVersion: "Version de l'application",
      clearLocalData: 'Effacer les préférences locales',
      clearLocalConfirm: "L'historique, les favoris et les recherches locales ont été effacés.",
      playerSection: 'Lecteur vidéo',
      defaultAspectRatio: 'Format par défaut',
      defaultVolume: 'Volume par défaut',
      autoplay: 'Lecture automatique',
      preferredQuality: 'Qualité préférée',
      rememberLastChannel: 'Mémoriser la dernière chaîne',
      adminSection: 'Administration et données',
      openAdminConsole: 'Ouvrir la gestion des chaînes',
      dataSourceStatus: 'Source de données',
      configureFirebase: 'Connexion Firebase optionnelle',
      aboutSection: 'À propos et mentions',
      aboutNova: 'À propos de NOVA TV',
      privacyPolicy: 'Politique de confidentialité',
      termsOfUse: "Conditions d'utilisation",
      contactUs: 'Contact',
    },
    admin: {
      title: 'Gestion des chaînes',
      subtitle: 'Ajoutez, modifiez, testez, importez et exportez vos chaînes autorisées.',
      addChannel: 'Ajouter une chaîne',
      importM3u: 'Importer M3U',
      exportJson: 'Exporter JSON',
      exportM3u: 'Exporter M3U',
      resetDefaults: 'Réinitialiser la démo',
      signOut: "Verrouiller l'espace",
      localModeNoticeTitle: 'Mode Démo Local (Stockage navigateur uniquement)',
      localModeNoticeBody:
        "Firebase n'est pas configuré. Les modifications sont conservées uniquement dans ce navigateur via IndexedDB sans authentification serveur.",
      enterDemoAdmin: "Ouvrir l'espace démo local",
      firebaseSignInTitle: 'Connexion Administrateur (Firebase Auth)',
      firebaseSignInBody: 'Connectez-vous avec un compte administrateur Firebase Auth autorisé.',
      email: 'E-mail administrateur',
      password: 'Mot de passe',
      signIn: 'Se connecter',
      searchPlaceholder: 'Filtrer par nom, catégorie ou pays...',
      active: 'Active',
      inactive: 'Inactive',
      featured: 'À la une',
      testStream: 'Tester URL',
    },
  },
};
