# İngilizce Öğrenim Oyunu — Gereksinim Analizi ve Araştırma

> Tarih: 5 Temmuz 2026 · Durum: Analiz aşaması (henüz kod yok)

## 1. Proje Özeti

| Konu | Karar / Kısıt |
|---|---|
| Hedef kitle | 7. sınıfa geçen (2026-27), Minecraft seven tek bir öğrenci |
| Amaç | Okul müfredatına paralel, eğlence öncelikli İngilizce öğrenimi |
| Bütçe | 0 TL — sunucu maliyeti yok, ücretli servis yok |
| Dağıtım hedefi | Web (ücretsiz domain) veya iPhone uygulaması |
| Ticari hedef | Yok — kişisel proje, sonuçlara göre büyütülecek |
| Yaklaşım | Küçük başla (MVP), geri bildirimle geliştir |

---

## 2. Müfredat Analizi (Kritik Bulgu)

### 2026-27'de yeni müfredat 7. sınıfa ulaşıyor

MEB'in **Türkiye Yüzyılı Maarif Modeli** kademeli geçişi: 2024-25'te 1/5/9. sınıflar, 2025-26'da 2/6/10. sınıflar, **2026-27'de 3/7/11. sınıflar**. Yani çocuğunuz 7. sınıfta **yeni programı** okuyacak.

### Yeni program: 8 tema (TYMM, 7. sınıf İngilizce)

1. **School Life & Education** — okul ve eğitim hayatı
2. **Classroom Life & Learning** — sınıf ortamı ve öğrenme
3. **Personal Life & Well-being** — kişisel yaşam ve sağlık
4. **Family Life & Home** — aile ve ev yaşantısı
5. **Life in the Neighbourhood & City and Social Life** — mahalle, şehir, sosyal yaşam
6. **Life in the World & Culture** — dünya ve kültür
7. **Life in Nature** — doğada yaşam
8. **Life in the Universe & Future** — evren ve gelecek

Kaynak: [TYMM 7. Sınıf İngilizce Programı](https://tymm.meb.gov.tr/ogretim-programlari/ingilizce-dersi-temel-egitim/8)

### Eski program: 10 ünite (2018 müfredatı — hâlâ değerli)

Appearance & Personality, Sports, Biographies, Wild Animals, Television, Celebrations, Dreams, Public Buildings, Environment, Planets.

**Neden önemli:** İnternetteki hazır kelime listeleri, PDF'ler ve alıştırmaların neredeyse tamamı eski programa göre. İki program tematik olarak büyük ölçüde örtüşüyor (ör. Wild Animals ≈ Life in Nature, Planets ≈ Life in the Universe). Ders yılı başlayınca (Eylül 2026) çocuğun **gerçek ders kitabındaki üniteler ve kelime listeleri** en doğru kaynak olacak.

**Tasarım sonucu:** Oyun içeriği koda gömülmemeli. Tüm kelimeler/sorular/üniteler **JSON veri dosyalarında** tutulmalı — müfredat/kitap netleşince içerik değişir, kod değişmez. Yeni ünite eklemek = yeni JSON dosyası.

### Seviye

7. sınıf MEB İngilizcesi ≈ **CEFR A1–A2**. Oyun içeriği bu bandda kalmalı; zorluk aşamaları A1 tanıma → A2 üretim şeklinde kurgulanabilir.

---

## 3. Minecraft Teması — Telif/Marka Durumu

- **Kullanılamaz:** "Minecraft" adı, logosu, gerçek oyun dokuları (texture), karakter modelleri, Creeper gibi birebir karakterler. Microsoft/Mojang kullanım koşulları kendi uygulamanızda bunlara izin vermez (App Store incelemesi ayrıca klonları reddeder).
- **Serbest:** Voxel/bloklu görsel stil, pixel-art, "kazma-toplama-craft etme" oyun mekanikleri, sandbox hissi. Oyun *mekanikleri* telifle korunmaz; stil ilhamı serbesttir.
- **Pratik yol:** Kenney.nl (CC0 — tamamen ücretsiz, atıf bile gerekmez: "Voxel Pack", pixel platformer setleri) ve OpenGameArt'tan bloklu asset'ler. Kendi "Creeper benzeri ama farklı" düşmanlar tasarlanır.
- **İsim önerileri:** WordCraft, LinguaCraft, BlockWords, CraftEnglish gibi — "Minecraft" kelimesi geçmeden bloklu dünya çağrışımı.

Kişisel/ticari olmayan kullanımda risk zaten düşük, ama App Store ihtimali için baştan temiz gitmek doğru.

---

## 4. Platform Kararı: Web (PWA) Açık Ara Önde

### iPhone App Store — bütçe kısıtıyla çelişiyor

| Engel | Detay |
|---|---|
| Apple Developer Program | **99 USD/yıl** zorunlu — "0 bütçe" kısıtını ihlal eder |
| Mac gerekliliği | iOS derlemesi Xcode/macOS ister; geliştirme makineniz Windows |
| Ücretsiz hesapla sideload | Mümkün ama uygulama **7 günde bir yeniden yüklenmeli** ve yine Mac gerek |
| İnceleme süreci | Eğitim klonu/tek kişilik uygulamalar reddedilebilir |

### Web + PWA — 0 TL ile hedefin tamamını karşılıyor

- **Ücretsiz barındırma:** GitHub Pages (`kullanici.github.io/oyun`), Cloudflare Pages, Netlify, Vercel — hepsi statik site için tamamen ücretsiz, HTTPS dahil. Alternatif: itch.io (oyun sayfası olarak).
- **iPhone'da uygulama gibi:** Safari → Paylaş → **"Ana Ekrana Ekle"** → tam ekran, ikonlu, app hissiyatında açılır (PWA).
- **Çevrimdışı çalışma:** Service worker ile oyun bir kez yüklendikten sonra internetsiz oynanabilir.
- **Sunucu gereksinimi: sıfır.** Tamamen statik dosyalar.

**Dikkat (iOS özelinde):** Safari, 7 gün kullanılmayan sitelerin yerel verisini silebilir; **ana ekrana eklenmiş PWA'lar bu kuraldan muaf** — bu yüzden "Ana Ekrana Ekle" adımı önemli. Yine de ilerlemeyi dışa aktarma (JSON indir/yükle) özelliği eklemek ucuz bir sigorta.

**Karar önerisi:** Web/PWA ile başla. Oyun tutarsa ileride Capacitor ile aynı kod App Store'a taşınabilir (o gün 99 USD + Mac konusu yeniden değerlendirilir).

---

## 5. Mimari: Tamamen Sunucusuz

```
Statik site (ücretsiz host)
├── Oyun motoru kodu (TS/JS)
├── content/           ← ünite başına JSON (kelimeler, sorular, diyaloglar)
│   ├── theme1-school-life.json
│   └── ...
├── assets/            ← CC0 pixel-art, sesler
└── localStorage       ← ilerleme, XP, envanter (cihazda saklanır)
```

- İlerleme **localStorage**'da; hesap/giriş/veritabanı yok.
- Telaffuz için **Web Speech API (speechSynthesis)** — tarayıcıya gömülü, ücretsiz, iOS Safari dahil çalışır. Kelime kartlarında "dinle" butonu bedavaya gelir.
- (Konuşma tanıma — öğrencinin telaffuzunu dinleme — tarayıcı desteği değişken; MVP dışı, sonraki aşama adayı.)

---

## 6. Teknoloji Seçenekleri

| Seçenek | Artı | Eksi | Uygunluk |
|---|---|---|---|
| **Phaser 3 + TypeScript + Vite** | Olgun 2D oyun framework'ü, mobil dokunmatik desteği iyi, dev topluluk/örnek | 3D yok | ⭐ **Önerilen** |
| Kaplay (Kaboom devamı) | Çok basit API, hızlı prototip | Daha küçük ekosistem | İyi B planı |
| Saf JS + Canvas/DOM | Sıfır bağımlılık | Her şeyi elle yazmak | Mini oyunlar çok basitse yeterli |
| Three.js ile voxel 3D | Gerçek "Minecraft hissi" | Karmaşıklık ve iPhone performans riski yüksek | MVP için değil; belki v3 |
| Godot 4 → HTML5 export | Tam oyun motoru | Web çıktısı ağır (~30MB+ wasm), iOS Safari'de sorun geçmişi | Bu proje için gereksiz |

**Öneri:** Phaser 3 ile **2D bloklu/pixel-art** dünya. Minecraft hissini 3D değil; blok estetiği, kazma/craft mekanikleri ve ses/parçacık efektleri verir. iPhone Safari'de akıcı çalışır, dosya boyutu küçük kalır.

---

## 7. Oyun Tasarımı Konsepti: "Bloklu Serüven"

### Çatı kurgu
Bir **dünya haritası** üzerinde her biyom = bir müfredat teması (8 tema = 8 biyom: okul köyü, ev/aile çiftliği, şehir, orman/doğa, uzay...). Biyomlar sırayla açılır; her biyomda 4-6 seviye + 1 boss.

### Ana mekanikler (mini-oyun döngüleri)
1. **Kelime Madenciliği:** Blokları kazmak için üzerindeki İngilizce kelimenin anlamını/görselini seç. Doğru = blok kırılır, kelime envantere girer. (kelime tanıma)
2. **Craft Masası:** Kelime bloklarını doğru sıraya dizip **cümle craft'la** (word order / dil bilgisi). Doğru cümle = eşya/alet üretilir.
3. **Yaratık Düelloları:** Creeper-vari düşman soru sorar; doğru cevap hasar verir, yanlışta düşman yaklaşır. (hız + pekiştirme)
4. **Boss = Ünite Tekrarı:** Temanın tüm kelime/yapılarını karışık soran büyük düşman.

### Öğrenme mekaniği (görünmez pedagoji)
- **Envanter = öğrenilen kelimeler.** Yanlış yapılan kelimeler "çatlak blok" olarak işaretlenir ve sonraki seviyelerde **tekrar karşına çıkar** (aralıklı tekrar / spaced repetition).
- Her kelimede **dinle butonu** (ücretsiz TTS ile telaffuz).
- **Zorluk aşamaları** (her seviyede 3 kademe):
  - ⛏️ Taş: tanıma — eşleştirme, resim-kelime (A1)
  - ⚒️ Demir: hatırlama — boşluk doldurma, yazma
  - 💎 Elmas: üretim — cümle kurma, dinleyip yazma (A2)

### Motivasyon döngüsü
XP ve seviye, zümrüt ekonomisi, kazanılan zümrütle **skin/dekor açma**, günlük seri (streak). Ödüller oyun içi — gerçek para yok.

### En büyük tasarım riski
"**Çikolata kaplı brokoli**": quiz'in üstüne Minecraft görseli giydirilmiş oyunlar çocuğu 2 günde sıkar. Panzehir: cevaplar oyun *aksiyonunun kendisi* olmalı (kazma kırılıyor, düşman geriliyor, eşya craft'lanıyor) ve ilerleme/koleksiyon hissi güçlü olmalı. Çocuğun kendisi en iyi test kullanıcısı — MVP'yi ona oynatıp izlemek, yol haritasının en değerli adımı.

---

## 8. MVP Kapsamı (Önerilen İlk Sürüm)

- **1 tema** (öneri: *Life in Nature* — hayvan kelimeleri hem eğlenceli hem iki müfredatta da var)
- ~40 kelime + 8-10 temel kalıp cümle (JSON'da)
- **2 mekanik:** Kelime Madenciliği + Yaratık Düellosu (craft masası v2'ye)
- 5 seviye + 1 boss, 3 zorluk kademesi
- localStorage ilerleme + TTS dinle butonu
- GitHub Pages'te yayın, iPhone'a "Ana Ekrana Ekle" testi

Bu kapsam, tek geliştiriciyle birkaç haftalık akşam mesaisiyle çıkarılabilir boyutta.

## 9. Yol Haritası

| Faz | İçerik | Çıktı |
|---|---|---|
| 0 | Konsept onayı, asset seçimi (Kenney), isim | Tasarım kararları |
| 1 | **MVP** (yukarıdaki kapsam) | Oynanabilir link |
| 2 | Çocuk testi → geri bildirim; craft mekaniği, 2-3 tema daha | v2 |
| 3 | Eylül 2026: gerçek ders kitabı üniteleriyle içerik hizalama | Müfredat senkronu |
| 4 | (Opsiyonel) 8 temanın tamamı, dinleme soruları, belki Capacitor/App Store | v3+ |

## 10. Riskler ve Önlemler

| Risk | Önlem |
|---|---|
| İçerik üretimi kodu geçer (asıl iş kelime/soru girmek) | JSON şemasını basit tut; eski müfredat kelime listelerinden başla, kitap gelince güncelle |
| Oyun sıkıcı gelirse hedef çöker | MVP'yi erken oynat, mekaniği çocuğun tepkisine göre değiştir |
| Minecraft IP | Orijinal asset + isimde "Minecraft" yok |
| iOS Safari veri silme | PWA olarak ana ekrana ekletme + ilerleme dışa aktarma |
| App Store maliyeti | Web/PWA ile ertele; gerekirse ileride tek seferlik değerlendir |

---

## Kaynaklar

- [TYMM 7. Sınıf İngilizce Öğretim Programı (resmi)](https://tymm.meb.gov.tr/ogretim-programlari/ingilizce-dersi-temel-egitim/8)
- [TYMM Öğretim Programları ana sayfa](https://tymm.meb.gov.tr/ogretim-programlari)
- [2026-2027 yeni müfredat 7. sınıf geçiş bilgisi](https://kaganakademi.com.tr/blog/yeni-mufredat-7-sinif-konulari)
- [Eski (2018) 7. sınıf İngilizce programı PDF (MEB)](https://mufredat.meb.gov.tr/Dosyalar/TTKB/Ortaokul/7/%C4%B0ngilizce/c1_ingilizce_7.pdf)
- [7. sınıf ünite kelime listeleri (eski müfredat)](https://www.ingilizcele.com/7-sinif-ingilizce-unite-kelimeleri/)
- [EnglishCentral — 7. sınıf üniteleri (2026 güncel)](https://www.englishcentral.com/blog/7-sinif-ingilizce-uniteleri-ve-konu-anlatimi/)
