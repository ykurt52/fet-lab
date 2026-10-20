/* FET Lab — parts library: common field parts with approximate datasheet values and simple models.
   Values are typical/representative figures from public datasheets (25 °C) and are meant for learning.
   Always check the datasheet of the exact part and manufacturer you buy. */
(function () {
  'use strict';
  const App = window.App;

  /* ---------------- MOSFETs ----------------
     type 'N' | 'P'; all voltages as magnitudes.
     R_DS(on) model:  R(Vgs) = rf + a / (Vgs − vth), fitted through two datasheet points (r1 @ v1, r2 @ v2), in Ω.
     Saturation (current-limited) current: Idsat = (Vgs − vth)² / (2a)   (square law, consistent with the triode slope).
     q: Qg total, qgs, qgd in nC (at the datasheet test condition); ciss in pF.
     rthja: junction-to-ambient (°C/W) for the package on a typical minimum-pad / free-air mount; rthjc for heatsinks. */
  const mos = [
    { id: '2N7002', type: 'N', pkg: 'SOT-23', vds: 60, id_: 0.3, vth: 2.1, vgsMax: 20, p: [[4.5, 3.0], [10, 2.0]], qg: 0.8, qgs: 0.3, qgd: 0.3, ciss: 50, rthja: 350, rthjc: 0, tj: 150,
      note: { tr: 'Küçük sinyal; seviye çevirici ve küçük yükler (< 200 mA). 3,3 V ile zayıf açılır.', en: 'Small-signal; level shifting and small loads (< 200 mA). Weakly on at 3.3 V.' } },
    { id: 'BSS138', type: 'N', pkg: 'SOT-23', vds: 50, id_: 0.22, vth: 1.3, vgsMax: 20, p: [[4.5, 1.0], [10, 0.7]], qg: 1.7, qgs: 0.2, qgd: 0.4, ciss: 27, rthja: 350, rthjc: 0, tj: 150,
      note: { tr: 'I²C seviye çevirici klasiği. Akım kapasitesi düşük.', en: 'Classic I²C level shifter. Low current capability.' } },
    { id: 'AO3400A', type: 'N', pkg: 'SOT-23', vds: 30, id_: 5.7, vth: 1.05, vgsMax: 12, p: [[2.5, 0.032], [10, 0.019]], qg: 7, qgs: 1.3, qgd: 1.6, ciss: 630, rthja: 125, rthjc: 0, tj: 150,
      note: { tr: 'Mantık seviyeli, ucuz, 3,3 V’ta iyi. V<sub>GS(max)</sub> yalnızca ±12 V.', en: 'Logic-level, cheap, good at 3.3 V. V<sub>GS(max)</sub> is only ±12 V.' } },
    { id: 'IRLML6344', type: 'N', pkg: 'SOT-23', vds: 30, id_: 5, vth: 0.8, vgsMax: 12, p: [[2.5, 0.027], [4.5, 0.022]], qg: 6.8, qgs: 0.9, qgd: 1.6, ciss: 650, rthja: 100, rthjc: 0, tj: 150,
      note: { tr: 'R<sub>DS(on)</sub> 2,5 V’ta da garanti; 1,8–3,3 V MCU’lar için iyi.', en: 'R<sub>DS(on)</sub> is specified at 2.5 V; good for 1.8–3.3 V MCUs.' } },
    { id: 'IRLZ44N', type: 'N', pkg: 'TO-220', vds: 55, id_: 47, vth: 1.5, vgsMax: 16, p: [[4, 0.035], [5, 0.025]], qg: 48, qgs: 8.6, qgd: 25, ciss: 1700, rthja: 62, rthjc: 1.4, tj: 175,
      note: { tr: 'Hobi dünyasının “logic-level” TO-220’si. 5 V’ta iyi, 3,3 V’ta sınırda.', en: 'The hobby world’s “logic-level” TO-220. Good at 5 V, marginal at 3.3 V.' } },
    { id: 'IRLB8721', type: 'N', pkg: 'TO-220', vds: 30, id_: 62, vth: 1.8, vgsMax: 20, p: [[4.5, 0.016], [10, 0.0087]], qg: 7.6, qgs: 2.3, qgd: 2.8, ciss: 1077, rthja: 62, rthjc: 2.0, tj: 175,
      note: { tr: 'Düşük Q<sub>g</sub>, 4,5 V’ta tanımlı R<sub>DS(on)</sub>; LED şerit ve PWM için iyi.', en: 'Low Q<sub>g</sub>, R<sub>DS(on)</sub> specified at 4.5 V; good for LED strips and PWM.' } },
    { id: 'IRFZ44N', type: 'N', pkg: 'TO-220', vds: 55, id_: 49, vth: 3.0, vgsMax: 20, p: [[6, 0.030], [10, 0.0175]], qg: 63, qgs: 14, qgd: 23, ciss: 1470, rthja: 62, rthjc: 1.5, tj: 175,
      note: { tr: 'Standart seviye: 10 V gate ister. IRLZ44N ile karıştırılır.', en: 'Standard level: wants 10 V on the gate. Often confused with IRLZ44N.' } },
    { id: 'IRF540N', type: 'N', pkg: 'TO-220', vds: 100, id_: 33, vth: 3.0, vgsMax: 20, p: [[6, 0.080], [10, 0.044]], qg: 71, qgs: 15, qgd: 21, ciss: 1960, rthja: 62, rthjc: 1.15, tj: 175,
      note: { tr: 'Standart seviye. 3,3 V ile neredeyse hiç iletmez, 5 V ile lineer bölgede kalır.', en: 'Standard level. Barely conducts at 3.3 V, stays in linear mode at 5 V.' } },
    { id: 'IRF3205', type: 'N', pkg: 'TO-220', vds: 55, id_: 110, vth: 3.0, vgsMax: 20, p: [[6, 0.014], [10, 0.008]], qg: 146, qgs: 35, qgd: 54, ciss: 3247, rthja: 62, rthjc: 0.75, tj: 175,
      note: { tr: 'Yüksek akım, büyük Q<sub>g</sub>: PWM için gate sürücü şart.', en: 'High current, large Q<sub>g</sub>: needs a gate driver for PWM.' } },
    { id: 'Si2301', type: 'P', pkg: 'SOT-23', vds: 20, id_: 2.3, vth: 0.7, vgsMax: 8, p: [[2.5, 0.142], [4.5, 0.112]], qg: 5.5, qgs: 0.9, qgd: 1.5, ciss: 405, rthja: 160, rthjc: 0, tj: 150,
      note: { tr: 'Küçük P-kanal; V<sub>GS(max)</sub> ±8 V — 12 V rayda gate’i doğrudan GND’ye çekme!', en: 'Small P-channel; V<sub>GS(max)</sub> ±8 V — on a 12 V rail never pull the gate straight to GND!' } },
    { id: 'AO3401A', type: 'P', pkg: 'SOT-23', vds: 30, id_: 4, vth: 0.9, vgsMax: 12, p: [[2.5, 0.085], [4.5, 0.060]], qg: 7, qgs: 1.4, qgd: 2.0, ciss: 645, rthja: 125, rthjc: 0, tj: 150,
      note: { tr: 'AO3400A’nın P-kanal eşi; 5 V raylar için iyi.', en: 'P-channel sibling of AO3400A; good for 5 V rails.' } },
    { id: 'IRF9540N', type: 'P', pkg: 'TO-220', vds: 100, id_: 23, vth: 3.0, vgsMax: 20, p: [[6, 0.200], [10, 0.117]], qg: 97, qgs: 15, qgd: 51, ciss: 1300, rthja: 62, rthjc: 1.2, tj: 175,
      note: { tr: 'Standart seviye P-kanal; 10 V V<sub>GS</sub> ister.', en: 'Standard-level P-channel; wants 10 V V<sub>GS</sub>.' } },
    { id: 'IRF4905', type: 'P', pkg: 'TO-220', vds: 55, id_: 74, vth: 3.0, vgsMax: 20, p: [[6, 0.035], [10, 0.020]], qg: 180, qgs: 32, qgd: 86, ciss: 3400, rthja: 62, rthjc: 0.75, tj: 175,
      note: { tr: 'Güçlü P-kanal high-side anahtar; çok büyük Q<sub>g</sub>.', en: 'Strong P-channel high-side switch; very large Q<sub>g</sub>.' } },
    /* ---- added: wider field selection (approximate datasheet values, 25 °C) ---- */
    // small-signal N
    { id: '2N7000', type: 'N', fam: 'ss', pkg: 'TO-92', vds: 60, id_: 0.2, vth: 2.1, vgsMax: 20, p: [[4.5, 2.5], [10, 1.8]], qg: 0.8, qgs: 0.3, qgd: 0.3, ciss: 20, rthja: 312, rthjc: 0, tj: 150,
      note: { tr: '2N7002’nin TO-92 kardeşi; breadboard için.', en: 'TO-92 sibling of the 2N7002; handy on a breadboard.' } },
    { id: 'BSS123', type: 'N', fam: 'ss', pkg: 'SOT-23', vds: 100, id_: 0.17, vth: 1.7, vgsMax: 20, p: [[4.5, 2.4], [10, 1.7]], qg: 1.3, qgs: 0.3, qgd: 0.4, ciss: 20, rthja: 350, rthjc: 0, tj: 150,
      note: { tr: '100 V küçük sinyal; yüksek gerilimli seviye çevirme.', en: '100 V small-signal; level shifting on higher rails.' } },
    // logic-level SMD N
    { id: 'AO3416', type: 'N', fam: 'lsmd', pkg: 'SOT-23', vds: 20, id_: 6.5, vth: 0.75, vgsMax: 8, p: [[1.8, 0.034], [4.5, 0.022]], qg: 9, qgs: 1.2, qgd: 2.2, ciss: 750, rthja: 125, rthjc: 0, tj: 150,
      note: { tr: '1,8 V’ta tanımlı R<sub>DS(on)</sub>; düşük gerilimli FPGA için. V<sub>GS(max)</sub> ±8 V.', en: 'R<sub>DS(on)</sub> specified at 1.8 V; suits low-voltage FPGAs. V<sub>GS(max)</sub> ±8 V.' } },
    { id: 'Si2302', type: 'N', fam: 'lsmd', pkg: 'SOT-23', vds: 20, id_: 2.6, vth: 0.9, vgsMax: 8, p: [[2.5, 0.085], [4.5, 0.060]], qg: 3.5, qgs: 0.6, qgd: 1.0, ciss: 300, rthja: 160, rthjc: 0, tj: 150,
      note: { tr: 'Ucuz, yaygın SOT-23 anahtar; küçük röle ve LED.', en: 'Cheap, common SOT-23 switch; small relays and LEDs.' } },
    { id: 'IRLML2502', type: 'N', fam: 'lsmd', pkg: 'SOT-23', vds: 20, id_: 4.2, vth: 0.9, vgsMax: 12, p: [[2.5, 0.080], [4.5, 0.045]], qg: 8, qgs: 1.0, qgd: 2.3, ciss: 740, rthja: 100, rthjc: 0, tj: 150,
      note: { tr: '2,5 V’ta tanımlı; 3,3 V MCU ile güvenli.', en: 'Specified at 2.5 V; safe with a 3.3 V MCU.' } },
    // logic-level power N
    { id: 'IRLZ34N', type: 'N', fam: 'lpow', pkg: 'TO-220', vds: 55, id_: 30, vth: 1.5, vgsMax: 16, p: [[4, 0.060], [5, 0.046]], qg: 25, qgs: 5.2, qgd: 14, ciss: 880, rthja: 62, rthjc: 3.3, tj: 175,
      note: { tr: 'IRLZ44N’in küçüğü; 5 V MCU ile iyi.', en: 'Smaller IRLZ44N; good with a 5 V MCU.' } },
    { id: 'IRL540N', type: 'N', fam: 'lpow', pkg: 'TO-220', vds: 100, id_: 36, vth: 1.5, vgsMax: 16, p: [[4, 0.063], [5, 0.053]], qg: 74, qgs: 9.4, qgd: 39, ciss: 1800, rthja: 62, rthjc: 1.1, tj: 175,
      note: { tr: 'IRF540N’in logic-level hali (L harfi). 100 V.', en: 'Logic-level version of the IRF540N (the “L”). 100 V.' } },
    { id: 'FQP30N06L', type: 'N', fam: 'lpow', pkg: 'TO-220', vds: 60, id_: 32, vth: 1.5, vgsMax: 20, p: [[5, 0.045], [10, 0.035]], qg: 15, qgs: 3.5, qgd: 9.5, ciss: 1040, rthja: 62, rthjc: 1.65, tj: 175,
      note: { tr: 'Arduino projelerinin klasiği; düşük Q<sub>g</sub>.', en: 'An Arduino-project classic; low Q<sub>g</sub>.' } },
    { id: 'STP55NF06L', type: 'N', fam: 'lpow', pkg: 'TO-220', vds: 60, id_: 55, vth: 1.7, vgsMax: 16, p: [[5, 0.018], [10, 0.014]], qg: 25, qgs: 7, qgd: 10, ciss: 1700, rthja: 62, rthjc: 1.36, tj: 175,
      note: { tr: '60 V, 5 V gate ile düşük direnç; 12/24 V yükler.', en: '60 V, low resistance at 5 V gate; 12/24 V loads.' } },
    { id: 'IRLB3034', type: 'N', fam: 'lpow', pkg: 'TO-220', vds: 40, id_: 195, vth: 1.7, vgsMax: 20, p: [[4.5, 0.0020], [10, 0.0017]], qg: 108, qgs: 30, qgd: 50, ciss: 10315, rthja: 62, rthjc: 0.4, tj: 175,
      note: { tr: 'Çok düşük R<sub>DS(on)</sub> ama dev Q<sub>g</sub>: PWM’de sürücü şart.', en: 'Very low R<sub>DS(on)</sub> but a huge Q<sub>g</sub>: needs a driver for PWM.' } },
    { id: 'AOD4184A', type: 'N', fam: 'lpow', pkg: 'DPAK', vds: 40, id_: 50, vth: 1.85, vgsMax: 20, p: [[4.5, 0.0095], [10, 0.0070]], qg: 18, qgs: 6, qgd: 6, ciss: 1980, rthja: 50, rthjc: 2.5, tj: 175,
      note: { tr: 'DPAK, motor ve LED sürücülerinde yaygın.', en: 'DPAK, common in motor and LED drivers.' } },
    { id: 'IRLR7843', type: 'N', fam: 'lpow', pkg: 'DPAK', vds: 30, id_: 161, vth: 1.9, vgsMax: 20, p: [[4.5, 0.0040], [10, 0.0033]], qg: 34, qgs: 11, qgd: 12, ciss: 4430, rthja: 50, rthjc: 1.2, tj: 175,
      note: { tr: 'Senkron buck’larda kullanılan düşük dirençli DPAK.', en: 'Low-resistance DPAK used in synchronous bucks.' } },
    // standard-level power N
    { id: 'IRFZ24N', type: 'N', fam: 'std', pkg: 'TO-220', vds: 55, id_: 17, vth: 3.0, vgsMax: 20, p: [[6, 0.12], [10, 0.070]], qg: 20, qgs: 4.6, qgd: 7.6, ciss: 370, rthja: 62, rthjc: 3.3, tj: 175,
      note: { tr: 'Küçük standart seviye; 10 V gate ister.', en: 'Small standard-level part; wants 10 V on the gate.' } },
    { id: 'IRF530N', type: 'N', fam: 'std', pkg: 'TO-220', vds: 100, id_: 17, vth: 3.0, vgsMax: 20, p: [[6, 0.16], [10, 0.090]], qg: 37, qgs: 7.2, qgd: 11, ciss: 920, rthja: 62, rthjc: 2.15, tj: 175,
      note: { tr: '100 V, IRF540N’den küçük.', en: '100 V, smaller than the IRF540N.' } },
    { id: 'IRFB4110', type: 'N', fam: 'std', pkg: 'TO-220', vds: 100, id_: 180, vth: 3.0, vgsMax: 20, p: [[6, 0.0065], [10, 0.0037]], qg: 150, qgs: 35, qgd: 43, ciss: 9620, rthja: 62, rthjc: 0.4, tj: 175,
      note: { tr: 'Yüksek akım (e-bisiklet, invertör); gate sürücü şart.', en: 'High current (e-bikes, inverters); needs a gate driver.' } },
    { id: 'IPP045N10N3', type: 'N', fam: 'std', pkg: 'TO-220', vds: 100, id_: 137, vth: 2.7, vgsMax: 20, p: [[6, 0.0075], [10, 0.0045]], qg: 117, qgs: 28, qgd: 22, ciss: 8410, rthja: 62, rthjc: 0.6, tj: 175,
      note: { tr: 'Infineon OptiMOS; düşük Q<sub>gd</sub>, hızlı anahtarlama.', en: 'Infineon OptiMOS; low Q<sub>gd</sub>, fast switching.' } },
    // high-voltage N
    { id: 'IRF640N', type: 'N', fam: 'hv', pkg: 'TO-220', vds: 200, id_: 18, vth: 3.0, vgsMax: 20, p: [[6, 0.27], [10, 0.15]], qg: 67, qgs: 11, qgd: 33, ciss: 1160, rthja: 62, rthjc: 1.0, tj: 175,
      note: { tr: '200 V; 48–100 V raylar.', en: '200 V; 48–100 V rails.' } },
    { id: 'IRFP250N', type: 'N', fam: 'hv', pkg: 'TO-247', vds: 200, id_: 30, vth: 3.0, vgsMax: 20, p: [[6, 0.13], [10, 0.075]], qg: 123, qgs: 21, qgd: 57, ciss: 2159, rthja: 40, rthjc: 0.7, tj: 175,
      note: { tr: 'TO-247, 200 V; amfi ve güç kaynakları.', en: 'TO-247, 200 V; amplifiers and power supplies.' } },
    { id: 'IRF840', type: 'N', fam: 'hv', pkg: 'TO-220', vds: 500, id_: 8, vth: 3.0, vgsMax: 20, p: [[6, 1.5], [10, 0.85]], qg: 63, qgs: 9.3, qgd: 32, ciss: 1300, rthja: 62, rthjc: 1.0, tj: 150,
      note: { tr: '500 V şebeke tarafı; düşük gerilimde yüksek direnç.', en: '500 V mains side; high resistance for low-voltage loads.' } },
    // wide band-gap N
    { id: 'EPC2045', type: 'N', fam: 'wbg', pkg: 'GaN CSP', vds: 100, id_: 16, vth: 1.4, vgsMax: 6, p: [[4, 0.010], [5, 0.0070]], qg: 5.2, qgs: 1.4, qgd: 0.9, ciss: 520, rthja: 60, rthjc: 1.0, tj: 150,
      note: { tr: 'GaN FET: çok hızlı, ama gate en fazla 6 V. 12 V sürücü onu yakar.', en: 'GaN FET: very fast, but the gate tops out at 6 V. A 12 V driver kills it.' } },
    { id: 'C3M0065090D', type: 'N', fam: 'wbg', pkg: 'TO-247', vds: 900, id_: 36, vth: 2.1, vgsMax: 19, p: [[12, 0.11], [15, 0.065]], qg: 30, qgs: 8, qgd: 12, ciss: 660, rthja: 40, rthjc: 0.8, tj: 150,
      note: { tr: 'SiC MOSFET: 15 V gate ister, MCU ile doğrudan sürülmez.', en: 'SiC MOSFET: wants 15 V on the gate, never driven straight from an MCU.' } },
    // P-channel
    { id: 'BSS84', type: 'P', fam: 'pss', pkg: 'SOT-23', vds: 50, id_: 0.13, vth: 1.7, vgsMax: 20, p: [[5, 4.0], [10, 2.5]], qg: 1, qgs: 0.2, qgd: 0.3, ciss: 25, rthja: 350, rthjc: 0, tj: 150,
      note: { tr: 'Küçük sinyal P-kanal; seviye çevirme ve küçük yükler.', en: 'Small-signal P-channel; level shifting and tiny loads.' } },
    { id: 'IRLML6402', type: 'P', fam: 'psmd', pkg: 'SOT-23', vds: 20, id_: 3.7, vth: 0.55, vgsMax: 12, p: [[2.5, 0.135], [4.5, 0.065]], qg: 8, qgs: 1.2, qgd: 2.8, ciss: 633, rthja: 100, rthjc: 0, tj: 150,
      note: { tr: 'Klasik SOT-23 P-kanal; 3,3/5 V güç anahtarı.', en: 'Classic SOT-23 P-channel; 3.3/5 V power switch.' } },
    { id: 'AO4407A', type: 'P', fam: 'psmd', pkg: 'SO-8', vds: 30, id_: 12, vth: 1.9, vgsMax: 25, p: [[4.5, 0.019], [10, 0.012]], qg: 30, qgs: 6, qgd: 8, ciss: 2600, rthja: 75, rthjc: 0, tj: 150,
      note: { tr: 'SO-8, ters polarite koruması ve yük anahtarı.', en: 'SO-8, reverse-polarity protection and load switch.' } },
    { id: 'Si4435', type: 'P', fam: 'psmd', pkg: 'SO-8', vds: 30, id_: 9, vth: 1.8, vgsMax: 20, p: [[4.5, 0.035], [10, 0.020]], qg: 27, qgs: 5, qgd: 7, ciss: 1600, rthja: 75, rthjc: 0, tj: 150,
      note: { tr: 'SO-8 P-kanal; 12 V raylarda yük anahtarı.', en: 'SO-8 P-channel; load switch on 12 V rails.' } },
    { id: 'AOD403', type: 'P', fam: 'ppow', pkg: 'DPAK', vds: 30, id_: 70, vth: 2.2, vgsMax: 20, p: [[4.5, 0.010], [10, 0.0065]], qg: 60, qgs: 10, qgd: 12, ciss: 3700, rthja: 50, rthjc: 1.5, tj: 175,
      note: { tr: 'DPAK P-kanal; yüksek akımlı high-side.', en: 'DPAK P-channel; high-current high-side.' } },
    { id: 'IRF5305', type: 'P', fam: 'ppow', pkg: 'TO-220', vds: 55, id_: 31, vth: 3.0, vgsMax: 20, p: [[6, 0.10], [10, 0.060]], qg: 63, qgs: 13, qgd: 29, ciss: 1200, rthja: 62, rthjc: 1.4, tj: 175,
      note: { tr: 'Yaygın TO-220 P-kanal; 10 V V<sub>GS</sub> ister.', en: 'Common TO-220 P-channel; wants 10 V V<sub>GS</sub>.' } },
    { id: 'IRF9Z34N', type: 'P', fam: 'ppow', pkg: 'TO-220', vds: 55, id_: 19, vth: 3.0, vgsMax: 20, p: [[6, 0.17], [10, 0.10]], qg: 34, qgs: 6.8, qgd: 14, ciss: 620, rthja: 62, rthjc: 2.7, tj: 175,
      note: { tr: 'Orta güç P-kanal, 55 V.', en: 'Medium-power P-channel, 55 V.' } }

  ];
  // gate-charge test voltage (V) for parts whose Qg is specified below 10 V
  const qv = { AO3400A: 4.5, IRLML6344: 4.5, IRLZ44N: 5, IRLB8721: 4.5, Si2301: 4.5, AO3401A: 4.5,
    AO3416: 4.5, Si2302: 4.5, IRLML2502: 4.5, IRLZ34N: 5, IRL540N: 5, FQP30N06L: 5, STP55NF06L: 5, IRLB3034: 4.5,
    AOD4184A: 4.5, IRLR7843: 4.5, EPC2045: 5, C3M0065090D: 15, IRLML6402: 4.5 };
  // families for grouping in part pickers
  const famOf = { '2N7002': 'ss', BSS138: 'ss', AO3400A: 'lsmd', IRLML6344: 'lsmd', IRLZ44N: 'lpow', IRLB8721: 'lpow',
    IRFZ44N: 'std', IRF540N: 'std', IRF3205: 'std', Si2301: 'psmd', AO3401A: 'psmd', IRF9540N: 'ppow', IRF4905: 'ppow' };
  mos.forEach(m => { if (!m.fam) m.fam = famOf[m.id] || (m.type === 'P' ? 'ppow' : 'std'); });
  mos.forEach(m => { m.qv = qv[m.id] || 10; });
  mos.forEach(m => {
    const [[v1, r1], [v2, r2]] = m.p;
    let a = (r1 - r2) / (1 / (v1 - m.vth) - 1 / (v2 - m.vth));
    let rf = r2 - a / (v2 - m.vth);
    if (rf < 0) { rf = 0; a = r2 * (v2 - m.vth); }
    m.a = a; m.rf = rf; m.kind = 'mos';
    m.tc = 0.007; // R_DS(on) rises ~0.7 %/°C
  });

  /* ---------------- BJTs ----------------
     hFE(Ic) = h0 / (1 + Ic/ik), with h0 chosen so that hFE(iref) = hmin (worst case) or htyp.
     Vce(sat) at forced β ≈ 10:  vs0 + Ic·rs.   vbe: Vbe(sat) at moderate current.
     tsw: rise+fall (ns), ts: storage time at forced β 10 (ns). darl: Darlington. */
  const bjt = [
    { id: 'BC547B', type: 'N', pkg: 'TO-92', vce: 45, ic: 0.1, hmin: 200, htyp: 290, iref: 0.002, ik: 0.1, vs0: 0.08, rs: 1.2, vbe: 0.75, rthja: 250, rthjc: 0, tj: 150, tsw: 60, ts: 250,
      note: { tr: 'Küçük sinyal; ≤ 50 mA anahtarlama için idealdir.', en: 'Small-signal; ideal for switching ≤ 50 mA.' } },
    { id: '2N3904', type: 'N', pkg: 'TO-92', vce: 40, ic: 0.2, hmin: 100, htyp: 200, iref: 0.01, ik: 0.06, vs0: 0.06, rs: 3, vbe: 0.75, rthja: 200, rthjc: 0, tj: 150, tsw: 70, ts: 200,
      note: { tr: 'Hızlı küçük sinyal NPN; 100 mA üstünde β hızla düşer.', en: 'Fast small-signal NPN; β drops quickly above 100 mA.' } },
    { id: 'BC337-40', type: 'N', pkg: 'TO-92', vce: 45, ic: 0.8, hmin: 250, htyp: 400, iref: 0.1, ik: 0.4, vs0: 0.05, rs: 0.5, vbe: 0.85, rthja: 200, rthjc: 0, tj: 150, tsw: 150, ts: 400,
      note: { tr: 'Röle, buzzer ve 0,5 A’e kadar yükler için iyi bir TO-92.', en: 'A good TO-92 for relays, buzzers and loads up to 0.5 A.' } },
    { id: '2N2222A', type: 'N', pkg: 'TO-92', vce: 40, ic: 0.6, hmin: 100, htyp: 200, iref: 0.15, ik: 0.35, vs0: 0.1, rs: 1.0, vbe: 0.9, rthja: 200, rthjc: 0, tj: 150, tsw: 80, ts: 225,
      note: { tr: 'Klasik genel amaçlı NPN; 300 mA üstünde V<sub>CE(sat)</sub> belirgin artar.', en: 'Classic general-purpose NPN; V<sub>CE(sat)</sub> rises clearly above 300 mA.' } },
    { id: 'BD139', type: 'N', pkg: 'TO-126', vce: 80, ic: 1.5, hmin: 40, htyp: 100, iref: 0.15, ik: 0.6, vs0: 0.1, rs: 0.6, vbe: 1.0, rthja: 100, rthjc: 10, tj: 150, tsw: 500, ts: 1000,
      note: { tr: 'Orta güç NPN; düşük β nedeniyle GPIO’dan 0,5 A sürmek zor.', en: 'Medium-power NPN; low β makes 0.5 A hard to drive from a GPIO.' } },
    { id: 'TIP120', type: 'N', pkg: 'TO-220', vce: 60, ic: 5, hmin: 1000, htyp: 2500, iref: 3, ik: 4, vs0: 0.75, rs: 0.25, vbe: 1.4, rthja: 62.5, rthjc: 1.92, tj: 150, tsw: 2500, ts: 1500, darl: true,
      note: { tr: 'Darlington: kolay sürülür ama 1–2 V düşüm ve ısı demek.', en: 'Darlington: easy to drive but means a 1–2 V drop and heat.' } },
    { id: 'BC557B', type: 'P', pkg: 'TO-92', vce: 45, ic: 0.1, hmin: 200, htyp: 290, iref: 0.002, ik: 0.1, vs0: 0.08, rs: 1.5, vbe: 0.75, rthja: 250, rthjc: 0, tj: 150, tsw: 80, ts: 300,
      note: { tr: 'BC547’nin PNP eşi.', en: 'PNP complement of BC547.' } },
    { id: '2N3906', type: 'P', pkg: 'TO-92', vce: 40, ic: 0.2, hmin: 100, htyp: 200, iref: 0.01, ik: 0.06, vs0: 0.07, rs: 3, vbe: 0.8, rthja: 200, rthjc: 0, tj: 150, tsw: 80, ts: 225,
      note: { tr: '2N3904’ün PNP eşi.', en: 'PNP complement of 2N3904.' } },
    { id: 'BC327-40', type: 'P', pkg: 'TO-92', vce: 45, ic: 0.8, hmin: 250, htyp: 400, iref: 0.1, ik: 0.4, vs0: 0.06, rs: 0.6, vbe: 0.85, rthja: 200, rthjc: 0, tj: 150, tsw: 160, ts: 450,
      note: { tr: 'BC337’nin PNP eşi; high-side küçük yükler için.', en: 'PNP complement of BC337; for small high-side loads.' } }
  ];
  bjt.forEach(b => { b.kind = 'bjt'; });

  const Parts = { mos, bjt, all: mos.concat(bjt) };
  // display order and labels of the families
  Parts.families = [
    { id: 'ss', tr: 'Küçük sinyal', en: 'Small-signal' },
    { id: 'lsmd', tr: 'Logic-level SMD', en: 'Logic-level SMD' },
    { id: 'lpow', tr: 'Logic-level güç', en: 'Logic-level power' },
    { id: 'std', tr: 'Standart seviye (10 V gate)', en: 'Standard level (10 V gate)' },
    { id: 'hv', tr: 'Yüksek gerilim', en: 'High voltage' },
    { id: 'wbg', tr: 'GaN / SiC', en: 'GaN / SiC' },
    { id: 'pss', tr: 'P-kanal küçük sinyal', en: 'P-channel small-signal' },
    { id: 'psmd', tr: 'P-kanal SMD', en: 'P-channel SMD' },
    { id: 'ppow', tr: 'P-kanal güç', en: 'P-channel power' }
  ];
  Parts.get = id => Parts.all.find(p => p.id === id);

  /* ---- MOSFET model ---- */
  Parts.rds = function (m, vgs, tj) {
    const vov = vgs - m.vth;
    if (vov <= 0.02) return Infinity;
    return (m.rf + m.a / vov) * (1 + m.tc * ((tj == null ? 25 : tj) - 25));
  };
  Parts.idsat = function (m, vgs, tj) {
    const vov = vgs - m.vth;
    if (vov <= 0) return 0;
    // mobility falls with temperature (~ same factor as R_DS(on))
    return vov * vov / (2 * m.a) / (1 + m.tc * ((tj == null ? 25 : tj) - 25));
  };
  // drain current for given Vgs, Vds: triode resistor that bends into saturation
  Parts.idOf = function (m, vgs, vds, tj) {
    const r = Parts.rds(m, vgs, tj), is = Parts.idsat(m, vgs, tj);
    if (!isFinite(r) || is <= 0) return 0;
    return is * Math.tanh(vds / (r * is));
  };
  // gate voltage needed to carry id in saturation (Miller plateau estimate)
  Parts.vplateau = (m, id) => m.vth + Math.sqrt(2 * m.a * Math.max(id, 0));

  /* ---- BJT model ---- */
  Parts.hfe = function (b, ic, worst) {
    const h = worst ? b.hmin : b.htyp;
    const h0 = h * (1 + b.iref / b.ik);
    return h0 / (1 + Math.max(ic, 0) / b.ik);
  };
  Parts.vcesat = (b, ic) => b.vs0 + Math.max(ic, 0) * b.rs;

  App.Parts = Parts;
})();
