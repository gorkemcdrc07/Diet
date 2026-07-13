import {
    Bell,
    CalendarDays,
    Home,
    Smartphone,
} from "lucide-react";

const menuElemanlari = [
    {
        id: "ana-sayfa",
        etiket: "Ana Sayfa",
        ikon: Home,
    },
    {
        id: "program",
        etiket: "Programım",
        ikon: CalendarDays,
    },
    {
        id: "bildirimler",
        etiket: "Bildirimler",
        ikon: Bell,
    },
    {
        id: "kurulum",
        etiket: "Kurulum",
        ikon: Smartphone,
    },
];

export default function AltMenu({
    aktifSayfa,
    onSayfaDegistir,
}) {
    return (
        <nav className="alt-menu">
            {menuElemanlari.map((menu) => {
                const Icon = menu.ikon;
                const aktif = aktifSayfa === menu.id;

                return (
                    <button
                        key={menu.id}
                        type="button"
                        className={aktif ? "aktif" : ""}
                        onClick={() => onSayfaDegistir(menu.id)}
                    >
                        <span className="alt-menu-ikon">
                            <Icon
                                size={21}
                                strokeWidth={aktif ? 2.5 : 2}
                            />
                        </span>

                        <small>{menu.etiket}</small>
                    </button>
                );
            })}
        </nav>
    );
}