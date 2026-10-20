# FET Lab

**Transistör ve MOSFET sürme laboratuvarı · A lab for driving transistors and MOSFETs**

FET Lab, bir mikrodenetleyici ya da FPGA pininden gerçek bir yükü (LED şerit, motor, röle, solenoid, lamba, ısıtıcı) güvenle sürmek için gereken her şeyi anlatan, Türkçe ve İngilizce, etkileşimli bir web uygulamasıdır. Her bölümde kaydırıcılarla oynanabilen deney panelleri, canlı grafikler ve akımın aktığı animasyonlu şemalar vardır.

FET Lab is a bilingual (Turkish / English), interactive web app that teaches everything you need to drive a real load (LED strip, motor, relay, solenoid, lamp, heater) safely from a microcontroller or FPGA pin. Every chapter has lab panels with sliders, live plots and animated schematics with moving charge.

## İndir · Download

[Releases](../../releases/latest) sayfasından · From the [Releases](../../releases/latest) page:

| Dosya · File | Ne için · What for |
|---|---|
| `FET Lab_x.y.z_x64-setup.exe` | Windows kurulumu · Windows installer |
| `FET-Lab-portable.exe` | Kurulumsuz çalışır (Windows 10/11'deki WebView2'yi kullanır) · Runs without installing (uses WebView2, built into Windows 10/11) |
| `FET-Lab-web.zip` | Her işletim sistemi: zip'i aç, `index.html`'i tarayıcıda aç · Any OS: unzip and open `index.html` in a browser |
| `fetlab.html` | Tek dosya, çift tıkla aç · One file, double-click to open |

Kurulum gerektirmeyen en basit yol depoyu indirip `index.html`'i açmaktır. The simplest no-install option is to download the repository and open `index.html`.

## İçerik · Contents

| # | Bölüm | Chapter |
|---|---|---|
| APP | Uygulama devreleri: LED karartma, motor hız kontrolü, ısıtıcı (aç/kapa ve sürekli), pozisyon kontrolü (PID, H-köprü), darbe kontrol (peak-and-hold) | Application circuits: LED dimming, motor speed, heater on/off vs continuous, position control, pulse control |
| SIM | Devre simülatörü: gerçek parçalarla (2N7002, BSS138, AO3400A, IRLZ44N, IRF540N, IRF3205, IRF4905, BC547, BC337, 2N2222, TIP120 …) 1,8/3,3/5 V kaynaktan 5/12/24 V yük sürme, eklenebilir R/L/C (kablo, yük L'si, paralel C, besleme C'si, RC snubber, TVS) ile zaman adımlı transient çözüm, 100 kHz+ PWM, kayıplar, T<sub>j</sub>, tüm parçaların karşılaştırması | Circuit simulator with real parts, 1.8/3.3/5 V sources, 5/12/24 V rails, add-on R/L/C (wiring, load L, parallel C, bulk C, RC snubber, TVS) solved in the time domain, 100 kHz+ PWM, losses, T<sub>j</sub>, ranking of every part |
| 01 | Yükü tanı: akım ve güç hesabı | Know your load: current and power |
| 02 | BJT nasıl çalışır? | How does a BJT work? |
| 03 | MOSFET nasıl çalışır? | How does a MOSFET work? |
| 04 | Mikrodenetleyici pini | The microcontroller pin |
| 04b | Çıkış tipleri: push-pull, open-drain, open-collector, open-emitter | Output types |
| 05 | BJT’yi sürmek | Driving a BJT |
| 06 | MOSFET’i sürmek | Driving a MOSFET |
| 07 | Low-side, high-side, yarım köprü, H-köprü | Topologies |
| 08 | Endüktif yükler ve flyback | Inductive loads and flyback |
| 09 | Gate şarjı ve Miller platosu | Gate charge and the Miller plateau |
| 10 | Gate sürücüler, dead-time ve layout | Gate drivers, dead-time and layout |
| 11 | Inrush akımı | Inrush current |
| 12 | Aşırı akım, kısa devre ve SOA | Overcurrent, short circuit and SOA |
| 13 | Isı: kayıp, termal direnç, soğutucu | Heat and heatsinks |
| 14 | Örnek tasarımlar | Worked designs |
| 15 | Sık yapılan hatalar | Common mistakes |
| 16 | Hızlı başvuru | Quick reference |
| 17 | Kendini sına | Test yourself |

## Çalıştırma · Running

Derleme adımı ve bağımlılık yoktur; saf HTML, CSS ve JavaScript’tir. There is no build step and no dependency.

```bash
python -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000` adresini aç. `index.html` dosyasını doğrudan çift tıklayarak da açabilirsin. Then open `http://localhost:8000`, or simply double-click `index.html`.

### GitHub Pages

Depoyu GitHub’a gönder, **Settings → Pages → Deploy from a branch → main / (root)** seç. `.nojekyll` dosyası zaten eklidir. Push the repository, then choose **Settings → Pages → Deploy from a branch → main / (root)**. A `.nojekyll` file is included.

## Kendi sitene ekleme · Embedding in your own site

FET Lab statik dosyalardan oluşur; sunucu tarafında hiçbir şey çalışmaz. Klasörü sitende bir alt dizine (ör. `/fetlab/`) kopyalaman yeterli. Animasyonlar yalnızca ekranda görünen şemalarda ve görünür sekmede çalışır; uzun sayfalarda ve birden fazla gömülü pencerede işlemciyi boşuna yormaz.

FET Lab is static files only. Copy the folder into a sub-directory of your site (e.g. `/fetlab/`). Animations run only for drawings that are on screen and only while the tab is visible.

**1 · Tek bölüm, yüksekliği kendini ayarlayan pencere · One chapter, auto-height frame**

```html
<div data-fetlab data-page="simulator" data-lang="tr" data-nav="1"></div>
<script src="/fetlab/embed.js" defer></script>
```

| Özellik · attribute | Değer · value |
|---|---|
| `data-page` | bölüm kimliği · chapter id: `home`, `simulator`, `apps`, `loads`, `bjt`, `mosfet`, `mcu-io`, `outputs`, `bjt-drive`, `mosfet-drive`, `topologies`, `inductive`, `switching`, `gate-drivers`, `inrush`, `overcurrent`, `thermal`, `examples`, `mistakes`, `reference`, `quiz` |
| `data-lang` | `tr` · `en` |
| `data-theme` | `light` · `dark` (boşsa ziyaretçinin sistem ayarı · empty = visitor's system setting) |
| `data-nav` | `1` önceki/sonraki düğmeleri · previous/next buttons |
| `data-full` | `1` menülü tam uygulama, sabit yükseklik (`data-height`) · full app with menu, fixed height |

Sayfandan kontrol etmek için · To control it from your page: `FETLab.navigate(el, 'mosfet')`, `FETLab.setLang(el, 'en')`, `FETLab.setTheme(el, 'dark')`. Çalışan örnek · working example: [embed-demo.html](embed-demo.html).

**2 · Doğrudan iframe · Plain iframe**

```html
<iframe src="/fetlab/index.html?embed&lang=en&theme=light#simulator" style="width:100%;height:900px;border:0"></iframe>
```

URL seçenekleri · URL options: `?embed` (menüsüz · no chrome), `nav=1`, `lang=tr|en`, `theme=light|dark`, `page=<id>` ya da · or `#<id>`.

**3 · Başka bir statik siteye kopyalama · Copy into another static site**

```bash
python tools/export_site.py E:/myWorkspace/portfolio/astro/public/fet-lab/app
```

Uygulamayı (index.html, embed.js, assets/, pages/) hedef klasöre kopyalar. Bu depo tek kaynak kalır; her değişiklikten sonra komutu yeniden çalıştır. Copies the app into the target folder; this repository stays the single source.

**4 · Tek dosya · Single file**

```bash
python tools/build.py
```

Bütün CSS ve JavaScript'i `dist/fetlab.html` içine gömer. Tek bir dosya yükleyebildiğin yerlerde (CMS medya kütüphanesi, intranet) kullan. Inlines every stylesheet and script into `dist/fetlab.html` for places where you can upload only one file.

## Masaüstü uygulaması · Desktop app

Windows .exe, [Tauri](https://tauri.app) ile üretilir: web uygulaması sistemin WebView2'si içinde, küçük bir yerel pencerede çalışır. The Windows .exe is built with Tauri: the web app runs in a small native window using the system WebView2.

* **Otomatik · Automatic:** bir sürüm etiketi gönder, GitHub Actions kurulum, portable exe, web zip ve tek dosyayı Releases'e yükler. Push a version tag and GitHub Actions uploads the installer, portable exe, web zip and single file to Releases:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
* **Yerelde · Locally** ([Rust](https://rustup.rs) + Node gerekir · requires Rust + Node):
  ```bash
  npm install
  npm run desktop
  ```
  Çıktı · Output: `src-tauri/target/release/fet-lab.exe` ve · and `src-tauri/target/release/bundle/`.

## Lisans · License

[MIT](LICENSE) © 2026 Yunus Kurt

## Yapı · Structure

```
index.html            kabuk, menü, sayfa script'leri (sıra = menü sırası)
assets/css/style.css  tema token'ları (açık/koyu), bileşenler
assets/js/core.js     dil (TR/EN), yönlendirme, tema, animasyon döngüsü
assets/js/viz.js      kontroller, SVG grafik, akım animasyonu, şema sembolleri
assets/js/parts.js    parça kütüphanesi ve basit cihaz modelleri
pages/*.js            her bölüm bir dosya
docs/AUTHORING.md     yeni bölüm yazma rehberi
```

Yeni bölüm eklemek ya da parça kütüphanesini genişletmek için [docs/AUTHORING.md](docs/AUTHORING.md) dosyasına bak. See [docs/AUTHORING.md](docs/AUTHORING.md) to add a chapter or extend the parts library.

## Uyarı · Disclaimer

Modeller eğitim amaçlı ve yaklaşıktır; parça değerleri yayımlanmış datasheet’lerden alınmış tipik değerlerdir ve üreticiye göre değişir. Gerçek bir tasarımda her zaman kullandığın parçanın datasheet’ini esas al.

The models are simplified for teaching; part values are typical figures from public datasheets and vary by manufacturer. Always design from the datasheet of the exact part you use.
