
import { Difficulty, Course } from './types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Basics of English',
    nameBn: 'ইংরেজির প্রাথমিক জ্ঞান',
    difficulty: Difficulty.BEGINNER,
    description: 'Learn fundamental English grammar and common words.',
    descriptionBn: 'ইংরেজি গ্রামার এবং সাধারণ শব্দের প্রাথমিক জ্ঞান শিখুন।',
    thumbnail: 'https://picsum.photos/seed/learn1/400/250',
    published: true,
    lessons: [
      {
        id: 'l1',
        title: 'Alphabet and Sounds',
        titleBn: 'বর্ণমালা এবং ধ্বনি',
        description: 'Introduction to English letters and phonetics.',
        descriptionBn: 'ইংরেজি বর্ণমালা এবং ধ্বনিবিজ্ঞানের ভূমিকা।',
        content: 'English has 26 letters. Understanding phonetics helps in correct pronunciation.',
        contentBn: 'ইংরেজিতে ২৬টি বর্ণ রয়েছে। ধ্বনিবিজ্ঞান বুঝলে সঠিক উচ্চারণে সাহায্য করে।',
        type: 'grammar',
        examples: [
          { en: 'Apple', bn: 'আপেল' },
          { en: 'Ball', bn: 'বল' }
        ],
        quiz: [
          {
            id: 'q1',
            question: 'How many letters are in the English alphabet?',
            options: ['24', '25', '26', '28'],
            correctAnswer: 2
          }
        ]
      },
      {
        id: 'l2',
        title: 'Simple Greetings',
        titleBn: 'সহজ সম্ভাষণ',
        description: 'How to greet people in English.',
        descriptionBn: 'ইংরেজিতে মানুষকে কীভাবে সম্ভাষণ করতে হয়।',
        content: 'Greetings are the first step to communication.',
        contentBn: 'সমাষণ হলো যোগাযোগের প্রথম ধাপ।',
        type: 'speaking',
        examples: [
          { en: 'Hello, how are you?', bn: 'হ্যালো, আপনি কেমন আছেন?' },
          { en: 'Good morning!', bn: 'শুভ সকাল!' }
        ]
      }
    ]
  },
  {
    id: 'c2',
    name: 'Spoken English Mastery',
    nameBn: 'স্পোকেন ইংলিশ মাস্টারি',
    difficulty: Difficulty.INTERMEDIATE,
    description: 'Improve your fluency and daily conversation skills.',
    descriptionBn: 'আপনার সাবলীলতা এবং দৈনন্দিন কথোপকথনের দক্ষতা উন্নত করুন।',
    thumbnail: 'https://picsum.photos/seed/learn2/400/250',
    published: true,
    lessons: []
  },
  {
    id: 'c3',
    name: 'Advanced Grammar & Writing',
    nameBn: 'অ্যাডভান্সড গ্রামার এবং রাইটিং',
    difficulty: Difficulty.ADVANCED,
    description: 'Master complex sentence structures and academic writing.',
    descriptionBn: 'জটিল বাক্য গঠন এবং একাডেমিক রাইটিংয়ে দক্ষতা অর্জন করুন।',
    thumbnail: 'https://picsum.photos/seed/learn3/400/250',
    published: false,
    lessons: []
  }
];
