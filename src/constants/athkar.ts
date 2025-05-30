import type { Athkar } from '@/types';

export const DAILY_ATHKAR: Athkar[] = [
  {
    id: 'morning_1',
    text: 'Upon waking up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    category: 'Morning',
    completed: false,
  },
  {
    id: 'morning_2',
    text: 'Sayyidul Istighfar (Master of Seeking Forgiveness)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    category: 'Morning',
    count: 1,
    completed: false,
    completedCount: 0,
  },
  {
    id: 'morning_3',
    text: 'Praise and Glory to Allah',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',
    category: 'Morning',
    count: 3,
    completed: false,
    completedCount: 0,
  },
  {
    id: 'evening_1',
    text: 'Upon reaching evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    category: 'Evening',
    completed: false,
  },
  {
    id: 'evening_2',
    text: 'Seeking refuge in Allah\'s perfect words',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    category: 'Evening',
    count: 3,
    completed: false,
    completedCount: 0,
  },
  {
    id: 'general_1',
    text: 'Sending blessings upon the Prophet ﷺ',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    category: 'General',
    count: 10, // Example, can be done anytime
    completed: false,
    completedCount: 0,
  },
];
