import "dotenv/config";

import cors from "cors";
import express from "express";
import multer from "multer";
import OpenAI from "openai";

const app = express();

const PORT =
    Number(process.env.PORT) ||
    5050;

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

if (!process.env.OPENAI_API_KEY) {
    console.error(
        "OPENAI_API_KEY tanımlı değil.",
    );

    process.exit(1);
}

const openai =
    new OpenAI({
        apiKey:
            process.env.OPENAI_API_KEY,
    });

const upload =
    multer({
        storage:
            multer.memoryStorage(),

        limits: {
            fileSize:
                8 * 1024 * 1024,
        },

        fileFilter:
            (
                request,
                file,
                callback,
            ) => {
                const izinliTipler = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                ];

                if (
                    !izinliTipler.includes(
                        file.mimetype,
                    )
                ) {
                    callback(
                        new Error(
                            "Yalnızca JPG, PNG veya WEBP görsel yüklenebilir.",
                        ),
                    );

                    return;
                }

                callback(
                    null,
                    true,
                );
            },
    });

const izinliOriginler = [
    "http://localhost:5173",
    "https://diet-psi-blush.vercel.app",
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (
                izinliOriginler.includes(origin)
            ) {
                return callback(null, true);
            }

            callback(
                new Error(
                    `CORS engellendi: ${origin}`,
                ),
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        credentials: true,
    }),
);
app.use(
    express.json({
        limit:
            "1mb",
    }),
);

app.get(
    "/api/health",
    (
        request,
        response,
    ) => {
        response.json({
            success:
                true,

            message:
                "Miço & Vicky backend çalışıyor.",
        });
    },
);

const yemekAnalizSemasi = {
    type:
        "object",

    additionalProperties:
        false,

    required: [
        "yemek_var",
        "genel_guven",
        "aciklama",
        "yemekler",
        "toplam",
        "uyarilar",
    ],

    properties: {
        yemek_var: {
            type:
                "boolean",
        },

        genel_guven: {
            type:
                "number",

            minimum:
                0,

            maximum:
                1,
        },

        aciklama: {
            type:
                "string",
        },

        yemekler: {
            type:
                "array",

            items: {
                type:
                    "object",

                additionalProperties:
                    false,

                required: [
                    "ad",
                    "tahmini_gram",
                    "kalori",
                    "protein",
                    "karbonhidrat",
                    "yag",
                    "guven",
                ],

                properties: {
                    ad: {
                        type:
                            "string",
                    },

                    tahmini_gram: {
                        type:
                            "number",

                        minimum:
                            0,
                    },

                    kalori: {
                        type:
                            "number",

                        minimum:
                            0,
                    },

                    protein: {
                        type:
                            "number",

                        minimum:
                            0,
                    },

                    karbonhidrat: {
                        type:
                            "number",

                        minimum:
                            0,
                    },

                    yag: {
                        type:
                            "number",

                        minimum:
                            0,
                    },

                    guven: {
                        type:
                            "number",

                        minimum:
                            0,

                        maximum:
                            1,
                    },
                },
            },
        },

        toplam: {
            type:
                "object",

            additionalProperties:
                false,

            required: [
                "kalori",
                "protein",
                "karbonhidrat",
                "yag",
            ],

            properties: {
                kalori: {
                    type:
                        "number",

                    minimum:
                        0,
                },

                protein: {
                    type:
                        "number",

                    minimum:
                        0,
                },

                karbonhidrat: {
                    type:
                        "number",

                    minimum:
                        0,
                },

                yag: {
                    type:
                        "number",

                    minimum:
                        0,
                },
            },
        },

        uyarilar: {
            type:
                "array",

            items: {
                type:
                    "string",
            },
        },
    },
};

function resmiDataUrlYap(
    file,
) {
    const base64 =
        file.buffer.toString(
            "base64",
        );

    return `data:${file.mimetype};base64,${base64}`;
}

app.post(
    "/api/yemek-analiz",
    upload.single(
        "fotograf",
    ),
    async (
        request,
        response,
    ) => {
        try {
            if (!request.file) {
                response
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Analiz edilecek fotoğraf bulunamadı.",
                    });

                return;
            }

            const ogunTuru =
                String(
                    request.body
                        ?.ogunTuru ||
                    "diger",
                );

            const ekAciklama =
                String(
                    request.body
                        ?.aciklama ||
                    "",
                ).trim();

            const imageUrl =
                resmiDataUrlYap(
                    request.file,
                );

            const sonuc =
                await openai.responses.create({
                    model:
                        "gpt-4.1-mini",

                    input: [
                        {
                            role:
                                "system",

                            content: [
                                {
                                    type:
                                        "input_text",

                                    text:
                                        [
                                            "Sen bir yemek fotoğrafı analiz yardımcısısın.",
                                            "Fotoğraftaki yiyecekleri ayrı ayrı belirle.",
                                            "Porsiyon miktarlarını gram olarak tahmin et.",
                                            "Kalori, protein, karbonhidrat ve yağ değerlerini tahmin et.",
                                            "Sonuçların yaklaşık olduğunu unutma.",
                                            "Fotoğrafta yiyecek yoksa yemek_var false döndür.",
                                            "Belirsiz yiyeceklerde güven oranını düşük ver.",
                                            "Aynı yiyeceği gereksiz şekilde parçalara bölme.",
                                            "Tabak, çatal, masa veya içilmeyen nesneleri yiyecek sayma.",
                                            "Kullanıcıya kesin tıbbi veya beslenme teşhisi verme.",
                                        ].join(
                                            "\n",
                                        ),
                                },
                            ],
                        },

                        {
                            role:
                                "user",

                            content: [
                                {
                                    type:
                                        "input_text",

                                    text:
                                        [
                                            `Öğün türü: ${ogunTuru}`,
                                            ekAciklama
                                                ? `Kullanıcı açıklaması: ${ekAciklama}`
                                                : "",
                                            "Bu fotoğrafı analiz et.",
                                        ]
                                            .filter(
                                                Boolean,
                                            )
                                            .join(
                                                "\n",
                                            ),
                                },

                                {
                                    type:
                                        "input_image",

                                    image_url:
                                        imageUrl,

                                    detail:
                                        "low",
                                },
                            ],
                        },
                    ],

                    text: {
                        format: {
                            type:
                                "json_schema",

                            name:
                                "yemek_fotografi_analizi",

                            strict:
                                true,

                            schema:
                                yemekAnalizSemasi,
                        },
                    },
                });

            const outputText =
                sonuc.output_text;

            if (!outputText) {
                throw new Error(
                    "Model analiz sonucu döndürmedi.",
                );
            }

            const analiz =
                JSON.parse(
                    outputText,
                );

            response.json({
                success:
                    true,

                analiz,
            });
        } catch (error) {
            console.error(
                "Yemek fotoğrafı analiz hatası:",
                error,
            );

            response
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        error?.message ||
                        "Yemek fotoğrafı analiz edilemedi.",
                });
        }
    },
);

app.use(
    (
        error,
        request,
        response,
        next,
    ) => {
        console.error(
            "Backend genel hata:",
            error,
        );

        response
            .status(400)
            .json({
                success:
                    false,

                message:
                    error?.message ||
                    "İstek işlenemedi.",
            });
    },
);

app.listen(
    PORT,
    () => {
        console.log(
            `Backend http://localhost:${PORT} adresinde çalışıyor.`,
        );
    },
);