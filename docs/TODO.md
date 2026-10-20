# Kaldığımız yer · Where we left off (2026-10-19)

## Bitti · Done
- 21 bölüm + simülatör + uygulama devreleri sayfası, TR/EN, açık/koyu tema, mobil uyumlu.
- Simülatör: gerçek parça kütüphanesi (`assets/js/parts.js`), R/L/C paleti, zaman adımlı transient çözücü, osiloskop görünümü (`Viz.Scope`), parça karşılaştırma tablosu, ikonlu senaryo kartları.
- Gömme: `embed.js`, `embed-demo.html`, `?embed&lang=&theme=&nav=` parametreleri, `python tools/build.py` → `dist/fetlab.html`.
- Metin yenileme (STYLE.md'ye göre: "Kısaca" kutusu, kısa cümleler, alt alta hesaplar): 01–13, 04b, apps, 14, 16, 17 başlığı.

## Yarın · Tomorrow
1. ~~15-mistakes.js~~ done (Symptom / Cause / Fix lines).
2. ~~17-quiz.js expansion~~ done: 131 questions, 8 types, filters, topic summary.
   - en az 90 soru, her bölümden;
   - yeni tipler: doğru/yanlış, "doğru parçayı seç" (2N7002, AO3400A, IRLZ44N, IRF540N, BC547, TIP120…), şemada hatayı bul, osiloskop izini oku (`Viz.Scope`), çoklu seçim, sıralama;
   - zorluk filtresi (temel / orta / ileri), konu filtresi, "rastgele 20" modu;
   - sonuçta konu bazında skor + zayıf konular için bölüm bağlantısı.
   - Soru bankası ayrı dosya olabilir: `pages/17-quiz-bank.js` (index.html'e 17-quiz.js'den önce eklenmeli).
3. 14-examples ve 16-reference metinlerine son bir göz at.
4. Bitince: `python tools/build.py`, tarayıcıda tüm sayfaları tara (hata / taşma / undefined), README tablosunu güncelle.

## Çalıştırma
```bash
python -m http.server 8765 --directory E:/myWorkspace/sketchs/FETs
```
