// Gerekli değişkenler: veri kaynağı (Supabase) + giriş (credentials). Modüller kendi parçalarını
// scripts/config/ altına koyar: cms.mjs ve auth.mjs.
import * as cms from "./config/cms.mjs";
import * as auth from "./config/auth.mjs";

export const required = ["CRON_SECRET", "SITE_URL", "PREVIEW_SECRET", ...cms.required, ...auth.required];
export const check = (has) => [...(cms.check?.(has) ?? []), ...(auth.check?.(has) ?? [])];
