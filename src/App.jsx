import { useState } from "react";
import AnaSayfa from "./sayfalar/AnaSayfa";
import ProgramSayfasi from "./sayfalar/ProgramSayfasi";
import BildirimAyarlari from "./sayfalar/BildirimAyarlari";
import KurulumRehberi from "./sayfalar/KurulumRehberi";
import AltMenu from "./bilesenler/AltMenu";
import "./App.css";

export default function App() {
    const [aktifSayfa, setAktifSayfa] = useState("ana-sayfa");

    function sayfaGetir() {
        switch (aktifSayfa) {
            case "program":
                return <ProgramSayfasi />;

            case "bildirimler":
                return <BildirimAyarlari />;

            case "kurulum":
                return <KurulumRehberi />;

            default:
                return <AnaSayfa />;
        }
    }

    return (
        <div className="uygulama">
            <main className="uygulama-icerik">{sayfaGetir()}</main>

            <AltMenu
                aktifSayfa={aktifSayfa}
                onSayfaDegistir={setAktifSayfa}
            />
        </div>
    );
}