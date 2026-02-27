import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/test-output/**",
      "**/templates/**",
    ],
    watch: false,
    testTimeout: 60_000,
    reporters: ["verbose"],
    // Coverage: Bilgilendirme amaçlı — threshold YOK.
    //
    // Bu proje bir CLI tool. Testler CLI'ı execa ile child process olarak
    // çalıştırıyor. V8 coverage provider sadece ana Vitest process'i içinde
    // çalışan kodu izleyebilir, child process'leri göremez.
    // Bu yüzden coverage raporu ~0% gösterir — bu beklenen davranış.
    //
    // Coverage'ı anlamlı hale getirmek için bin/cli.js'teki iş mantığını
    // ayrı modüllere (lib/) çıkarıp doğrudan import ederek unit test
    // yazmak gerekir. Bu, sonraki fazda planlanıyor.
    //
    // Şu anki 87 integration test, scaffold sonuçlarını dosya sistemi
    // üzerinden doğrulayarak gerçek fonksiyonel coverage sağlıyor.
    coverage: {
      provider: "v8",
      include: ["bin/**"],
      reporter: ["text", "text-summary"],
      reportsDirectory: "./coverage",
    },
  },
});
