import {
    BellRing,
    MoreVertical,
    PlusSquare,
    Smartphone,
} from "lucide-react";

export default function KurulumRehberi() {
    return (
        <div className="standart-sayfa">
            <header className="sayfa-basligi">
                <div className="sayfa-baslik-ikon">
                    <Smartphone size={22} />
                </div>

                <div>
                    <span>Telefonuna yÃ¼kle</span>
                    <h1>Kurulum Rehberi</h1>
                </div>
            </header>

            <section className="kurulum-karti">
                <span className="kurulum-numara">1</span>

                <div className="kurulum-ikon">
                    <MoreVertical size={23} />
                </div>

                <div>
                    <strong>TarayÄ±cÄ± menÃ¼sÃ¼nÃ¼ aÃ§</strong>
                    <span>
                        Safari veya Chrome menÃ¼sÃ¼ne dokun.
                    </span>
                </div>
            </section>

            <section className="kurulum-karti">
                <span className="kurulum-numara">2</span>

                <div className="kurulum-ikon">
                    <PlusSquare size={23} />
                </div>

                <div>
                    <strong>Ana ekrana ekle</strong>
                    <span>
                        â€œAna Ekrana Ekleâ€ seÃ§eneÄŸine dokun.
                    </span>
                </div>
            </section>

            <section className="kurulum-karti">
                <span className="kurulum-numara">3</span>

                <div className="kurulum-ikon">
                    <BellRing size={23} />
                </div>

                <div>
                    <strong>Bildirimlere izin ver</strong>
                    <span>
                        UygulamayÄ± ana ekrandan aÃ§Ä±p bildirimleri etkinleÅŸtir.
                    </span>
                </div>
            </section>
        </div>
    );
}