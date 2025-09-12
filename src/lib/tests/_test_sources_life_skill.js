const mysteryMetal =
{
    "Id": 2030006,
    "Name$english": "Mystery Metal - Beginner",
    "AwardGroups": [
        [
            {
                "itemId": 1022101,
                "rate": 0.8,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1022101,
                "rate": 0.2,
                "minAmount": 2,
                "maxAmount": 2,
            },
        ]
    ],
    "SpecialAward": [
        {
            talent: {
                Name$english: "Lucky Smelting Lv.1"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.05,
                    "minAmount": 1,
                    "maxAmount": 1,
                }
            ],
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.2"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.10,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.3"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        }
    ],
};

const meatfishSkewer = {
    "Id": 2010055,
    "Name$english": "Meatfish Skewer",
    "AwardGroups": [
        [
            {
                "itemId": 1012012,
                "rate": 0.5,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1012013,
                "rate": 0.4,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1012014,
                "rate": 0.1,
                "minAmount": 1,
                "maxAmount": 1,
            }
        ]
    ],
    "SpecialAward": [
        {
            talent: {
                Name$english: "Lucky Cooking Lv.1"
            },
            awards:
                [
                    {
                        "itemId": 1012012,
                        "rate": 0.05,
                        "minAmount": 1,
                        "maxAmount": 1,
                        "avgAmount": 1
                    },
                    {
                        "itemId": 1012013,
                        "rate": 0.04000000000000001,
                        "minAmount": 1,
                        "maxAmount": 1,
                        "avgAmount": 1
                    },
                    {
                        "itemId": 1012014,
                        "rate": 0.010000000000000002,
                        "minAmount": 1,
                        "maxAmount": 1,
                        "avgAmount": 1
                    }
                ],
        },
        {
            talent: {
                Name$english: "Lucky Cooking Lv.2"
            },
            awards: [
                {
                    "itemId": 1012012,
                    "rate": 0.1,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                },
                {
                    "itemId": 1012013,
                    "rate": 0.08000000000000002,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                },
                {
                    "itemId": 1012014,
                    "rate": 0.020000000000000004,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                }
            ],
        },
        {
            talent: {
                Name$english: "Lucky Cooking Lv.3"
            },
            awards: [
                {
                    "itemId": 1012012,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                },
                {
                    "itemId": 1012013,
                    "rate": 0.12,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                },
                {
                    "itemId": 1012014,
                    "rate": 0.03,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                }
            ],
        }
    ],
};

const mergedAwards =
{
    "Id": 2030006,
    "Name$english": "Mystery Metal - Beginner",
    "AwardGroups": [
        [
            {
                "itemId": 1022101,
                "rate": 0.8,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1022101,
                "rate": 0.2,
                "minAmount": 2,
                "maxAmount": 2,
            },
        ],
        [
            {
                "itemId": 1022101,
                "rate": 0.7,
                "minAmount": 10,
                "maxAmount": 10,
            },
            {
                "itemId": 1022101,
                "rate": 0.3,
                "minAmount": 11,
                "maxAmount": 11,
            },
        ]
    ],
    "SpecialAward": [
        {
            talent: {
                Name$english: "Lucky Smelting Lv.1"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.05,
                    "minAmount": 1,
                    "maxAmount": 1,
                }
            ],
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.2"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.10,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.3"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        },
    ],
};

const mergedTalents =
{
    "Id": 2030006,
    "Name$english": "Mystery Metal - Beginner",
    "AwardGroups": [
        [
            {
                "itemId": 1022101,
                "rate": 0.8,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1022101,
                "rate": 0.2,
                "minAmount": 2,
                "maxAmount": 2,
            },
        ],
        [
            {
                "itemId": 1012012,
                "rate": 0.5,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1012013,
                "rate": 0.4,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1012014,
                "rate": 0.1,
                "minAmount": 1,
                "maxAmount": 1,
            }
        ]
    ],
    "SpecialAward": [
        {
            talent: {
                Name$english: "Lucky Everything Lv.1"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.05,
                    "minAmount": 1,
                    "maxAmount": 1,
                }
            ],
        },
        {
            talent: {
                Name$english: "Lucky Everything Lv.2"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.10,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        },
        {
            talent: {
                Name$english: "Lucky Everything Lv.3"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
                {
                    "itemId": 1012012,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                },
                {
                    "itemId": 1012013,
                    "rate": 0.12,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                },
                {
                    "itemId": 1012014,
                    "rate": 0.03,
                    "minAmount": 1,
                    "maxAmount": 1,
                    "avgAmount": 1
                }
            ]
        },
    ],
};

const multiBonusChances =
{
    "Id": 2030006,
    "Name$english": "Mystery Metal - Beginner",
    "AwardGroups": [
        [
            {
                "itemId": 1022101,
                "rate": 0.8,
                "minAmount": 1,
                "maxAmount": 1,
            },
            {
                "itemId": 1022101,
                "rate": 0.2,
                "minAmount": 2,
                "maxAmount": 2,
            },
        ]
    ],
    "SpecialAward": [
        {
            talent: {
                Name$english: "Lucky Smelting Lv.1"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.05,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
                {
                    "itemId": 1022101,
                    "rate": 0.5,
                    "minAmount": 2,
                    "maxAmount": 2,
                },
            ],
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.2"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.10,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
                {
                    "itemId": 1022101,
                    "rate": 0.10,
                    "minAmount": 2,
                    "maxAmount": 2,
                },
            ]
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.3"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
                {
                    "itemId": 1022101,
                    "rate": 0.15,
                    "minAmount": 2,
                    "maxAmount": 2,
                },
            ]
        }
    ],
};

const overlappingMinMaxRange =
{
    "Id": 2030006,
    "Name$english": "Mystery Metal - Beginner",
    "AwardGroups": [
        [
            {
                "itemId": 1022101,
                "rate": 0.8,
                "minAmount": 1,
                "maxAmount": 3,
            },
            {
                "itemId": 1022101,
                "rate": 0.2,
                "minAmount": 2,
                "maxAmount": 5,
            },
        ]
    ],
    "SpecialAward": [
        {
            talent: {
                Name$english: "Lucky Smelting Lv.1"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.05,
                    "minAmount": 1,
                    "maxAmount": 1,
                }
            ],
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.2"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.10,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        },
        {
            talent: {
                Name$english: "Lucky Smelting Lv.3"
            },
            awards: [
                {
                    "itemId": 1022101,
                    "rate": 0.15,
                    "minAmount": 1,
                    "maxAmount": 1,
                },
            ]
        }
    ],
};

// const everythingBurger = {}

export default [
    // mysteryMetal,
    // meatfishSkewer,
    // mergedAwards,
    mergedTalents,
    // multiBonusChances,
    // overlappingMinMaxRange,
]