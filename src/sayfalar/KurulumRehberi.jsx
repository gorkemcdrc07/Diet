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
                    <span>Telefonuna yükle</span>
                    <h1>Kurulum Rehberi</h1>
                </div>
            </header>

            <section className="kurulum-karti">
                <span className="kurulum-numara">1</span>

                <div className="kurulum-ikon">
                    <MoreVertical size={23} />
                </div>

                <div>
                    <strong>Tarayıcı menüsünü aç</strong>
                    <span>
                        Safari veya Chrome menüsüne dokun.
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
                        “Ana Ekrana Ekle” seçeneğine dokun.
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
                        Uygulamayı ana ekrandan açıp bildirimleri etkinleştir.
                    </span>
                </div>
            </section>
        </div>
    );
}