// サイト全体の設定。ここを書き換えると全ページに反映されます。
export const SITE = {
  name: '石黒いちご農園 いちごいちえ',
  shortName: 'いちごいちえ',
  enName: 'Ishiguro Strawberry Farm',
  catch: '安心安全な美味しいイチゴを目指して。',
  description:
    '栃木県宇都宮市の石黒いちご農園「いちごいちえ」。海と山のアミノ酸で育てた、完熟・朝摘みのとちおとめを直売・全国発送しています。',
  owner: '石黒 修',
  founded: 2010,
  variety: 'とちおとめ',
  address: '栃木県宇都宮市屋板町1690',
  naviHint: 'Googleマップ・カーナビで「石黒苺農園」と検索してください',
  geo: { lat: 36.512016, lng: 139.906887 },
  tel: '080-1131-5479',
  fax: '028-678-5114',
  email: 'bsgarden@docomo.ne.jp',
  // 営業情報（シーズンごとに変わるので、変更があればここを直す）
  season: '12月上旬〜5月下旬ごろ（年により前後します）',
  hours: '11:00〜14:00',
  hoursNote: '営業時間外の受け取りはご連絡ください',
  closed: '水曜日・日曜日',
  /**
   * ご注文フォームの送信先。
   * 空のままなら、入力内容をメールアプリで送る方式になります。
   * Googleフォームを作ったら action と entries の番号を設定してください。
   * （Googleフォームの「事前入力したURLを取得」で entry.○○ の番号を確認できます）
   */
  orderForm: {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSeOJ-Qex9Waf_NRf3Fkdv1UOpt4zJDzOZ3xuC3ivtRRsWkwxg/formResponse',
    entries: {
      name: 'entry.740250653',
      zip: 'entry.1739339688',
      address: 'entry.2107088272',
      tel: 'entry.1142574108',
      email: 'entry.2125797052',
      order: 'entry.289276212',
    },
  },
  bank: [
    '足利銀行 雀宮（すずめのみや）支店 普通預金 3361867 イシグロ オサム',
    '三井住友銀行 神田支店 普通預金 1967288 イシグロ オサム',
    'ゆうちょ銀行 記号番号 00120-6-600905 イシグロ オサム（当座預金 店番019）',
  ],
};

/** 商品と価格（税込）。価格は時期により変わります。 */
export const PRODUCTS = [
  {
    id: 'gift30',
    name: 'ギフト30粒',
    price: 4500,
    lead: '1粒30g前後の大粒をそろえた、ご贈答用の最上級品。',
    notes: ['ご予約制', '12月・1月はご注文が集中します。お早めにご連絡ください'],
    tag: 'ご贈答用',
  },
  {
    id: 'gift15',
    name: 'ギフト15粒',
    price: 2500,
    lead: 'ギフト30粒の半箱サイズ。',
    notes: ['ご予約制'],
    tag: 'ご贈答用',
  },
  {
    id: 'gift32',
    name: 'ギフト32粒',
    price: 3500,
    lead: '1粒25g前後の、形の良い美しいイチゴを集めたご贈答用セット。',
    notes: ['ご予約制'],
    tag: 'ご贈答用',
  },
  {
    id: 'gift16',
    name: 'ギフト16粒',
    price: 1800,
    lead: 'ギフト32粒の半箱サイズ。',
    notes: ['ご予約制'],
    tag: 'ご贈答用',
  },
  {
    id: 'deluxe',
    name: 'デラックス',
    price: 780,
    from: true, // 「〜」を付ける（時期により変わる）
    unit: '1パック',
    lead: '大粒を平らに並べた豪華な平積みパック。総量約320g。ご贈答にも一番人気です。',
    notes: ['1箱2パック入り'],
    tag: '一番人気',
  },
  {
    id: 'grande',
    name: 'グランデ',
    price: 480,
    from: true, // 「〜」を付ける（時期により変わる）
    unit: '1パック',
    lead: 'いろいろな大きさの苺を詰め合わせ。総量約260g。贈答用にもご家庭用にも。',
    notes: ['4パック入りと2パック入りの箱があります'],
    tag: 'ご家庭・贈答',
  },
  {
    id: 'marutoku',
    name: 'マル得パック',
    price: 300,
    from: true, // 「〜」を付ける（時期により変わる）
    unit: '1パック',
    lead: '形が不ぞろいなものや小粒を集めたパック。グランデと総量は同じの、お得なご家庭用です。',
    notes: [],
    tag: 'ご家庭用',
  },
  {
    id: 'jam',
    name: 'ジャム用',
    price: 300,
    from: true, // 「〜」を付ける（時期により変わる）
    lead: 'ジャムやスムージーなど、加工にぴったりの苺です。',
    notes: [],
    tag: '加工用',
  },
] as const;

export const NAV = [
  { href: '/about/', label: '農園紹介' },
  { href: '/taste/', label: 'おいしさの秘密' },
  { href: '/products/', label: '商品・価格' },
  { href: '/news/', label: 'お知らせ' },
  { href: '/access/', label: 'アクセス' },
  { href: '/order/', label: 'ご注文' },
];
