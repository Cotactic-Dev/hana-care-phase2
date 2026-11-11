import Icon from "@/components/ui/Icon";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import RentalConfigurator from "@/components/cart/RentalConfigurator";
import RentalPlans from "@/components/products/RentalPlans";
import ProductCard from "@/components/products/ProductCard";
import SampleBadge from "@/components/ui/SampleBadge";
import { getProduct, products } from "@/data/products";
import { SITE_URL } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const path = `/patient-beds/${p.slug}/`;
  return {
    title: { absolute: p.seo.title },
    description: p.seo.description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: p.seo.title, description: p.seo.description, images: [p.image.src] },
  };
}

export default async function ProductPage({ params }: Params) {
  const p = getProduct((await params).slug);
  if (!p) notFound();

  const url = `${SITE_URL}/patient-beds/${p.slug}/`;
  const from = Math.min(...Object.values(p.monthly));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "เตียงปรับระดับ 3 รุ่น", item: `${SITE_URL}/patient-beds/` },
          { "@type": "ListItem", position: 3, name: p.modelName, item: url },
        ],
      },
      {
        "@type": "Product",
        name: `เตียงปรับระดับ Hana Care รุ่น ${p.modelName}`,
        image: `${SITE_URL}${p.image.src}`,
        description: p.description,
        sku: p.sku,
        brand: { "@type": "Brand", name: "France Bed" },
        // Rental offer (sample price in mockup)
        offers: {
          "@type": "Offer",
          priceCurrency: "THB",
          price: String(from),
          priceSpecification: { "@type": "UnitPriceSpecification", price: String(from), priceCurrency: "THB", unitText: "MONTH" },
          businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
          availability: "https://schema.org/InStock",
          url,
        },
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />

      <div className="breadcrumb-bar">
        <div className="container">
          <ul className="breadcrumb-list">
            <li>
              <Link href="/">หน้าแรก</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li>
              <Link href="/patient-beds/">เตียงปรับระดับ 3 รุ่น</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li aria-current="page">{p.modelName}</li>
          </ul>
        </div>
      </div>

      {/* Hero */}
      <section className="product-detail-hero">
        <div className="container">
          <div className="product-detail-grid">
            <div className="product-gallery-main">
              <div className="product-hero-image-box bg-[#f2f2f4]">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  width={p.image.width}
                  height={p.image.height}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="h-full! w-full object-contain!"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] bg-hana-navy-tint px-[18px] py-3 text-[0.85rem] text-hana-navy">
                <span><Icon name="award" /></span> <strong>ผลิตโดย France Bed ประเทศญี่ปุ่น</strong>
                <span className="opacity-40">•</span>
                <span><Icon name="check-circle" className="inline-icon" /> ขึ้นทะเบียน อย. เรียบร้อยแล้ว</span>
              </div>
              <div className="quick-spec-pill-grid mt-5">
                {p.highlights.slice(0, 2).concat(p.bestFor.slice(0, 2)).map((h, i) => (
                  <div className="spec-pill-item" key={h}>
                    <span className="spec-pill-icon"><Icon name={(["sparkles", "bed", "user", "house"] as const)[i]} /></span>
                    <div>
                      <div className="text-xs text-ink-light">{i < 2 ? "จุดเด่น" : "เหมาะกับ"}</div>
                      <div className="spec-pill-text">{h}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="product-summary-pane">
              <div className="product-meta-badge text-hana-pink-ink!">
                <span>
                  {p.badge} • {p.tier}
                </span>
              </div>

              <h1 className="product-detail-title">
                เตียงปรับระดับ รุ่น <span className="text-hana-gradient">{p.modelName}</span>
              </h1>
              <p className="product-detail-tagline">
                <strong className="text-hana-navy">{p.tagline}</strong>
                <br />
                {p.description}
              </p>

              <RentalConfigurator slug={p.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">WHY {p.modelName.toUpperCase()}</span>
            <h2 className="section-title">ทำไมครอบครัวเลือกรุ่น {p.modelName}</h2>
            <p className="section-desc">ออกแบบเพื่อความสบายของผู้ใช้งาน และลดภาระของผู้ดูแลในทุกวัน</p>
          </div>
          <div className="feature-benefit-grid">
            {p.features.map((b) => (
              <div className="feature-benefit-card" key={b.title}>
                <div className="feature-icon-circle"><Icon name={b.icon} /></div>
                <h4>{b.title}</h4>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rental plans */}
      <section id="plans" className="section section-bg-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">RENTAL PLANS</span>
            <h2 className="section-title">เลือกรูปแบบการเช่าที่เหมาะกับครอบครัว</h2>
            <p className="section-desc">
              ทุกแพ็กเกจรวมบริการส่ง ติดตั้ง สาธิตการใช้งาน และการดูแลหลังการเช่า <SampleBadge />
            </p>
          </div>
          <RentalPlans product={p} />
        </div>
      </section>

      {/* Specs */}
      <section className="section">
        <div className="container container-narrow">
          <div className="section-header">
            <span className="section-tag">SPECIFICATIONS</span>
            <h2 className="section-title">ข้อมูลจำเพาะ</h2>
            <p className="section-desc">
              แถวที่มีเครื่องหมาย <SampleBadge /> เป็นข้อมูลตัวอย่าง รอยืนยันจากผู้ผลิต
            </p>
          </div>
          <table className="spec-full-table">
            <tbody>
              {p.specs.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td>
                    {s.value} {!s.confirmed && <SampleBadge className="ml-1" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Other models */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">OTHER MODELS</span>
            <h2 className="section-title">ดูรุ่นอื่นเพิ่มเติม</h2>
          </div>
          <div className="product-grid mx-auto max-w-[860px] lg:grid-cols-2!">
            {products
              .filter((o) => o.slug !== p.slug)
              .map((o) => (
                <ProductCard key={o.slug} p={o} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
