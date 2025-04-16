'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Redirect authenticated users to create page if they click "Create Meeting"
  const handleCreateClick = () => {
    if (user && token) {
      router.push('/create');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <>
      {/* Header/Nav */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-lime-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="ml-2 font-bold text-xl">Find A Meeting Spot</span>
        </div>
        
        <div className="flex gap-4">
          {user && token ? (
            <>
              <Link 
                href="/create" 
                className="bg-lime-500 text-black px-6 py-2 rounded-full font-medium hover:bg-lime-400 transition-all"
              >
                Dashboard →
              </Link>
              <Link 
                href="/profile" 
                className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-all"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/auth/register" 
                className="bg-lime-500 text-black px-6 py-2 rounded-full font-medium hover:bg-lime-400 transition-all"
              >
                Sign up →
              </Link>
              <Link 
                href="/auth/login" 
                className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-all"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative px-6 md:px-12 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left Column - Text */}
          <div className="flex flex-col justify-center">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-tight leading-none mb-6">
              CONTROL<br />
              YOUR MEET
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 mb-8">
              Find middlegrounds without all the hassle—send, meet, and connect the way you want.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm inline-block">
              <h3 className="font-bold mb-4">Start Meeting</h3>
              <button 
                onClick={handleCreateClick}
                className="bg-lime-500 text-black px-6 py-3 rounded-full font-medium hover:bg-lime-400 transition-all inline-block"
              >
                Create a meeting spot
              </button>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative z-10 transform translate-y-8 float-animation">
              <div className="relative w-full max-w-sm mx-auto">
                {/* App visualization */}
                <div className="aspect-[9/16] rounded-3xl bg-gradient-to-br from-lime-500 to-lime-400 shadow-xl overflow-hidden border-4 border-white p-4">
                  <div className="h-full bg-white rounded-2xl shadow-inner flex flex-col overflow-hidden">
                    <div className="bg-lime-500 text-white p-4 font-medium">Find a Meeting Spot</div>
                    <div className="flex-1 p-4 relative">
                      <div className="absolute inset-0 z-0 opacity-10">
                        <div className="w-full h-full bg-[url('/map-bg.svg')] bg-cover"></div>
                      </div>
                      
                      {/* Connection interaction */}
                      <div className="mb-4 bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-white font-bold text-xs">
                            You
                          </div>
                          <div className="ml-2 text-sm bg-lime-100 p-2 rounded-lg">
                            Let's meet up! I'm at Downtown.
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <div className="mr-2 text-sm bg-purple-100 p-2 rounded-lg">
                            I'm near Riverside. What's a good middleground?
                          </div>
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            Alex
                          </div>
                        </div>
                      </div>
                      
                      {/* Map visualization */}
                      <div className="relative bg-white/80 rounded-xl p-4 shadow-sm backdrop-blur-sm mb-4">
                        <div className="h-32 bg-gray-100 rounded-lg relative mb-2">
                          {/* Map with locations */}
                          <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            B
                          </div>
                          
                          {/* Connection line */}
                          <div className="absolute top-7 left-7 w-[calc(100%-56px)] h-[1px] bg-gray-400 rotate-45"></div>
                          
                          {/* Midpoint */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-lime-500 flex items-center justify-center text-xs font-bold text-lime-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="font-medium text-center">Perfect Middleground Found!</h3>
                      </div>
                      
                      {/* Suggested options */}
                      <div className="bg-white/80 rounded-xl p-4 shadow-sm">
                        <h4 className="font-medium text-sm mb-2">Suggested Meeting Places:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-lime-500 rounded-md flex items-center justify-center text-white mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm">Cafe Central</span>
                            </div>
                            <span className="text-xs font-medium bg-lime-100 py-1 px-2 rounded-full">5 min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center text-white mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                                </svg>
                              </div>
                              <span className="text-sm">Park Plaza</span>
                            </div>
                            <span className="text-xs font-medium bg-purple-100 py-1 px-2 rounded-full">10 min</span>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-lime-500 text-white text-sm py-2 rounded-lg font-medium">
                          Share Meeting Spot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-1/4 -left-8 z-0 h-12 w-12 rounded-full bg-purple-400 opacity-80"></div>
            <div className="absolute bottom-1/3 right-0 z-0 h-16 w-16 rounded-full bg-lime-300 opacity-80"></div>
            <div className="absolute top-1/2 right-1/4 z-0 h-8 w-8 rounded-full bg-lime-500 opacity-60"></div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm uppercase tracking-widest mb-2">SCROLL DOWN</p>
          <ChevronDownIcon className="h-6 w-6 mx-auto animate-bounce" />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
            Meet without all the hassle—find the perfect middleground between any two locations.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="rounded-full bg-lime-500 h-12 w-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Share Location</h3>
              <p className="text-gray-400">Share your location and find the perfect meeting spot with anyone.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="rounded-full bg-lime-500 h-12 w-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Meet Anyone</h3>
              <p className="text-gray-400">Discover the fair middleground between you and any contact.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl">
              <div className="rounded-full bg-lime-500 h-12 w-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-gray-400">Your location data is always encrypted and protected.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
