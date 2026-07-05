# MVP Geliştirme Planı — "Bloklu Serüven" (oyun adı: **BlockWords**)

> Tarih: 5 Temmuz 2026 · Dayanak: [ANALIZ.md](ANALIZ.md) · Hedef: Eylül 2026 okul açılmadan oynanabilir MVP

## 0. Sabitlenen Kararlar

| Karar | Seçim | Gerekçe |
|---|---|---|
| Platform | Web / PWA | 0 TL, iPhone'da "Ana Ekrana Ekle" ile app hissi |
| Stack | **Phaser 3 + TypeScript + Vite** | Olgun 2D motor, mobil dokunmatik, hızlı build |
| Barındırma | **Cloudflare Pages** → `blockwords.pages.dev` (GitHub repo bağlantısıyla otomatik deploy) | Temiz adres; isim müsaitliği 5 Tem 2026'da doğrulandı |
| Asset | **Kenney.nl** CC0 paketleri (pixel/voxel) + kendi çizimler | Telif temiz, ücretsiz |
| İçerik | JSON dosyaları (koddan ayrı) | Müfredat/kitap değişince kod değişmez |
| Kayıt | localStorage (+ JSON dışa/içe aktar) | Sunucusuz |
| MVP teması | **Life in Nature** (hayvanlar/doğa, ~40 kelime) | İki müfredatta da var, görsel olarak zengin |
| MVP mekanikleri | Kelime Madenciliği + Yaratık Düellosu (+ boss) | Craft Masası v2'ye ertelendi |
| Dil | Arayüz Türkçe, öğrenim içeriği İngilizce | Hedef kullanıcı 7. sınıf |

## 1. Proje İskeleti

```
insructGame/
├── index.html
├── vite.config.ts
├── package.json
├── public/
│   ├── manifest.webmanifest      # PWA: isim, ikon, tam ekran
│   ├── icons/                    # 192px, 512px app ikonları
│   └── content/
│       └── nature.json           # MVP tema verisi
├── src/
│   ├── main.ts                   # Phaser config + sahne kaydı
│   ├── scenes/
│   │   ├── BootScene.ts          # asset preload + save yükleme
│   │   ├── MenuScene.ts          # başlık, "Oyna", ayarlar
│   │   ├── MapScene.ts           # seviye haritası (5 seviye + boss)
│   │   ├── MiningScene.ts        # Mekanik 1: Kelime Madenciliği
│   │   ├── DuelScene.ts          # Mekanik 2: Yaratık Düellosu (boss dahil)
│   │   └── ResultScene.ts        # seviye sonu: XP, zümrüt, yeni kelimeler
│   ├── systems/
│   │   ├── SaveManager.ts        # localStorage okuma/yazma, dışa/içe aktar
│   │   ├── ContentLoader.ts      # JSON yükleme + doğrulama
│   │   ├── WordScheduler.ts      # soru seçimi + yanlışları tekrar kuyruğu
│   │   ├── Speech.ts             # Web Speech API TTS sarmalayıcı
│   │   └── Audio.ts              # ses efektleri
│   └── ui/                       # buton, panel, kalp/XP barı bileşenleri
└── .github/workflows/deploy.yml  # push → build → GitHub Pages
```

## 2. İçerik Veri Şeması (nature.json)

```json
{
  "themeId": "nature",
  "title": { "en": "Life in Nature", "tr": "Doğada Yaşam" },
  "words": [
    {
      "id": "eagle",
      "en": "eagle",
      "tr": "kartal",
      "image": "animals/eagle.png",
      "sample": { "en": "An eagle can fly very high.", "tr": "Kartal çok yükseğe uçabilir." }
    }
  ],
  "sentences": [
    {
      "id": "s1",
      "en": "Elephants are bigger than lions.",
      "tr": "Filler aslanlardan büyüktür.",
      "distractors": ["big", "than lion"]
    }
  ],
  "levels": [
    { "id": 1, "name": "Orman Girişi", "wordIds": ["eagle", "..."], "tier": "stone" },
    { "id": 6, "name": "BOSS: Orman Bekçisi", "wordIds": ["*"], "tier": "boss" }
  ]
}
```

Kurallar:
- Kelime seçimi eski müfredat "Wild Animals/Environment" listelerinden başlar; Eylül'de ders kitabına göre revize edilir (sadece JSON değişir).
- `distractors` (çeldiriciler) elle yazılır — rastgele yanlış şık üretmek yanıltıcı olabilir.
- Görseller: Kenney paketlerinden; olmayan hayvanlar için basit pixel-art veya emoji fallback.

## 3. Kayıt Şeması (localStorage)

```json
{
  "version": 1,
  "xp": 0, "emeralds": 0,
  "unlockedLevel": 1,
  "wordStats": { "eagle": { "seen": 3, "correct": 2, "wrong": 1, "cracked": true } },
  "settings": { "sound": true, "tts": true }
}
```

`cracked: true` olan kelimeler WordScheduler tarafından sonraki seviyelere öncelikli sokulur (aralıklı tekrar). Ayarlar ekranından tek dosyalık JSON dışa/içe aktarma.

## 4. Mekanik Spesifikasyonları

### 4.1 Kelime Madenciliği (MiningScene)
- Ekranda 4×4 blok duvarı; her blokta bir İngilizce kelime (veya resim).
- Bloğa dokun → altta 3 şık (TR anlam veya EN kelime, kademeye göre).
- **Doğru:** blok kırılma animasyonu + parçacık + "kling" sesi, kelime envantere, +XP.
- **Yanlış:** blok çatlar (kırılmaz), kelime tekrar kuyruğuna; doğru cevap gösterilir + TTS okur.
- Seviye hedefi: duvarı temizle. Süre baskısı YOK (kaygı yaratmasın), ama hızlı bitirme bonus zümrüt verir.
- Kademeler: Taş = resim→kelime eşleştirme; Demir = TR→EN yazma (ekran klavyesi/harf blokları); Elmas = dinle→yaz.

### 4.2 Yaratık Düellosu (DuelScene)
- Creeper-vari özgün düşman sağda, oyuncu solda; sıra tabanlı.
- Soru kartı gelir (kelime veya örnek cümlede boşluk). 3 şık.
- **Doğru:** oyuncu vurur, düşman canı −1, vuruş animasyonu.
- **Yanlış:** düşman bir adım yaklaşır/oyuncu kalp kaybeder (3 kalp).
- Normal seviye düşmanı: 5 can. **Boss:** 10 can + tüm seviyelerin kelimeleri karışık + 2 kademe karışık soru tipi.
- Kalp biterse seviye tekrar — ceza yok, "tekrar dene" pozitif mesajla.

### 4.3 Seviye Haritası (MapScene)
- Dikey patika üzerinde 6 düğüm (5 seviye + boss). Kilitli/açık/tamamlandı durumları, yıldız (1-3) gösterimi.
- Seviye = Madencilik bölümü + Düello bölümü art arda (boss hariç: sadece düello).

## 5. Sprint Planı

Tempo varsayımı: akşamları/haftasonu hobi mesaisi. Her sprint ~1 hafta.

### Faz 0 — Kurulum (1-2 akşam)
- [ ] Oyun adı kesinleştir + GitHub repo + `pages.dev`/`github.io` adres kontrolü
- [ ] Vite + Phaser 3 + TS iskeleti; "Hello Phaser" sahnesi
- [ ] GitHub Actions → GitHub Pages otomatik deploy (**ilk günden canlı link** — walking skeleton)
- [ ] Kenney paketlerini indir, kullanılacak sprite'ları seç
- **Bitti tanımı:** iPhone'da Safari'den açılan, dokunmaya tepki veren boş sahne.

### Sprint 1 — Çekirdek altyapı
- [ ] Sahne akışı: Boot → Menu → Map → (Mining/Duel) → Result
- [ ] `nature.json` v1: 40 kelime + 10 örnek cümle + 6 seviye tanımı (en emek isteyen iş — erken başla)
- [ ] ContentLoader + SaveManager + temel UI kiti (buton, panel, kalp/XP barı)
- [ ] Speech.ts: TTS "dinle" fonksiyonu (iOS Safari'de ilk dokunuşta unlock gerektiğini unutma)
- **Bitti tanımı:** Haritadan boş bir seviyeye girip çıkılabiliyor, ilerleme kayboluyor/yüklüyor.

### Sprint 2 — Kelime Madenciliği
- [ ] Blok duvarı + şık paneli + doğru/yanlış akışı (spec 4.1)
- [ ] Kırılma/çatlama animasyonları, parçacık, sesler
- [ ] WordScheduler v1: çatlak kelimeleri öne alma
- [ ] Taş kademesi tam; Demir kademesi (yazma) temel hali
- **Bitti tanımı:** 1. seviye baştan sona oynanıp Result ekranında XP/zümrüt görülüyor.

### Sprint 3 — Yaratık Düellosu + Boss
- [ ] Sıra tabanlı düello akışı (spec 4.2), kalp sistemi, vuruş animasyonları
- [ ] Boss varyantı (10 can, karışık havuz)
- [ ] Seviye = Mining + Duel zinciri; 6 seviyenin tamamı veriyle bağlı
- **Bitti tanımı:** Tema baştan sona (boss dahil) bitirilebiliyor.

### Sprint 4 — Meta, PWA ve iPhone
- [ ] Yıldız sistemi, seviye kilidi, zümrüt sayacı, basit ödül (menü skin'i)
- [ ] PWA: manifest + ikonlar + service worker (offline çalışma)
- [ ] iPhone gerçek cihaz testi: dokunma hedef boyutları (min 44px), safe-area, ses/TTS, "Ana Ekrana Ekle" akışı
- [ ] Ayarlar: ses aç/kapa, ilerleme dışa/içe aktar, ilerlemeyi sıfırla
- **Bitti tanımı:** Telefonda ikondan açılıp uçak modunda oynanabiliyor.

### Sprint 5 — Cila + Çocuk Testi 🎯
- [ ] "Juice": ekran sarsıntısı, combo sesleri, seviye sonu kutlaması
- [ ] Onboarding: ilk açılışta 3 adımlı görsel anlatım (metin ağırlıklı değil)
- [ ] **Çocukla oturum: sessizce izle** — nerede sıkıldı, nerede güldü, ne sordu → not al
- [ ] Gözlem sonrası hızlı düzeltmeler
- **Bitti tanımı:** Çocuk ikinci kez kendiliğinden açmak istiyor mu? (Gerçek başarı ölçütü bu.)

## 6. Test Kontrol Listesi (her sprint sonunda)

- iPhone Safari (gerçek cihaz) + masaüstü Chrome
- İlk yüklemede boyut < 5 MB, açılış < 3 sn
- TTS ilk dokunuş sonrası çalışıyor
- localStorage kaydı kapat-aç sonrası duruyor
- Yanlış cevapta oyun "cezalandırıcı" hissettirmiyor (ceza değil tekrar)

## 7. MVP'ye Bilerek Alınmayanlar (v2 park alanı)

Craft Masası (cümle dizme) · 2.-8. temalar · konuşma tanıma · günlük seri/bildirim · çoklu profil · App Store (Capacitor) · skor tabloları (sunucu ister — zaten yok)

## 8. Riskler (plana özgü)

| Risk | Önlem |
|---|---|
| İçerik girişi sıkıcı gelir, proje yavaşlar | nature.json'u Sprint 1'de bitir; kelime listesini hazır PDF'lerden dönüştür |
| Kapsam şişmesi ("bir de şunu ekleyeyim") | Yeni fikirler §7 park alanına; MVP tanımı değişmez |
| iOS ses/TTS sürprizleri | Sprint 1'de erken cihaz testi, sona bırakma |
| Çocuk beğenmez | Bu bir başarısızlık değil, veri — mekaniği gözleme göre değiştir (Sprint 5 amaç bu) |
