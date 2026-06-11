import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, AlertCircle, Play, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import PaymentModal from '../components/PaymentModal';
import ProductReviews from '../components/ProductReviews';
import Markdown from 'react-markdown';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [viewingCourse, setViewingCourse] = useState<any | null>(null);
  const [showPaymentModalFor, setShowPaymentModalFor] = useState<any | null>(null);
  
  const [playingCourse, setPlayingCourse] = useState<any | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, 'products'), where('category', '==', 'Course'));
        const querySnapshot = await getDocs(q);
        const fetchedCourses: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() });
        });
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Error fetching courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchEnrollments = async () => {
        try {
          const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('itemType', '==', 'course'));
          const querySnapshot = await getDocs(q);
          const userEnrollments: any[] = [];
          querySnapshot.forEach((doc) => {
            userEnrollments.push({ id: doc.id, ...doc.data() });
          });
          setEnrollments(userEnrollments);
        } catch (err) {
            console.error("Error fetching enrollments", err);
        }
      };
      fetchEnrollments();
    } else {
      setEnrollments([]);
    }
  }, [user]);

  const handleEnrollClick = (course: any) => {
    const enrollment = enrollments.find(e => e.itemId === course.id);
    if (enrollment) {
       if (enrollment.status === 'approved') {
          setPlayingCourse(course);
          setActiveLessonIndex(0);
       } else {
          alert('Your payment is currently pending approval. Please wait for the admin to verify your proof.');
       }
    } else {
       setShowPaymentModalFor(course);
    }
  };

  const getYoutubeId = (url: string) => {
     if(!url) return null;
     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
     const match = url.match(regExp);
     return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 font-sans">
      
      {playingCourse ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row gap-8">
           <div className="w-full lg:w-3/4 flex flex-col gap-6">
              <button onClick={() => setPlayingCourse(null)} className="text-slate-400 hover:text-white font-bold uppercase text-sm tracking-wider flex items-center gap-2 self-start transition-colors">
                 &larr; Exit Course
              </button>
              
              <div className="bg-black aspect-video rounded-3xl overflow-hidden border border-slate-800 card-shadow relative">
                 {playingCourse.lessons?.[activeLessonIndex]?.videoLink ? (
                   getYoutubeId(playingCourse.lessons[activeLessonIndex].videoLink) ? (
                     <iframe src={`https://www.youtube.com/embed/${getYoutubeId(playingCourse.lessons[activeLessonIndex].videoLink)}`} className="w-full h-full border-0" allowFullScreen />
                   ) : (
                     <video src={playingCourse.lessons[activeLessonIndex].videoLink} controls className="w-full h-full object-cover"></video>
                   )
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                     <AlertCircle size={48} className="mb-4 opacity-50 text-red-500" />
                     <p>Course content not formatted correctly or video missing.</p>
                   </div>
                 )}
              </div>

              <div className="bg-slate-900 border border-slate-800 card-shadow rounded-3xl p-8">
                 <h2 className="text-3xl font-black text-white mb-4">{playingCourse.lessons?.[activeLessonIndex]?.title || 'Lesson Details'}</h2>
                 <div className="prose prose-invert prose-red max-w-none">
                   <Markdown>{playingCourse.lessons?.[activeLessonIndex]?.content || 'Take notes and follow along.'}</Markdown>
                 </div>
              </div>
           </div>

           <div className="w-full lg:w-1/4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24 card-shadow">
                 <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><BookOpen size={20} className="text-red-500" /> Curriculum</h3>
                 <div className="space-y-3">
                   {(playingCourse.lessons || []).map((lesson: any, i: number) => (
                      <button 
                         key={i}
                         onClick={() => setActiveLessonIndex(i)}
                         className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-4 ${
                            activeLessonIndex === i 
                            ? 'bg-red-600 border border-red-500 text-white shadow-lg shadow-red-500/20' 
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                         }`}
                      >
                         <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-black ${activeLessonIndex === i ? 'bg-white text-red-600' : 'bg-slate-900 text-slate-500'}`}>
                            {i + 1}
                         </div>
                         <div>
                            <div className="font-bold mb-1">{lesson.title}</div>
                            <div className={`text-xs ${activeLessonIndex === i ? 'text-red-100' : 'text-slate-600 font-medium'}`}>{lesson.duration}</div>
                         </div>
                      </button>
                   ))}
                   {(!playingCourse.lessons || playingCourse.lessons.length === 0) && (
                     <div className="text-slate-500 text-sm text-center py-4">No content uploaded yet.</div>
                   )}
                 </div>
              </div>
           </div>
        </motion.div>
      ) : !viewingCourse ? (
        <>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Premium Knowledge</span>
            <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4 text-white">
              YouTube Automation <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
              Learn step by step how to build, run, and scale a faceless YouTube empire. 
              Affordable and actionable.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center my-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center card-shadow">
              <AlertCircle className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2">No Courses Available</h3>
              <p className="text-slate-400">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map(course => {
                const enrollment = enrollments.find(e => e.itemId === course.id);
                const isEnrolled = enrollment?.status === 'approved';
                const isPending = enrollment?.status === 'pending';

                return (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 card-shadow flex flex-col group relative hover:border-slate-700 transition"
                  >
                    <div className="mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Course</span>
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">{course.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm flex-1 mb-6 line-clamp-3">{course.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="font-black text-xl text-white">PKR {(course.price || 3000).toLocaleString()}</div>
                      <button 
                        onClick={() => setViewingCourse(course)}
                        className={`px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold flex items-center gap-2 ${
                          isEnrolled ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20' :
                          isPending ? 'bg-yellow-600 text-white shadow-yellow-500/20' :
                          'bg-slate-800 hover:bg-slate-700 text-white hover:scale-105'
                        }`}
                      >
                        Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
          <button onClick={() => setViewingCourse(null)} className="text-slate-400 hover:text-white mb-6 font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-colors">
            &larr; Back to Courses
          </button>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden card-shadow">
             <div className="p-8 border-b border-slate-800">
               {enrollments.find(e => e.itemId === viewingCourse.id)?.status === 'approved' ? (
                 <span className="text-green-500 text-sm font-bold tracking-wider uppercase mb-2 block flex items-center gap-1"><CheckCircle size={14}/> Enrolled</span>
               ) : (
                 <span className="text-blue-500 text-sm font-bold tracking-wider uppercase mb-2 block flex items-center gap-1"><BookOpen size={14} /> Course Preview</span>
               )}
               <h2 className="text-3xl font-black text-white mb-2">{viewingCourse.name}</h2>
               
               <div className="flex items-center gap-4 mt-6">
                 <button onClick={() => handleEnrollClick(viewingCourse)} className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-red-500/20 active:scale-[0.98]">
                    {enrollments.find(e => e.itemId === viewingCourse.id)?.status === 'approved' ? 'Access Course Content' : 'Enroll Now'}
                 </button>
                 <div className="text-2xl font-black text-white">PKR {(viewingCourse.price || 3000).toLocaleString()}</div>
               </div>
             </div>

             {viewingCourse.videoLink && (
               <div className="w-full aspect-video bg-black relative">
                 {getYoutubeId(viewingCourse.videoLink) ? (
                   <iframe src={`https://www.youtube.com/embed/${getYoutubeId(viewingCourse.videoLink)}`} title="Video Player" className="w-full h-full border-0" allowFullScreen />
                 ) : (
                   <video src={viewingCourse.videoLink} controls className="w-full h-full object-cover"></video>
                 )}
               </div>
             )}

             {viewingCourse.imageLink && !viewingCourse.videoLink && (
               <div className="w-full aspect-video">
                 <img src={viewingCourse.imageLink} alt={viewingCourse.name} className="w-full h-full object-cover" />
               </div>
             )}

             <div className="p-8">
               <h3 className="text-xl font-bold text-white mb-6">Course Description</h3>
               <div className="prose prose-invert prose-red max-w-none mb-12">
                 <Markdown>{viewingCourse.description}</Markdown>
               </div>

               <h3 className="text-xl font-bold text-white mb-6">Course Curriculum Preview</h3>
               <div className="space-y-4">
                 {(viewingCourse.lessons || []).map((mod: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400">
                           <Lock size={16} />
                        </div>
                        <span className="font-bold text-slate-300">{mod.title}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-500">{mod.duration}</span>
                   </div>
                 ))}
                 {(!viewingCourse.lessons || viewingCourse.lessons.length === 0) && (
                   <div className="text-slate-500 text-sm py-4">Curriculum will be uploaded soon.</div>
                 )}
               </div>
               
               <ProductReviews productId={viewingCourse.id} productName={viewingCourse.name} />
             </div>
          </div>
        </motion.div>
      )}

      {showPaymentModalFor && (
        <PaymentModal 
          item={showPaymentModalFor} 
          type="course" 
          onClose={() => {
            setShowPaymentModalFor(null);
            // Re-fetch enrollments to see if it just changed to pending
            if (user) {
              const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('itemType', '==', 'course'));
              getDocs(q).then(snapshot => {
                const arr:any[] = [];
                snapshot.forEach(doc => arr.push({id: doc.id, ...doc.data()}));
                setEnrollments(arr);
              });
            }
          }} 
        />
      )}
    </div>
  );
}
