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
          <div className="h-10 w-10 bg-accent rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="ml-2 font-bold text-xl">Find A Meeting Spot</span>
        </div>
        
        <div className="flex gap-4">
          {user && token ? (
            <>
              <Link 
                href="/create" 
                className="btn-accent"
              >
                Dashboard →
              </Link>
              <Link 
                href="/profile" 
                className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-hover transition-all"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/auth/register" 
                className="btn-accent"
              >
                Sign up →
              </Link>
              <Link 
                href="/auth/login" 
                className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-hover transition-all"
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
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
              <span className="text-gradient">CONTROL<br />
              YOUR MEET</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-700 mb-8">
              Find middlegrounds without all the hassle—send, meet, and connect the way you want.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm inline-block">
              <h3 className="font-bold mb-4">Start Meeting</h3>
              <button 
                onClick={handleCreateClick}
                className="btn-accent"
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
                <div className="aspect-[9/16] rounded-3xl bg-gradient-accent shadow-xl overflow-hidden border-4 border-white p-4">
                  <div className="h-full bg-white rounded-2xl shadow-inner flex flex-col overflow-hidden">
                    <div className="bg-primary text-white p-4 font-medium">Find a Meeting Spot</div>
                    <div className="flex-1 p-4 relative">
                      <div className="absolute inset-0 z-0 opacity-10">
                        <div className="w-full h-full bg-[url('/map-bg.svg')] bg-cover"></div>
                      </div>
                      
                      {/* Connection interaction */}
                      <div className="mb-4 bg-neutral-100 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs">
                            You
                          </div>
                          <div className="ml-2 text-sm bg-green-light p-2 rounded-lg">
                            Let's meet up! I'm at Downtown.
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <div className="mr-2 text-sm bg-purple-light p-2 rounded-lg text-white">
                            I'm near Riverside. What's a good middleground?
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                            Alex
                          </div>
                        </div>
                      </div>
                      
                      {/* Map visualization */}
                      <div className="relative bg-white/80 rounded-xl p-4 shadow-sm backdrop-blur-sm mb-4">
                        <div className="h-32 bg-neutral-100 rounded-lg relative mb-2">
                          {/* Map with locations */}
                          <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                            B
                          </div>
                          
                          {/* Connection line */}
                          <div className="absolute top-7 left-7 w-[calc(100%-56px)] h-[1px] bg-neutral-400 rotate-45"></div>
                          
                          {/* Midpoint */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-secondary flex items-center justify-center text-xs font-bold text-secondary">
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
                              <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center text-white mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm">Cafe Central</span>
                            </div>
                            <span className="text-xs font-medium bg-green-light py-1 px-2 rounded-full">5 min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                                </svg>
                              </div>
                              <span className="text-sm">Park Plaza</span>
                            </div>
                            <span className="text-xs font-medium bg-purple-light py-1 px-2 rounded-full text-white">10 min</span>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-accent text-white text-sm py-2 rounded-lg font-medium hover:bg-accent-hover transition-all">
                          Share Meeting Spot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-1/4 -left-8 z-0 h-12 w-12 rounded-full bg-secondary opacity-80"></div>
            <div className="absolute bottom-1/3 right-0 z-0 h-16 w-16 rounded-full bg-green-light opacity-80"></div>
            <div className="absolute top-1/2 right-1/4 z-0 h-8 w-8 rounded-full bg-accent opacity-60"></div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm uppercase tracking-widest mb-2">SCROLL DOWN</p>
          <ChevronDownIcon className="h-6 w-6 mx-auto animate-bounce" />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-neutral-100 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">Why Choose Us?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Perfect Middlegrounds</h3>
              <p className="text-neutral-600">Our algorithm finds the ideal meeting spot between multiple locations, saving everyone time and travel.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="card">
              <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy First</h3>
              <p className="text-neutral-600">Share your location without revealing your exact address. You control how much information others can see.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="card">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Suggestions</h3>
              <p className="text-neutral-600">Get recommendations for great meeting spots based on your preferences, ratings, and availability.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/colors" className="btn-outline">
              View Our Color System
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-accent rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-2 font-bold">Find A Meeting Spot</span>
            </div>
            <p className="text-sm opacity-80">Finding the perfect meeting location has never been easier.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100">Features</a></li>
              <li><a href="#" className="hover:opacity-100">Pricing</a></li>
              <li><a href="#" className="hover:opacity-100">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100">About Us</a></li>
              <li><a href="#" className="hover:opacity-100">Careers</a></li>
              <li><a href="#" className="hover:opacity-100">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100">Privacy Policy</a></li>
              <li><a href="#" className="hover:opacity-100">Terms of Service</a></li>
              <li><a href="#" className="hover:opacity-100">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/20 text-sm opacity-70 text-center">
          © {new Date().getFullYear()} Find A Meeting Spot. All rights reserved.
        </div>
      </footer>
    </>
  );
}
