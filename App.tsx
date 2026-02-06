
import React, { useState, useEffect } from 'react';
import { MOCK_COURSES } from './constants';
import { Course, Lesson, Difficulty, SiteSettings } from './types';
import { getDailyWord, getSentenceCorrection, playPronunciation } from './services/geminiService';

// --- Sub-components ---

const Header: React.FC<{ 
  onViewChange: (view: string) => void, 
  onAdminToggle: () => void,
  siteName: string 
}> = ({ onViewChange, onAdminToggle, siteName }) => (
  <header className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-container mx-auto px-4 py-4 flex justify-between items-center">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => onViewChange('home')}
      >
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">{siteName}</h1>
      </div>
      <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
        <button onClick={() => onViewChange('home')} className="hover:text-blue-600">মূলপাতা</button>
        <button onClick={() => onViewChange('courses')} className="hover:text-blue-600">কোর্সসমূহ</button>
        <button onClick={() => onViewChange('practice')} className="hover:text-blue-600">প্র্যাকটিস</button>
        <button onClick={onAdminToggle} className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 transition">
          <i className="fas fa-user-shield mr-1"></i> এডমিন
        </button>
      </nav>
      <div className="flex gap-4 items-center">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition">লগইন</button>
      </div>
    </div>
  </header>
);

const Hero: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <section className="bg-blue-600 py-16 md:py-24 text-white">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">বাংলায় ইংরেজি শিখুন খুব সহজেই</h2>
      <p className="text-lg md:text-xl mb-10 text-blue-100">আজ থেকেই আত্মবিশ্বাসের সাথে ইংরেজি বলা শুরু করুন। আমাদের বিশেষজ্ঞ নির্দেশনার মাধ্যমে আপনি দ্রুত শিখতে পারবেন।</p>
      <button 
        onClick={onStart}
        className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
      >
        ফ্রিতে শেখা শুরু করুন
      </button>
    </div>
  </section>
);

const Footer: React.FC<{ settings: SiteSettings }> = ({ settings }) => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">{settings.siteName}</h3>
        <p className="text-sm">একটি আধুনিক ইংরেজি শিক্ষা প্ল্যাটফর্ম যা বাংলা ভাষাভাষীদের জন্য বিশেষভাবে তৈরি।</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">লিঙ্ক</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-white">আমাদের সম্পর্কে</a></li>
          <li><a href="#" className="hover:text-white">গোপনীয়তা নীতি</a></li>
          <li><a href="#" className="hover:text-white">ব্যবহারের শর্তাবলী</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">যোগাযোগ</h4>
        <p className="text-sm">ইমেইল: {settings.contactEmail}</p>
        <div className="flex gap-4 mt-4 justify-center md:justify-start">
          <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer"><i className="fab fa-facebook"></i></a>
          <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer"><i className="fab fa-youtube"></i></a>
          <i className="fab fa-twitter hover:text-white cursor-pointer"></i>
        </div>
      </div>
    </div>
    <div className="text-center mt-12 text-xs border-t border-gray-800 pt-8">
      © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<string>('home');
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  
  // Admin Course Edit State
  const [isEditingCourse, setIsEditingCourse] = useState<boolean>(false);
  const [currentEditCourse, setCurrentEditCourse] = useState<Partial<Course>>({});

  // Site Settings
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'সহজ ইংরেজি শিক্ষা',
    contactEmail: 'info@easyenglish.bd',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    adminPin: '1234'
  });

  const [dailyWord, setDailyWord] = useState<any>(null);
  const [correctionInput, setCorrectionInput] = useState('');
  const [correctionResult, setCorrectionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadDaily() {
      try {
        const word = await getDailyWord();
        setDailyWord(word);
      } catch (e) {
        console.error("Daily word error", e);
      }
    }
    loadDaily();
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === settings.adminPin) {
      setIsAdminAuthenticated(true);
      setAdminPinInput('');
    } else {
      alert("ভুল পিন! আবার চেষ্টা করুন।");
      setAdminPinInput('');
    }
  };

  const handleCorrection = async () => {
    if (!correctionInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await getSentenceCorrection(correctionInput);
      setCorrectionResult(res);
    } catch (e) {
      alert("Error generating correction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  // Course Management Logic
  const openEditCourse = (course?: Course) => {
    if (course) {
      setCurrentEditCourse({ ...course });
    } else {
      setCurrentEditCourse({
        id: `c${Date.now()}`,
        name: '',
        nameBn: '',
        difficulty: Difficulty.BEGINNER,
        description: '',
        descriptionBn: '',
        thumbnail: 'https://picsum.photos/seed/' + Date.now() + '/400/250',
        published: false,
        lessons: []
      });
    }
    setIsEditingCourse(true);
  };

  const handleSaveCourse = () => {
    if (!currentEditCourse.nameBn || !currentEditCourse.name) {
      alert("নাম প্রদান করুন!");
      return;
    }
    const exists = courses.find(c => c.id === currentEditCourse.id);
    if (exists) {
      setCourses(courses.map(c => c.id === currentEditCourse.id ? (currentEditCourse as Course) : c));
    } else {
      setCourses([...courses, currentEditCourse as Course]);
    }
    setIsEditingCourse(false);
    setCurrentEditCourse({});
  };

  const togglePublishCourse = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, published: !c.published } : c));
  };

  const deleteCourse = (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই কোর্সটি মুছে ফেলতে চান?")) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const renderHome = () => {
    const publishedCourses = courses.filter(c => c.published);
    const firstCourse = publishedCourses.length > 0 ? publishedCourses[0] : null;

    return (
      <div className="animate-fade-in">
        <Hero onStart={() => setView('courses')} />
        
        <div className="max-container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">
                  <i className="fas fa-star"></i>
                </span>
                জনপ্রিয় লেসনসমূহ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {firstCourse ? firstCourse.lessons.slice(0, 4).map(l => (
                  <div key={l.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition cursor-pointer" onClick={() => { setSelectedCourse(firstCourse); setSelectedLesson(l); setView('lesson'); }}>
                    <span className="text-xs font-bold text-blue-500 uppercase">{l.type}</span>
                    <h4 className="font-bold text-lg mt-1">{l.titleBn}</h4>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{l.descriptionBn}</p>
                  </div>
                )) : (
                  <p className="text-gray-400 italic">এখনও কোনো প্রকাশিত কোর্স নেই।</p>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 h-fit">
              <h3 className="text-xl font-bold mb-4 text-blue-600">আজকের শব্দ (Daily Word)</h3>
              {dailyWord ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-3xl font-black text-gray-800">{dailyWord.word}</h4>
                    <button onClick={() => playPronunciation(dailyWord.word)} className="bg-blue-50 text-blue-600 w-10 h-10 rounded-full hover:bg-blue-100 transition">
                      <i className="fas fa-volume-up"></i>
                    </button>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">অর্থ: {dailyWord.meaningBn}</p>
                  <div className="bg-gray-50 p-4 rounded-lg italic text-gray-600 text-sm">
                    "{dailyWord.example}"
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex flex-col gap-4">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              )}
            </div>
          </div>

          <section className="mb-16">
            <h3 className="text-2xl font-bold mb-6">শিখুন ৪টি দক্ষতায়</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'fa-microphone', title: 'Speaking', color: 'bg-green-100 text-green-600' },
                { icon: 'fa-headphones', title: 'Listening', color: 'bg-purple-100 text-purple-600' },
                { icon: 'fa-pen-nib', title: 'Writing', color: 'bg-orange-100 text-orange-600' },
                { icon: 'fa-book-open', title: 'Reading', color: 'bg-blue-100 text-blue-600' }
              ].map(item => (
                <div key={item.title} className="bg-white p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition border border-gray-50">
                  <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl`}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <h5 className="font-bold">{item.title}</h5>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderCourses = () => (
    <div className="max-container mx-auto px-4 py-12 animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 text-center md:text-left">সব কোর্সসমূহ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses.filter(c => c.published).map(course => (
          <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition flex flex-col">
            <img src={course.thumbnail} alt={course.name} className="h-48 w-full object-cover" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  course.difficulty === Difficulty.BEGINNER ? 'bg-green-100 text-green-700' :
                  course.difficulty === Difficulty.INTERMEDIATE ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {course.difficulty}
                </span>
                <span className="text-gray-400 text-sm">{course.lessons.length} লেসন</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{course.nameBn}</h3>
              <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{course.descriptionBn}</p>
              <button 
                onClick={() => { setSelectedCourse(course); setView('course-details'); }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-auto"
              >
                কোর্স শুরু করুন
              </button>
            </div>
          </div>
        ))}
        {courses.filter(c => c.published).length === 0 && (
          <div className="col-span-full py-20 text-center">
            <i className="fas fa-folder-open text-gray-200 text-6xl mb-4"></i>
            <p className="text-gray-500 font-bold">দুঃখিত, বর্তমানে কোনো কোর্স পাওয়া যায়নি।</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCourseDetails = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <button onClick={() => setView('courses')} className="text-blue-600 font-medium mb-6 flex items-center gap-2">
        <i className="fas fa-arrow-left"></i> কোর্সে ফিরে যান
      </button>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-3xl font-bold mb-2">{selectedCourse?.nameBn}</h2>
        <p className="text-gray-600 mb-6">{selectedCourse?.descriptionBn}</p>
        <div className="h-2 bg-gray-100 rounded-full mb-8">
          <div className="h-full bg-blue-600 rounded-full w-[15%]"></div>
        </div>
        <h3 className="font-bold text-xl mb-6">লেসনসমূহ:</h3>
        <div className="space-y-4">
          {selectedCourse?.lessons.map((lesson, idx) => (
            <div 
              key={lesson.id} 
              className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 cursor-pointer transition border border-transparent hover:border-blue-200"
              onClick={() => { setSelectedLesson(lesson); setView('lesson'); }}
            >
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold">{lesson.titleBn}</h4>
                  <p className="text-xs text-gray-500 uppercase">{lesson.type}</p>
                </div>
              </div>
              <i className="fas fa-play-circle text-blue-600 text-2xl"></i>
            </div>
          ))}
          {!selectedCourse?.lessons.length && <p className="text-gray-400 italic">এই কোর্সে শীঘ্রই লেসন যোগ করা হবে।</p>}
        </div>
      </div>
    </div>
  );

  const renderLesson = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <button onClick={() => setView('course-details')} className="text-blue-600 font-medium mb-6 flex items-center gap-2">
        <i className="fas fa-arrow-left"></i> লিস্টে ফিরে যান
      </button>
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{selectedLesson?.type}</span>
            <h2 className="text-3xl font-bold mt-1">{selectedLesson?.titleBn}</h2>
          </div>
          <button onClick={() => playPronunciation(selectedLesson?.title || '')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 shadow-md">
            <i className="fas fa-volume-up"></i>
            উচ্চারণ শুনুন
          </button>
        </div>

        <div className="prose prose-blue max-w-none">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8">
            <h4 className="font-bold text-blue-800 mb-2">ব্যাখ্যা (Explanation):</h4>
            <p className="text-gray-700 leading-relaxed">{selectedLesson?.contentBn}</p>
          </div>

          <h3 className="text-xl font-bold mb-4">উদাহরণসমূহ (Examples):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {selectedLesson?.examples.map((ex, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <p className="text-blue-600 font-bold text-lg mb-1">{ex.en}</p>
                  <button onClick={() => playPronunciation(ex.en)} className="text-gray-400 hover:text-blue-600">
                    <i className="fas fa-volume-up"></i>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">{ex.bn}</p>
              </div>
            ))}
          </div>

          {selectedLesson?.quiz && (
            <div className="mt-12 p-8 bg-gray-900 text-white rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-puzzle-piece text-yellow-400"></i>
                কুইজ (Quick Quiz)
              </h3>
              {selectedLesson.quiz.map(q => (
                <div key={q.id}>
                  <p className="text-lg mb-6">{q.question}</p>
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, i) => (
                      <button key={i} className="text-left p-4 rounded-xl border border-gray-700 hover:bg-gray-800 transition">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
          <button className="text-gray-400 font-bold hover:text-gray-600 flex items-center gap-2">
            <i className="fas fa-chevron-left"></i> পূর্ববর্তী
          </button>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">
            পরবর্তী লেসন <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">AI প্র্যাকটিস পার্টনার</h2>
        <p className="text-gray-600">আপনার ইংরেজি বাক্য লিখুন, AI আপনার ভুল সংশোধন করে দিবে এবং কারণ বুঝিয়ে দিবে।</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <label className="block text-gray-700 font-bold mb-4">আপনার বাক্যটি এখানে লিখুন:</label>
        <div className="relative">
          <textarea 
            value={correctionInput}
            onChange={(e) => setCorrectionInput(e.target.value)}
            className="w-full h-40 p-6 rounded-2xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none resize-none"
            placeholder="উদাহরণ: I am go to school yesterday."
          ></textarea>
          <button 
            onClick={handleCorrection}
            disabled={isLoading || !correctionInput.trim()}
            className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-lg"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
            চেক করুন
          </button>
        </div>

        {correctionResult && (
          <div className="mt-8 animate-fade-in">
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl mb-4">
              <h4 className="text-green-800 font-bold text-sm uppercase tracking-wider mb-2">সঠিক বাক্য (Corrected):</h4>
              <p className="text-green-900 text-xl font-bold mb-2">{correctionResult.correctedSentence}</p>
              <button onClick={() => playPronunciation(correctionResult.correctedSentence)} className="text-green-600 hover:text-green-700">
                <i className="fas fa-volume-up mr-1"></i> উচ্চারণ শুনুন
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
              <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wider mb-2">ব্যাখ্যা (Explanation):</h4>
              <p className="text-blue-900">{correctionResult.explanationBn}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminAuth = () => (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          <i className="fas fa-lock"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2">এডমিন অ্যাক্সেস</h2>
        <p className="text-gray-500 mb-6 text-sm">প্রবেশ করার জন্য ৪ ডিজিটের সিকিউরিটি পিন দিন।</p>
        <form onSubmit={handleAdminAuth}>
          <input 
            type="password" 
            maxLength={4}
            value={adminPinInput}
            onChange={(e) => setAdminPinInput(e.target.value)}
            className="w-full text-center text-3xl tracking-[1rem] py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-0 outline-none mb-6"
            placeholder="****"
            autoFocus
          />
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition"
            >
              বাতিল
            </button>
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
            >
              প্রবেশ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'মোট ইউজার', value: '১,২৫০', icon: 'fa-users', color: 'text-blue-600' },
          { label: 'সক্রিয় ইউজার', value: '৪৫০', icon: 'fa-chart-line', color: 'text-green-600' },
          { label: 'মোট কোর্স', value: String(courses.length), icon: 'fa-book', color: 'text-purple-600' },
          { label: 'ভিসিটর (আজ)', value: '১২৪', icon: 'fa-eye', color: 'text-orange-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <i className={`fas ${stat.icon} ${stat.color} text-2xl mb-4`}></i>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <h4 className="text-2xl font-bold">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-gray-800 text-lg">কোর্স কমপ্লিশন রেট (Course Completion Rate)</h4>
            <span className="text-blue-600 font-bold">৬৮%</span>
          </div>
          <div className="space-y-6">
            {courses.slice(0, 3).map((c, i) => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">{c.name}</span>
                  <span className="font-bold">{[85, 52, 28][i] || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${['bg-green-500', 'bg-blue-500', 'bg-orange-500'][i]}`} style={{ width: `${[85, 52, 28][i] || 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-gray-800 text-lg">ইউজার রিটেনশন রেট (User Retention Rate)</h4>
            <span className="text-purple-600 font-bold">৭৪%</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {[45, 60, 55, 80, 75, 90, 74].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${i === 6 ? 'bg-purple-600' : 'bg-purple-100'}`}
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6 italic">* গত ৭ দিনের সক্রিয় ইউজারদের গাণিতিক হার।</p>
        </div>
      </div>
    </div>
  );

  const renderAdminCourses = () => (
    <div className="animate-fade-in">
      {isEditingCourse ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">{currentEditCourse.id ? 'কোর্স এডিট করুন' : 'নতুন কোর্স যোগ করুন'}</h3>
            <button onClick={() => setIsEditingCourse(false)} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">কোর্স নাম (English)</label>
                <input 
                  type="text" 
                  value={currentEditCourse.name || ''}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, name: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none"
                  placeholder="e.g. Master Spoken English"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">কোর্স নাম (Bengali)</label>
                <input 
                  type="text" 
                  value={currentEditCourse.nameBn || ''}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, nameBn: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none"
                  placeholder="যেমন: স্পোকেন ইংলিশ শিখুন"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ডিফিকাল্টি লেভেল</label>
                <select 
                  value={currentEditCourse.difficulty}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, difficulty: e.target.value as Difficulty})}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none"
                >
                  <option value={Difficulty.BEGINNER}>Beginner (প্রাথমিক)</option>
                  <option value={Difficulty.INTERMEDIATE}>Intermediate (মধ্যবর্তী)</option>
                  <option value={Difficulty.ADVANCED}>Advanced (উন্নত)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">থাম্বনেইল URL</label>
                <input 
                  type="text" 
                  value={currentEditCourse.thumbnail || ''}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, thumbnail: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বিবরণ (English)</label>
                <textarea 
                  value={currentEditCourse.description || ''}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, description: e.target.value})}
                  className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বিবরণ (Bengali)</label>
                <textarea 
                  value={currentEditCourse.descriptionBn || ''}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, descriptionBn: e.target.value})}
                  className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="publishedCheck"
                  checked={currentEditCourse.published || false}
                  onChange={e => setCurrentEditCourse({...currentEditCourse, published: e.target.checked})}
                  className="w-5 h-5 accent-blue-600"
                />
                <label htmlFor="publishedCheck" className="text-sm font-bold text-gray-700 cursor-pointer">কোর্সটি প্রকাশ করুন (Publish)</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button 
              onClick={() => setIsEditingCourse(false)}
              className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              বাতিল
            </button>
            <button 
              onClick={handleSaveCourse}
              className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition"
            >
              সেভ করুন
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">কোর্স লিস্ট</h3>
            <button onClick={() => openEditCourse()} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700">+ নতুন কোর্স</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 font-bold text-gray-400 text-sm uppercase">থাম্বনেইল</th>
                  <th className="pb-4 font-bold text-gray-400 text-sm uppercase">নাম</th>
                  <th className="pb-4 font-bold text-gray-400 text-sm uppercase">লেভেল</th>
                  <th className="pb-4 font-bold text-gray-400 text-sm uppercase">স্ট্যাটাস</th>
                  <th className="pb-4 font-bold text-gray-400 text-sm uppercase">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map(c => (
                  <tr key={c.id}>
                    <td className="py-4">
                      <img src={c.thumbnail} className="w-12 h-12 rounded-lg object-cover" alt="thumb" />
                    </td>
                    <td className="py-4 font-bold">{c.nameBn}</td>
                    <td className="py-4">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-medium">{c.difficulty}</span>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => togglePublishCourse(c.id)}
                        className={`text-xs px-2 py-1 rounded-full font-bold transition ${c.published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {c.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-4 text-gray-400">
                        <button onClick={() => openEditCourse(c)} className="hover:text-blue-600"><i className="fas fa-edit"></i></button>
                        <button onClick={() => deleteCourse(c.id)} className="hover:text-red-600"><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">কোনো কোর্স পাওয়া যায়নি। নতুন কোর্স যোগ করুন।</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderAdminSettings = () => (
    <div className="animate-fade-in max-w-2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট নাম (Site Name)</label>
          <input 
            type="text" 
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">কন্টাক্ট ইমেইল (Contact Email)</label>
          <input 
            type="email" 
            value={settings.contactEmail}
            onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ফেসবুক লিঙ্ক</label>
            <input 
              type="text" 
              value={settings.facebookUrl}
              onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ইউটিউব লিঙ্ক</label>
            <input 
              type="text" 
              value={settings.youtubeUrl}
              onChange={(e) => setSettings({...settings, youtubeUrl: e.target.value})}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none" 
            />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">সিকিউরিটি পিন পরিবর্তন (Admin PIN)</label>
          <input 
            type="text" 
            maxLength={4}
            value={settings.adminPin}
            onChange={(e) => setSettings({...settings, adminPin: e.target.value})}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none max-w-[150px] text-center font-mono text-xl" 
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition duration-300 ${
              saveSuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <><i className="fas fa-spinner fa-spin"></i> সেভ হচ্ছে...</>
            ) : saveSuccess ? (
              <><i className="fas fa-check"></i> সেভ হয়েছে!</>
            ) : (
              'সব পরিবর্তন সেভ করুন'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="min-h-screen bg-gray-100 pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-800">অ্যাডমিন প্যানেল</h2>
            <p className="text-gray-500">স্বাগতম, আপনি এখন ওয়েবসাইটটি কন্ট্রোল করতে পারছেন।</p>
          </div>
          <button 
            onClick={() => { setIsAdminMode(false); setIsAdminAuthenticated(false); }}
            className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold shadow-sm border border-red-50 hover:bg-red-50 transition"
          >
            লগ আউট
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50">
            {[
              { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: 'fa-chart-pie' },
              { id: 'courses', label: 'কোর্সসমূহ', icon: 'fa-book' },
              { id: 'settings', label: 'সেটিংস', icon: 'fa-cog' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-5 font-bold transition whitespace-nowrap ${adminTab === tab.id ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 flex-grow">
            {adminTab === 'dashboard' && renderAdminDashboard()}
            {adminTab === 'courses' && renderAdminCourses()}
            {adminTab === 'settings' && renderAdminSettings()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-['Hind_Siliguri',sans-serif]">
      {!isAdminMode && (
        <Header 
          onViewChange={(v) => { setView(v); setSelectedCourse(null); setSelectedLesson(null); }} 
          onAdminToggle={() => setIsAdminMode(true)}
          siteName={settings.siteName}
        />
      )}
      
      <main className="flex-grow">
        {isAdminMode ? (
          isAdminAuthenticated ? renderAdmin() : renderAdminAuth()
        ) : (
          <>
            {view === 'home' && renderHome()}
            {view === 'courses' && renderCourses()}
            {view === 'course-details' && renderCourseDetails()}
            {view === 'lesson' && renderLesson()}
            {view === 'practice' && renderPractice()}
          </>
        )}
      </main>

      {!isAdminMode && <Footer settings={settings} />}
      
      {/* Bottom Nav for Mobile User Experience */}
      {!isAdminMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
          <button onClick={() => setView('home')} className={`text-xl ${view === 'home' ? 'text-blue-600' : 'text-gray-400'}`}><i className="fas fa-home"></i></button>
          <button onClick={() => setView('courses')} className={`text-xl ${view === 'courses' || view === 'course-details' || view === 'lesson' ? 'text-blue-600' : 'text-gray-400'}`}><i className="fas fa-book-open"></i></button>
          <button onClick={() => setView('practice')} className={`text-xl ${view === 'practice' ? 'text-blue-600' : 'text-gray-400'}`}><i className="fas fa-magic"></i></button>
          <button onClick={() => setIsAdminMode(true)} className="text-xl text-gray-400"><i className="fas fa-cog"></i></button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .max-container { max-width: 1200px; }
        body { padding-bottom: 4rem; }
        @media (min-width: 768px) { body { padding-bottom: 0; } }
      `}</style>
    </div>
  );
}
