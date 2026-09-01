import type { Copy } from './shape'

export const tr: Copy = {
  nav: { overview: 'Genel bakış', examples: 'Örnekler', api: 'API' },
  hero: {
    eyebrow: 'React 19 · gzip ile 8 kB · bağımlılık yok',
    title: ['Aracınızın', 'altındaki', 'iskelet.'],
    lead: 'Kenarlarda simge rayları, tamamen size ait bir merkezin çevresinde yeniden boyutlandırılabilir bölgeler ve sayfa yenilense de kaybolmayan bir yerleşim. Altta görselleştirme yok, üstte istediğiniz gibi boyanabilir.',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    seeExamples: 'Örnekleri gör',
    caption:
      'Canlı çalışıyor. Yüzeyler arasındaki boşlukları sürükleyin, raydaki bir simgeye tıklayın ya da pencereyi yeniden boyutlandırın.',
  },
  demo: {
    centre: 'Sizin merkeziniz',
    centreHint: 'yönlendirici çıkışı · tuval · harita · belge sekmeleri',
    panels: {
      files: 'Dosyalar',
      search: 'Ara',
      outline: 'Ana hat',
      notes: 'Notlar',
      console: 'Konsol',
    },
    said: {
      share: 'İki panel bu yarıyı paylaşır. Ray aralarında geçiş yapar.',
      second: 'Aynı sütunun ikinci yarısı, kendi tutamacıyla birlikte.',
      opens: 'Bu panel kendi sütunundan daha geniş açılmayı ister.',
      band: 'Alt şerit, açık olan sütunun altından geçer.',
    },
  },
  examples: {
    title: 'Başlamanın dört yolu',
    lead: 'Her biri tarayıcınızda çalışır ve tüm kaynak kodu ekranda durur. Size en yakın olandan başlayın.',
    tip: 'İpucu.',
    open: name => `${name} örneğini aç`,
  },
  api: {
    title: 'Tüm yüzey',
    lead: 'Çok fazla değil, mesele de bu zaten. Bilinmesi gereken beş şey.',
  },
  foot: {
    docs: 'Belgeler',
    architecture: 'Mimari',
    source: 'Kaynak',
    note: 'MIT · alban.pasquelin tarafından · bu sayfadaki iskelet kütüphanenin kendisidir',
  },
  langLabel: 'Dil',
  cards: [
    {
      title: 'En küçük',
      what: 'Gerçekten çalışan en küçük iskelet. İki sütun, bir alt şerit, bir merkez — ve onu yöneten kendi başlığınız.',
      tip: 'Aynı bölgeyi ve aynı yarıyı paylaşan paneller sırayla görünür; ray aralarında geçiş yapar. İkincisine secondary yarıyı verirseniz ilkinin altına yerleşir.',
    },
    {
      title: 'React Router',
      what: 'Merkez bir çıkıştır. Gezinmek yalnızca ortayı değiştirir — sütunlar genişliğini korur, açık paneller açık kalır.',
      tip: 'Panelleri yerleşim rotasında, çıkışın üstünde tanımlayın. Sayfa başına tanımlanırsa her gezinmede sökülür ve içindekileri kaybederler.',
    },
    {
      title: 'Belge sekmeleri',
      what: 'Merkez, belgeleri Dockview üzerinde taşır — sürüklenebilen ve bölünebilen sekmeler — paneller ise kenarlarda kalır.',
      tip: 'dockview giriş noktasından içe aktarın; böylece ağırlığı yalnızca sekme isteyen projelere biner. Panel merkeze asla girmez: belgenin adı, panelin simgesi vardır.',
    },
    {
      title: 'Yeniden boyanmış',
      what: 'Aynı iskelet, dört ayrı palet. Renkler, köşe yarıçapı, ray genişliği, başlık yüksekliği — hepsi özel özellik.',
      tip: 'Vurgu değişkenini herhangi bir üst öğede tanımlayın; iskelet kendi kimliğini dayatmak yerine sizinkini benimser. Daha ileri gitmek isterseniz her parça dışa aktarılmıştır ve tek tek değiştirilebilir.',
    },
  ],
  api5: [
    {
      name: 'Tanımlayın',
      body: 'Panel bir tanımlayıcıdır: nereye asıldığı, adının ne olduğu ve ne çizdiği.',
    },
    {
      name: 'Yönetin',
      body: 'Panellere etki etmesi gereken her başlık, kısayol ve menü için tek bir hook.',
    },
    {
      name: "React'in dışından yönetin",
      body: "Store'u kendiniz oluşturun; ardından bir soket, yerel menü ya da worker bir paneli açabilir.",
    },
    {
      name: 'Yeniden boyayın',
      body: 'Her değer bir özel özelliktir. Vurguyu belirleyin, raylar markanızı izlesin.',
    },
    {
      name: 'Ya da yalnızca mantığı alın',
      body: 'Bileşenler hiçbir şey çizmeyen hookların üzerine kuruludur. Kendi çerçevenizi onların üstüne çizin.',
    },
  ],
}
