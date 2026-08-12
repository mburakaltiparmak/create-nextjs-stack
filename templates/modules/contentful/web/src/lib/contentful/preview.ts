import { draftMode } from 'next/headers';

/**
 * Draft mode açık mı? Servisler bunu `preview` parametresi olarak alır ve
 * açıksa Preview API'ye düşer, cache'i tamamen atlar.
 *
 * `draftMode()` sadece request scope'unda çağrılabilir; sitemap/robots gibi
 * bazı bağlamlarda hata fırlatır, o yüzden güvenli tarafta kalıyoruz.
 */
export async function isPreviewEnabled(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    return false;
  }
}
