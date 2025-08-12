# 🐾 Veterinar App💉
---
## 🚀 Zagon aplikacije
```bash
docker-compose up --build
```
---
## 📦 Tehnologije
- **Enkapsulacija:** Docker  
- **Frontend:** React -> Port 80, v Docker okolju 3001
- **Backend:** Express -> Port 3000
- **Baza:** MySQL  -> Port 3306

Ob zagonu Docker okolja se izvede skripta `mysql-init/init.sql`, ki:
- Ustvari potrebne tabele
- Napolni bazo z nekaj začetnimi podatki 
- Ustvari super uporabnika, ki lahko odobri nove veterinare [Admin, Admin]


---

## 🔐 Varnost
- **JWT tokeni**:
  - Generirajo se ob `/login`
  - Shranjujejo se lokalno (localStorage)
  - Dodajo se kot podpis za vsak API klic  
- **Avtorizacija po vlogah**:
  - Različni tipi uporabnikov imajo dostop samo do določenih strani (npr. navaden uporabnik ne more do `admin-dashboard`)
- **Preverjanje ID-jev v URL-jih**:
  - Preprečuje dostop ali spreminjanje podatkov, ki ne pripadajo uporabniku  
    *(npr. `pet/4` ali `owner/1` za napačnega uporabnika)*
---
## 🖥️ Funkcionalnosti

- **Nadzorne plošče**:
  - Lastniki (pregled svojih podatkov ter podatkov o živali, poročila, opomniki)
  - Veterinari (pregled in spremembe podatkov lastnikov, živali in cepiv)
  - Administratori (pregled vsega in dodeljevanje pravic)

- **Iskanje**:
  - Lastnikov (po imenu, uporabniškem računu, naslovu)
  - Živali (nazivu, lastniku, cepivu)


