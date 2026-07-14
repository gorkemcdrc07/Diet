import {
    Award,
    CalendarDays,
    Home,
    PawPrint,
    ShoppingBag,
    UserRound,
} from "lucide-react";

const menuElemanlari = [
    {
        id: "ana-sayfa",
        etiket: "Ana Sayfa",
        ikon: Home,
    },
    {
        id: "program",
        etiket: "Program",
        ikon: CalendarDays,
    },
    {
        id: "magaza",
        etiket: "Mağaza",
        ikon: ShoppingBag,
    },
    {
        id: "basarilar",
        etiket: "Başarılar",
        ikon: Award,
    },
    {
        id: "karakterler",
        etiket: "Karakterler",
        ikon: PawPrint,
    },
    {
        id: "profil",
        etiket: "Profil",
        ikon: UserRound,
    },
];

export default function AltMenu({
    aktifSayfa,
    onSayfaDegistir,
}) {
    return (
        <nav
            className="alt-menu"
            aria-label="Alt navigasyon"
        >
            {menuElemanlari.map((menu) => {
                const Icon = menu.ikon;

                const aktif =
                    aktifSayfa === menu.id;

                return (
                    <button
                        key={menu.id}
                        type="button"
                        className={
                            aktif
                                ? "aktif"
                                : ""
                        }
                        onClick={() =>
                            onSayfaDegistir(
                                menu.id,
                            )
                        }
                        aria-current={
                            aktif
                                ? "page"
                                : undefined
                        }
                        aria-label={
                            menu.etiket
                        }
                    >
                        <span className="alt-menu-ikon">
                            <Icon
                                size={21}
                                strokeWidth={
                                    aktif
                                        ? 2.5
                                        : 2
                                }
                            />
                        </span>

                        <small>
                            {menu.etiket}
                        </small>
                    </button>
                );
            })}
        </nav>
    );
}