export interface PrayerTime {
  day: number;
  saharlik: string;
  iftorlik: string;
}

export interface Region {
  name: string;
  districts: string[];
}

export const regions: Region[] = [
  {
    name: "Toshkent shahri",
    districts: [
      "Bektemir",
      "Chilonzor",
      "Yashnobod",
      "Uchtepa",
      "Mirobod",
      "Mirzo Ulug'bek",
      "Olmazor",
      "Sergeli",
      "Shayxontohur",
      "Yakkasaroy",
      "Yunusobod",
      "Yangihayot",
    ],
  },
  {
    name: "Toshkent viloyati",
    districts: [
      "Angren",
      "Olmaliq",
      "Chirchiq",
      "Bekobod",
      "Nurafshon",
      "Ohangaron",
      "Bo'stonliq",
      "Bo'ka",
      "Chinoz",
      "Oqqo'rg'on",
      "Parkent",
      "Piskent",
      "Qibray",
      "Quyichirchiq",
      "O'rtachirchiq",
      "Yangiyo'l",
      "Yuqorichirchiq",
      "Zangiota",
      "Toshkent",
    ],
  },
  {
    name: "Samarqand",
    districts: [
      "Bulung'ur",
      "Ishtixon",
      "Jomboy",
      "Kattaqo'rg'on",
      "Narpay",
      "Nurobod",
      "Oqdaryo",
      "Pastdarg'om",
      "Paxtachi",
      "Poyariq",
      "Qo'shrabot",
      "Samarqand",
      "Toyloq",
      "Urgut",
    ],
  },
  {
    name: "Buxoro",
    districts: [
      "Buxoro",
      "G'ijduvon",
      "Jondor",
      "Kogon",
      "Olot",
      "Peshku",
      "Qorako'l",
      "Qorovulbozor",
      "Romitan",
      "Shofirkon",
      "Vobkent",
    ],
  },
  {
    name: "Farg'ona",
    districts: [
      "Bag'dod",
      "Beshariq",
      "Buvayda",
      "Dang'ara",
      "Farg'ona",
      "Furqat",
      "Qo'shtepa",
      "Oltiariq",
      "Rishton",
      "So'x",
      "Toshloq",
      "Uchko'prik",
      "O'zbekiston",
      "Yozyovon",
      "Quva",
      "Marg'ilon",
      "Quvasoy",
      "Qo'qon",
    ],
  },
  {
    name: "Andijon",
    districts: [
      "Andijon",
      "Asaka",
      "Baliqchi",
      "Bo'ston",
      "Buloqboshi",
      "Izboskan",
      "Jalaquduq",
      "Marhamat",
      "Oltinko'l",
      "Paxtaobod",
      "Shahrixon",
      "Ulug'nor",
      "Xo'jaobod",
      "Qo'rg'ontepa",
      "Xonobod",
    ],
  },
  {
    name: "Namangan",
    districts: [
      "Chortoq",
      "Chust",
      "Kosonsoy",
      "Mingbuloq",
      "Namangan",
      "Norin",
      "Pop",
      "To'raqo'rg'on",
      "Uchqo'rg'on",
      "Uychi",
      "Yangiqo'rg'on",
      "Davlatobod",
    ],
  },
  {
    name: "Xorazm",
    districts: [
      "Bog'ot",
      "Gurlan",
      "Qo'shko'pir",
      "Shovot",
      "Tuproqqal'a",
      "Urganch",
      "Xazorasp",
      "Xiva",
      "Xonqa",
      "Yangiariq",
      "Yangibozor",
    ],
  },
  {
    name: "Qashqadaryo",
    districts: [
      "Chiroqchi",
      "Dehqonobod",
      "G'uzor",
      "Kasbi",
      "Kitob",
      "Ko'kdala",
      "Koson",
      "Mirishkor",
      "Muborak",
      "Nishon",
      "Qarshi",
      "Qamashi",
      "Shahrisabz",
      "Yakkabog'",
    ],
  },
  {
    name: "Surxondaryo",
    districts: [
      "Angor",
      "Bandixon",
      "Boysun",
      "Denov",
      "Jarqo'rg'on",
      "Muzrabot",
      "Oltinsoy",
      "Qiziriq",
      "Qumqo'rg'on",
      "Sherobod",
      "Sho'rchi",
      "Termiz",
      "Uzun",
      "Sariosiyo",
    ],
  },
  {
    name: "Navoiy",
    districts: ["Karmana", "Konimex", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi"],
  },
  {
    name: "Jizzax",
    districts: [
      "Arnasoy",
      "Baxmal",
      "Do'stlik",
      "Forish",
      "G'allaorol",
      "Sharof Rashidov",
      "Mirzacho'l",
      "Paxtakor",
      "Yangiobod",
      "Zafarobod",
      "Zamin",
      "Zarbdor",
    ],
  },
  {
    name: "Sirdaryo",
    districts: ["Boyovut", "Guliston", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Sirdaryo", "Xovos"],
  },
  {
    name: "Qoraqalpog'iston",
    districts: [
      "Amudaryo",
      "Beruniy",
      "Bo'zatov",
      "Ellikqala",
      "Kegeyli",
      "Mo'ynoq",
      "Nukus",
      "Qanliko'l",
      "Qorao'zak",
      "Qo'ng'irot",
      "Shumanay",
      "Taxtako'pir",
      "To'rtko'l",
      "Xo'jayli",
      "Taxiatosh",
      "Chimboy",
    ],
  },
];

// Ramazon 2026 prayer times for Toshkent (approximate, based on typical data)
// In a real app, these would come from an API
export const generatePrayerTimes = (regionName: string): PrayerTime[] => {
  // Base times for Toshkent, with slight offsets for other regions
  const offsets: Record<string, number> = {
    "Toshkent shahri": 0,
    "Toshkent viloyati": 0,
    "Samarqand": 5,
    "Buxoro": 10,
    "Farg'ona": -8,
    "Andijon": -10,
    "Namangan": -7,
    "Xorazm": 15,
    "Qashqadaryo": 7,
    "Surxondaryo": 3,
    "Navoiy": 12,
    "Jizzax": 3,
    "Sirdaryo": -2,
    "Qoraqalpog'iston": 18,
  };

  const offset = offsets[regionName] || 0;

  const baseTimes: PrayerTime[] = [];
  // Generate 30 days of Ramadan
  const saharlikBase = { hours: 5, minutes: 15 };
  const iftorlikBase = { hours: 18, minutes: 25 };

  for (let day = 1; day <= 30; day++) {
    const saharlikMinutes = saharlikBase.hours * 60 + saharlikBase.minutes - Math.floor(day * 0.7) + offset;
    const iftorlikMinutes = iftorlikBase.hours * 60 + iftorlikBase.minutes + Math.floor(day * 0.8) + offset;

    const sH = Math.floor(saharlikMinutes / 60);
    const sM = saharlikMinutes % 60;
    const iH = Math.floor(iftorlikMinutes / 60);
    const iM = iftorlikMinutes % 60;

    baseTimes.push({
      day,
      saharlik: `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")}`,
      iftorlik: `${String(iH).padStart(2, "0")}:${String(iM).padStart(2, "0")}`,
    });
  }

  return baseTimes;
};

export const duas = {
  saharlik: {
    arabic: "نَوَيْتُ أَنْ أَصُومَ صَوْمَ شَهْرِ رَمَضَانَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ خَالِصًا لِلَّهِ تَعَالَى",
    uzbek: "Navaytu an asuma savma shahri ramazona minal fajri ilal mag'ribi xolisan lillahi taala",
    meaning: "Ramazon oyining ro'zasini subhdan to kechgacha tutmoqni niyat qildim. Xolis Alloh taolo uchun.",
  },
  iftorlik: {
    arabic: "اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    uzbek: "Allohumma laka sumtu va bika amantu va alayaka tavakkaltu va ala rizqika aftartu",
    meaning: "Ey Alloh, Sen uchun ro'za tutdim, Senga iymon keltirdim, Senga tavakkal qildim va bergan rizqing bilan og'iz ochdim.",
  },
};

export const dailyHadiths = [
  "«Kim Ramazon oyida iymon bilan va savobini umid qilib ro'za tutsa, uning oldingi gunohlari kechiriladi.» (Buxoriy)",
  "«Ro'za tutuvchining ikkita quvonchi bor: og'iz ochgandagi quvonchi va Rabbiga yuz tutgandagi quvonchi.» (Muslim)",
  "«Jannatda Rayyón degan eshik bor. Qiyomat kuni undan faqat ro'za tutuvchilar kiradi.» (Buxoriy)",
  "«Kim Ramazonda bir ro'za tutuvchiga iftor bersa, uning gunohlari kechiriladi.» (Ibn Mojar)",
  "«Ro'za — qalqondir. Ro'za tutuvchi behuda so'z aytmasin va johillik qilmasin.» (Buxoriy)",
  "«Alloh taolo aytadi: Ro'za Men uchundir va uning mukofotini O'zim beraman.» (Buxoriy)",
  "«Saharlik qiling, chunki saharlikda baraka bor.» (Buxoriy, Muslim)",
  "«Iftorni tezlating va saharlikni kechiktiring.» (Ahmad)",
  "«Ramazon — sabr oyidir, sabrning mukofoti esa — Jannatdir.» (Ibn Xuзayma)",
  "«Kim Ramazon kechalarida iymon bilan ibodat qilsa, oldingi gunohlari kechiriladi.» (Buxoriy)",
  "«Ramazon kelganda, Jannat eshiklari ochiladi, do'zax eshiklari yopiladi.» (Buxoriy)",
  "«Eng yaxshi sadaqa — Ramazon oyidagi sadaqadir.» (Termiziy)",
  "«Ro'za tutuvchining duosi rad etilmaydi.» (Bayhaqiy)",
  "«Bir vaqtning taomi ikki vaqtga yetadi, ikki vaqtniki to'rt vaqtga yetadi.» (Termiziy)",
  "«Ramazon — Qur'on oyi, uni ko'p o'qing.» (Buxoriy)",
  "«Kim Laylatul Qadrda iymon bilan ibodat qilsa, oldingi gunohlari kechiriladi.» (Buxoriy)",
  "«Ramazonning oxirgi o'n kunida e'tikof o'tiring.» (Buxoriy)",
  "«Alloh taolo ro'za tutuvchining og'iz hidini mushk hididan afzal ko'radi.» (Buxoriy)",
  "«Ro'za va Qur'on qiyomat kuni banda uchun shafoat qiladi.» (Ahmad)",
  "«Ramazon — rahmat, mag'firat va do'zaxdan ozodlik oyidir.» (Bayhaqiy)",
  "«Kim Ramazonda biror yomonlikni tark etsa, Alloh uni jannatga kiritadi.» (Tabaroniy)",
  "«Uch kishining duosi rad bo'lmaydi: ro'za tutuvchi, odil hukmdor va mazlum.» (Ahmad)",
  "«Umra — Ramazonda haj savobiga tengdir.» (Buxoriy)",
  "«Ramazon — tavba va istig'for oyidir.» (Bayhaqiy)",
  "«Besh vaqt namoz, bir Ramazondan keyingi Ramazon — oradagi gunohlarning kafforatidir.» (Muslim)",
  "«Ramazon oyida qo'lingizdan kelgancha yaxshilik qiling.» (Nasaiy)",
  "«Ro'zador uchun iftor vaqtida ijobat bo'ladigan duo bor.» (Ibn Mojar)",
  "«Kim Ramazonda o'zini yomon so'z va amaldan tiysa, Allohning uning ovqat-ichimligini tark etishiga ehtiyoji yo'q.» (Buxoriy)",
  "«Ramazon tugaganda, olti kun Shavvol ro'zasi tutgan kishi butun yil ro'za tutgandek bo'ladi.» (Muslim)",
  "«Ramazon — imtihon oyidir. Uni g'animat biling!» (Bayhaqiy)",
];
