/**
 * Writes one HTML page per language into the built site, plus a sitemap.
 *
 * Translating the interface is not enough to be found: a crawler reads what the SERVER sends,
 * and a single-page app sends one document whose text arrives later, in JavaScript. Each
 * language therefore gets its own URL, its own `<title>`, its own description, and `hreflang`
 * links naming every sibling — which is what tells a search engine that these are the same page
 * in another language rather than fifteen thin duplicates.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const SITE = 'https://pasquelin.github.io/panels/'
const root = resolve(import.meta.dirname, '..')
const out = resolve(root, 'dist-site')

/** Title and description per language. The rest of the page is translated at runtime. */
const META = {
  en: [
    '@pasquelin/panels — the chassis under your tool',
    'Icon rails, resizable zones, a centre that is yours. A React panel chassis: headless underneath, repaintable on top. 8 kB, no dependencies.',
  ],
  zh: [
    '@pasquelin/panels — 工具之下的骨架',
    '边缘图标导轨，可调节大小的区域，属于你的中心区域。React 面板骨架：底层无渲染，上层可重绘。8 kB，零依赖。',
  ],
  hi: [
    '@pasquelin/panels — आपके औज़ार के नीचे का ढाँचा',
    'किनारों पर आइकन रेल, आकार बदलने योग्य क्षेत्र, और आपका अपना केंद्र। React पैनल ढाँचा — नीचे हेडलेस, ऊपर पूरी तरह रंगने योग्य। 8 kB, कोई निर्भरता नहीं।',
  ],
  es: [
    '@pasquelin/panels — el chasis bajo tu herramienta',
    'Raíles de iconos, zonas redimensionables y un centro que es tuyo. Un chasis de paneles para React: sin renderizado por debajo, repintable por encima. 8 kB, sin dependencias.',
  ],
  ar: [
    '@pasquelin/panels — الهيكل تحت أداتك',
    'أشرطة أيقونات على الأطراف، ومناطق قابلة لتغيير الحجم، ومركز يخصّك أنت. هيكل لوحات لـ React: بلا واجهة في الأسفل، وقابل لإعادة التلوين في الأعلى. ٨ ك.ب بلا اعتماديات.',
  ],
  pt: [
    '@pasquelin/panels — o chassi sob a sua ferramenta',
    'Trilhos de ícones, zonas redimensionáveis e um centro que é seu. Um chassi de painéis para React: sem renderização por baixo, repintável por cima. 8 kB, sem dependências.',
  ],
  fr: [
    '@pasquelin/panels — le châssis sous votre outil',
    "Des rails d'icônes, des zones redimensionnables et un centre qui est le vôtre. Un châssis à panneaux pour React : sans rendu en dessous, repeignable au-dessus. 8 ko, aucune dépendance.",
  ],
  ru: [
    '@pasquelin/panels — каркас под вашим инструментом',
    'Полосы значков, изменяемые зоны и центр, который принадлежит вам. Каркас панелей для React: внизу без разметки, наверху перекрашивается целиком. 8 КБ, без зависимостей.',
  ],
  id: [
    '@pasquelin/panels — rangka di bawah perkakas Anda',
    'Rel ikon, zona yang bisa diubah ukurannya, dan pusat yang sepenuhnya milik Anda. Rangka panel untuk React: tanpa render di bawah, bebas dicat ulang di atas. 8 kB, tanpa dependensi.',
  ],
  de: [
    '@pasquelin/panels — das Gerüst unter Ihrem Werkzeug',
    'Icon-Leisten, größenveränderbare Zonen und eine Mitte, die Ihnen gehört. Ein Panel-Gerüst für React: ohne Rendering darunter, frei umfärbbar darüber. 8 kB, keine Abhängigkeiten.',
  ],
  ja: [
    '@pasquelin/panels — あなたのツールを支える骨組み',
    '両端のアイコンレール、サイズ変更できるゾーン、そしてあなた自身の中央領域。React 向けパネル骨組み：土台はヘッドレス、見た目は自由。8 kB、依存なし。',
  ],
  tr: [
    '@pasquelin/panels — aracınızın altındaki iskelet',
    'Simge rayları, yeniden boyutlandırılabilir bölgeler ve tamamen size ait bir merkez. React için panel iskeleti: altta görselleştirme yok, üstte istediğiniz gibi boyanabilir. 8 kB, bağımlılık yok.',
  ],
  ko: [
    '@pasquelin/panels — 당신의 도구 아래 골격',
    '아이콘 레일, 크기를 조절할 수 있는 구역, 그리고 온전히 당신의 중앙 영역. React 패널 골격: 아래는 헤드리스, 위는 자유롭게 다시 칠할 수 있습니다. 8 kB, 의존성 없음.',
  ],
  vi: [
    '@pasquelin/panels — bộ khung bên dưới công cụ của bạn',
    'Thanh biểu tượng, các vùng thay đổi được kích thước và một trung tâm thuộc về bạn. Bộ khung bảng cho React: bên dưới không dựng giao diện, bên trên tha hồ sơn lại. 8 kB, không phụ thuộc.',
  ],
  it: [
    '@pasquelin/panels — il telaio sotto il tuo strumento',
    'Barre di icone, zone ridimensionabili e un centro che è tuo. Un telaio a pannelli per React: senza rendering sotto, ridipingibile sopra. 8 kB, nessuna dipendenza.',
  ],
}

/** The tag a crawler reads, which is not always the key we use internally. */
const TAGS = {
  en: 'en',
  zh: 'zh-Hans',
  hi: 'hi',
  es: 'es',
  ar: 'ar',
  pt: 'pt-BR',
  fr: 'fr',
  ru: 'ru',
  id: 'id',
  de: 'de',
  ja: 'ja',
  tr: 'tr',
  ko: 'ko',
  vi: 'vi',
  it: 'it',
}

const RTL = new Set(['ar'])
const langs = Object.keys(META)

/** Every language points at every other, and all of them at the default. */
function alternates(depth) {
  const up = depth === 0 ? './' : '../'
  const rows = langs.map(
    one =>
      `    <link rel="alternate" hreflang="${TAGS[one]}" href="${SITE}${one === 'en' ? '' : one + '/'}" />`,
  )
  rows.push(`    <link rel="alternate" hreflang="x-default" href="${SITE}" />`)
  return { rows: rows.join('\n'), up }
}

const source = readFileSync(resolve(out, 'index.html'), 'utf8')
let written = 0

for (const lang of langs) {
  const [title, description] = META[lang]
  const nested = lang !== 'en'
  const { rows, up } = alternates(nested ? 1 : 0)
  const url = `${SITE}${nested ? lang + '/' : ''}`

  let page = source
    .replace('<html lang="en">', `<html lang="${TAGS[lang]}"${RTL.has(lang) ? ' dir="rtl"' : ''}>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/s, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/s, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace('</head>', `${rows}\n  </head>`)

  if (nested) {
    // The assets live at the root of the site; a page one level down has to reach up for them.
    page = page.replace(/(src|href)="\.\/([^"]+)"/g, `$1="${up}$2"`)
    mkdirSync(resolve(out, lang), { recursive: true })
    writeFileSync(resolve(out, lang, 'index.html'), page)
  } else {
    writeFileSync(resolve(out, 'index.html'), page)
  }
  written += 1
}

const urls = [
  SITE,
  ...langs.filter(one => one !== 'en').map(one => `${SITE}${one}/`),
  ...['minimal', 'router', 'dockview', 'theme'].map(one => `${SITE}${one}/`),
]

writeFileSync(
  resolve(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(one => `  <url><loc>${one}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
)

writeFileSync(
  resolve(out, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`,
)

console.log(`${written} localised pages, a sitemap of ${urls.length} URLs, and robots.txt.`)
