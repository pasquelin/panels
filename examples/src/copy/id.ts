import type { Copy } from './shape'

export const id: Copy = {
  nav: { overview: 'Ringkasan', examples: 'Contoh', api: 'API' },
  hero: {
    eyebrow: 'React 19 · 8 kB terkompresi · tanpa dependensi',
    title: ['Rangka', 'di bawah', 'perkakas Anda.'],
    lead: 'Rel ikon di tepi, zona yang bisa diubah ukurannya mengelilingi pusat yang sepenuhnya milik Anda, dan tata letak yang bertahan setelah halaman dimuat ulang. Tanpa render di bawah, bebas dicat ulang di atas.',
    copy: 'Salin',
    copied: 'Tersalin',
    seeExamples: 'Lihat contoh',
    caption:
      'Ini hidup. Seret celah di antara permukaan, klik ikon pada rel, atau ubah ukuran jendela.',
  },
  demo: {
    centre: 'Pusat Anda',
    centreHint: 'outlet router · kanvas · peta · tab dokumen',
    panels: {
      files: 'Berkas',
      search: 'Cari',
      outline: 'Kerangka',
      notes: 'Catatan',
      console: 'Konsol',
    },
    said: {
      share: 'Dua panel berbagi separuh ini. Rel yang berganti di antara keduanya.',
      second: 'Separuh kedua dari kolom yang sama, dengan pegangannya sendiri.',
      opens: 'Panel ini meminta terbuka lebih lebar daripada kolomnya.',
      band: 'Bilah bawah membentang di bawah kolom yang sedang terbuka.',
    },
  },
  examples: {
    title: 'Empat cara memulai',
    lead: 'Semuanya berjalan di peramban Anda dan seluruh kodenya ada di layar. Mulailah dari yang paling dekat.',
    tip: 'Tips.',
    open: name => `Buka ${name}`,
  },
  api: {
    title: 'Seluruh permukaan',
    lead: 'Tidak banyak, dan memang itu maksudnya. Lima hal yang perlu diketahui.',
  },
  foot: {
    docs: 'Dokumentasi',
    architecture: 'Arsitektur',
    source: 'Kode sumber',
    note: 'MIT · oleh alban.pasquelin · rangka di halaman ini adalah pustakanya sendiri',
  },
  langLabel: 'Bahasa',
  cards: [
    {
      title: 'Minimal',
      what: 'Rangka terkecil yang benar-benar bekerja. Dua kolom, satu bilah bawah, satu pusat — dan header milik Anda yang mengendalikannya.',
      tip: 'Panel yang berbagi zona dan separuh yang sama tampil bergantian; rel yang mengganti. Beri panel kedua separuh secondary agar ia tersusun di bawah yang pertama.',
    },
    {
      title: 'React Router',
      what: 'Pusatnya adalah outlet. Berpindah halaman hanya mengubah bagian tengah — kolom tetap selebar semula dan panel yang terbuka tetap terbuka.',
      tip: 'Deklarasikan panel di rute layout, di atas outlet. Jika dideklarasikan per halaman, panel akan dilepas setiap kali berpindah dan kehilangan isinya.',
    },
    {
      title: 'Tab dokumen',
      what: 'Pusatnya membawa dokumen di atas Dockview — tab yang bisa diseret dan dibelah — sementara panel tetap di tepi.',
      tip: 'Impor dari entri dockview agar bebannya hanya jatuh pada proyek yang memang ingin tab. Panel tidak pernah masuk ke pusat: dokumen punya nama, panel punya ikon.',
    },
    {
      title: 'Dicat ulang',
      what: 'Rangka yang sama dengan empat palet. Warna, radius, lebar rel, tinggi header — semuanya properti kustom.',
      tip: 'Setel token aksen pada leluhur mana pun, dan rangka akan mengikuti identitas Anda alih-alih memaksakan miliknya. Ingin lebih jauh? Setiap bagian diekspor dan bisa diganti sendiri-sendiri.',
    },
  ],
  api5: [
    {
      name: 'Deklarasikan',
      body: 'Panel adalah deskriptor: di mana ia menggantung, apa namanya, dan apa yang digambarnya.',
    },
    {
      name: 'Kendalikan',
      body: 'Satu hook untuk setiap header, pintasan, atau menu yang perlu memengaruhi panel.',
    },
    {
      name: 'Kendalikan dari luar React',
      body: 'Buat sendiri store-nya, lalu socket, menu native, atau worker pun bisa membuka panel.',
    },
    {
      name: 'Cat ulang',
      body: 'Setiap nilai adalah properti kustom. Setel aksennya, dan rel akan mengikuti identitas Anda.',
    },
    {
      name: 'Atau ambil logikanya saja',
      body: 'Komponen dibangun di atas hook yang tidak menggambar apa pun. Gambarlah rangka Anda sendiri di atasnya.',
    },
  ],
}
