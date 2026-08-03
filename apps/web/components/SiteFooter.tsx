import Link from "next/link";
import { SiteBrandLink } from "@/components/SiteBrand";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div>
          <SiteBrandLink
            className="font-heading text-lg font-bold text-white"
            accentClassName="text-accent"
            imageClassName="h-12 w-auto max-w-[220px] object-contain"
          />
          <p className="mt-3 text-sm text-white/70">
            สวนทุเรียนและศูนย์แปรรูปครบวงจร เน้นคุณภาพ ความโปร่งใส และการตรวจสอบย้อนกลับ
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-accent">เมนู</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/products" className="hover:text-white">
                สินค้า
              </Link>
            </li>
            <li>
              <Link href="/trace" className="hover:text-white">
                Traceability
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-accent">มาตรฐาน</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>GAP / โรงงาน อย.</li>
            <li>คลังควบคุมอุณหภูมิ</li>
            <li>ระบบ LOT / Batch</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wider text-accent">ติดต่อ</p>
          <p className="mt-4 text-sm text-white/70">
            จันทบุรี · ประเทศไทย
            <br />
            Line / โทร: สอบถามผ่านฟอร์ม
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} AuraGold Durian. สงวนลิขสิทธิ์.
      </div>
    </footer>
  );
}
