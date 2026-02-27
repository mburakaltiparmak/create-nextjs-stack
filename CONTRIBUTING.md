# Contributing to create-nextjs-stack

Katkılarınız, hata raporlarınız ve özellik istekleriniz memnuniyetle karşılanır!

## Geliştirme Ortamını Kurma

1. Repository'yi fork edin
2. Fork'unuzu klonlayın:
   ```bash
   git clone https://github.com/YOUR_USERNAME/create-nextjs-stack.git
   cd create-nextjs-stack
   ```
3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
4. Testleri çalıştırarak her şeyin düzgün olduğunu doğrulayın:
   ```bash
   npm test
   ```

## Değişiklik Yapma

1. `main` branch'inden bir feature branch oluşturun:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Değişikliklerinizi yapın
3. Tüm testlerin geçtiğinden emin olun:
   ```bash
   npm test
   ```
4. Açıklayıcı bir PR gönderin

## Commit Mesajları

Bu projede [Conventional Commits](https://www.conventionalcommits.org/) standardını kullanıyoruz:

- `feat:` — Yeni özellik
- `fix:` — Hata düzeltme
- `docs:` — Sadece dokümantasyon değişikliği
- `chore:` — Build, CI veya yardımcı araç değişiklikleri
- `refactor:` — Davranış değiştirmeyen kod yeniden yapılandırması
- `test:` — Test ekleme veya düzeltme

Örnek: `feat: add package manager selection prompt`

## Template Değişiklikleri

Template'lerde (`templates/web/` veya `templates/admin/`) değişiklik yaparken:

1. Template'in `.env` doldurulduktan sonra hatasız `npm run build` yapabildiğini doğrulayın
2. Yeni dependency ekliyorsanız, `package.json`'daki `engines` alanıyla uyumlu olduğunu kontrol edin
3. Yeni environment variable ekliyorsanız, `.env.example`'a açıklayıcı bir yorum ile ekleyin

## CLI Değişiklikleri

`bin/cli.js`'te değişiklik yaparken:

1. Tüm üç template tipi için scaffold'un çalıştığını test edin (web, admin, full-stack)
2. Interactive ve non-interactive (`--template` flag) modları test edin
3. Mevcut testlerin geçtiğini doğrulayın: `npm test`

## Hata Raporları

[GitHub Issues](https://github.com/mburakaltiparmak/create-nextjs-stack/issues) üzerinden rapor edin. Lütfen şunları belirtin:

- `create-nextjs-stack` versiyonu
- Node.js versiyonu
- İşletim sistemi
- Hangi template tipini kullandığınız
- Hatayı tekrar üretme adımları

## Lisans

Katkı yaparak, katkılarınızın [MIT Lisansı](./LICENSE) altında lisanslanacağını kabul etmiş olursunuz.
