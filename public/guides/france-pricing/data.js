export const DATA = {
  "date": "2026-10-16",
  "vendors": [
    {
      "id": "gosuivi",
      "name": "GoSuivi",
      "initials": "Go",
      "source": "E01",
      "category": "repair",
      "plans": [
        {
          "id": "premium",
          "name": "Premium",
          "price": 45,
          "fixed": 0,
          "minimum": 1,
          "unit": "package",
          "period": "monthly"
        },
        {
          "id": "white",
          "name": "Marque Blanche",
          "price": 59,
          "fixed": 0,
          "minimum": 1,
          "unit": "package",
          "period": "monthly"
        },
        {
          "id": "complete",
          "name": "Complète",
          "price": 99,
          "fixed": 0,
          "minimum": 1,
          "unit": "package",
          "period": "monthly"
        }
      ]
    },
    {
      "id": "glpi",
      "name": "GLPI Network",
      "initials": "G",
      "source": "E02",
      "category": "helpdesk",
      "plans": [
        {
          "id": "public",
          "name": "Public Cloud",
          "price": 19,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        },
        {
          "id": "private",
          "name": "Private Cloud",
          "price": 21,
          "fixed": 0,
          "minimum": 25,
          "unit": "seat",
          "period": "monthly"
        }
      ]
    },
    {
      "id": "freshdesk",
      "name": "Freshdesk",
      "initials": "F",
      "source": "E03",
      "category": "helpdesk",
      "plans": [
        {
          "id": "growth",
          "name": "Growth",
          "price": 17,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "pro",
          "name": "Pro",
          "price": 52,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "enterprise",
          "name": "Enterprise",
          "price": 84,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        }
      ]
    },
    {
      "id": "zendesk",
      "name": "Zendesk",
      "initials": "Z",
      "source": "E04",
      "category": "helpdesk",
      "plans": [
        {
          "id": "support-a",
          "name": "Support Team",
          "price": 19,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "suite-a",
          "name": "Suite Team",
          "price": 55,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "pro-a",
          "name": "Suite Professional",
          "price": 115,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "support-m",
          "name": "Support Team",
          "price": 25,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        },
        {
          "id": "suite-m",
          "name": "Suite Team",
          "price": 69,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        },
        {
          "id": "pro-m",
          "name": "Suite Professional",
          "price": 149,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        }
      ]
    },
    {
      "id": "dolicloud",
      "name": "DoliCloud",
      "initials": "D",
      "source": "E05",
      "category": "erp",
      "plans": [
        {
          "id": "basic",
          "name": "Basic",
          "price": 14,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        },
        {
          "id": "premium",
          "name": "Premium",
          "price": 15,
          "fixed": 30,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        }
      ]
    },
    {
      "id": "synchroteam",
      "name": "Synchroteam",
      "initials": "S",
      "source": "E06",
      "category": "field",
      "plans": [
        {
          "id": "standard-a",
          "name": "Standard",
          "price": 39,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "standard-m",
          "name": "Standard",
          "price": 49,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        },
        {
          "id": "premium-a",
          "name": "Premium",
          "price": 64,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "annual"
        },
        {
          "id": "premium-m",
          "name": "Premium",
          "price": 79,
          "fixed": 0,
          "minimum": 1,
          "unit": "seat",
          "period": "monthly"
        }
      ]
    }
  ],
  "sources": [
    {
      "id": "E01",
      "brand": "GoSuivi",
      "url": "https://www.gosuivi.fr/tarifs.php",
      "tax": "HT",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E02",
      "brand": "GLPI Network",
      "url": "https://www.glpi-project.org/fr/pricing/",
      "tax": "HT",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E03",
      "brand": "Freshdesk",
      "url": "https://www.freshworks.com/fr/freshdesk/pricing/",
      "tax": "unknown",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E04",
      "brand": "Zendesk",
      "url": "https://www.zendesk.fr/pricing/",
      "tax": "unknown",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E05",
      "brand": "DoliCloud",
      "url": "https://www.dolicloud.com/fr/fr-faq-pricing.php",
      "tax": "HT",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E06",
      "brand": "Synchroteam",
      "url": "https://www.synchroteam.fr/tarif.php",
      "tax": "unknown",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E07",
      "brand": "Falinwa · France",
      "url": "https://www.falinwa.com/pricing",
      "tax": "unknown",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E08",
      "brand": "Malt · Fullstack",
      "url": "https://www.malt.fr/t/barometre-tarifs/tech/developpeur-backend/developpeur-fullstack",
      "tax": "unknown",
      "verifiedAt": "2026-10-16"
    },
    {
      "id": "E09",
      "brand": "Ministère de l’Économie",
      "url": "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mes-autres-impots-et-taxes/tva-quels-sont-les-taux-de-votre-quotidien",
      "tax": "n/a",
      "verifiedAt": "2026-10-16"
    }
  ],
  "effort": {
    "1": [
      3,
      5
    ],
    "2": [
      5,
      8
    ],
    "3": [
      2,
      3
    ],
    "4": [
      3,
      5
    ],
    "5": [
      6,
      10
    ],
    "6": [
      2,
      4
    ],
    "7": [
      3,
      5
    ],
    "8": [
      5,
      8
    ],
    "9": [
      3,
      5
    ],
    "10": [
      4,
      7
    ],
    "11": [
      2,
      4
    ],
    "12": [
      6,
      9
    ],
    "13": [
      3,
      4
    ],
    "14": [
      5,
      8
    ],
    "15": [
      2,
      4
    ],
    "16": [
      2,
      3
    ],
    "17": [
      4,
      6
    ],
    "18": [
      5,
      9
    ],
    "19": [
      6,
      10
    ],
    "20": [
      3,
      5
    ],
    "21": [
      2,
      3
    ],
    "22": [
      2,
      4
    ],
    "23": [
      3,
      5
    ],
    "24": [
      5,
      8
    ],
    "25": [
      2,
      4
    ],
    "26": [
      2,
      4
    ],
    "27": [
      2,
      4
    ],
    "28": [
      4,
      6
    ],
    "29": [
      2,
      3
    ],
    "30": [
      4,
      7
    ]
  },
  "assumptions": {
    "rateLow": 500,
    "rateHigh": 700,
    "sharedDaysLow": 18,
    "sharedDaysHigh": 30,
    "origin": "新拆分的人日估算，汇总保持原文件的 120—200 人日；不是官网逐模块报价。"
  }
};
