import { CalendarDays } from "lucide-react";
import { gunlukProgram } from "../veriler/gunlukProgram";

export default function ProgramSayfasi() {
    return (
        <div className="standart-sayfa">
            <header className="sayfa-basligi">
                <div className="sayfa-baslik-ikon">
                    <CalendarDays size={22} />
                </div>

                <div>
                    <span>Beslenme planı</span>
                    <h1>Programım</h1>
                </div>
            </header>

            <div className="program-zaman-cizgisi">
                {gunlukProgram.map((ogun, index) => (
                    <article
                        key={ogun.id}
                        className="program-zaman-karti"
                    >
                        <div className="zaman-sol">
                            <span>{ogun.saat}</span>

                            <div className="zaman-nokta">
                                <i />

                                {index < gunlukProgram.length - 1 && (
                                    <b />
                                )}
                            </div>
                        </div>

                        <div className="zaman-icerik">
                            <div className="zaman-emoji">
                                {ogun.emoji}
                            </div>

                            <div>
                                <strong>{ogun.baslik}</strong>
                                <span>{ogun.kisaBaslik}</span>

                                <ul>
                                    {ogun.icerikler.map((icerik) => (
                                        <li key={icerik}>{icerik}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}