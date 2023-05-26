export namespace Constants {
    export class RealtimeDatabase {
        public static readonly users = 'users';
        public static readonly orders = 'orders';
        public static readonly rooms = 'rooms';
        public static readonly buses = 'buses';
        public static readonly address = 'address';
        public static readonly tickets = 'tickets';
        public static readonly settings = 'settings';
        public static readonly participants = 'participants';
    }

    export class Grid {
        public static small = 576;
        public static medium = 768;
        public static large = 992;
        public static extraLarge = 1200;
    }

    export class PageDirection {
        public static readonly ltr = 'ltr';
        public static readonly rtl = 'rtl';
    }

    export class ScreenWidth {
      static readonly tabletView = 769;
      static readonly mobileView = 576;
    }

    export class Languages {
        public static readonly languageKey = 'lang';
        public static readonly en = 'en';
        public static readonly ar = 'ar';
    }

    export class Routes {
        public static readonly login = 'login';
        public static readonly reset = 'reset';
        public static readonly home = 'home';
        public static readonly secure = 'secure';
        public static readonly dashboard = 'dashboard';
        public static readonly primary = 'primary';
        public static readonly all = 'all';
        public static readonly rooms = 'rooms';
        public static readonly buses = 'buses';
        public static readonly address = 'address';
        public static readonly statistics = 'statistics';
        public static readonly settings = 'settings';
        public static readonly users = 'users';
    }

    export class Regex {
        public static readonly arabicLetters = /^[\u0600-\u06FF\s]+$/;
        public static readonly mobileNumber = /^01[0125][0-9]{8}$/;
    }

    export class Images {
        public static readonly defaultSettingImg = 'assets/images/cover.jpg';
    }

    export class SocialMedia {
        static readonly whatsApp = 'whatsapp://send?text=&phone=';
        static readonly viber = 'viber://chat?number=';
        static readonly telegram = 'tg://resolve?phone='; 
    }
}