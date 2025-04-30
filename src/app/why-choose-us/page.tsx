'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  MapPinIcon, 
  ClockIcon, 
  HeartIcon,
  BriefcaseIcon,
  LightBulbIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function WhyChooseUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Why Choose Us</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            We help you find the perfect middle ground for all your meetings - whether it's a date, catching up with friends, or an important business meeting.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-neutral-50 p-8 md:p-12 rounded-2xl shadow-sm">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6 text-center max-w-4xl mx-auto">
              At Find A Meeting Spot, we believe that meeting up should be convenient for everyone involved. Our mission is to eliminate the stress of finding places to meet by providing a platform that helps you discover perfect middle grounds that work for all parties.
            </p>
            <div className="flex justify-center">
              <Link href="/create" className="btn-accent">
                Create Your First Meeting
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Who We Serve</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Dating */}
            <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Dating</h3>
              <p className="text-gray-600 text-center">
                Make your dates convenient and comfortable by finding neutral locations that are fair distance-wise for both parties. Perfect for first meet-ups!
              </p>
            </div>
            
            {/* Friends */}
            <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Friend Meetups</h3>
              <p className="text-gray-600 text-center">
                Coordinating with multiple friends from different parts of town? We'll help you find the perfect central location for your group hangouts.
              </p>
            </div>
            
            {/* Business */}
            <div className="bg-white p-8 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BriefcaseIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Business Meetings</h3>
              <p className="text-gray-600 text-center">
                Impress clients or colleagues by suggesting convenient meeting spots that respect everyone's time and travel constraints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {/* Feature 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Perfect Middle Grounds</h3>
                <p className="text-gray-600">
                  Our intelligent algorithm calculates the ideal meeting spot between all participants, ensuring fair travel times and distances for everyone.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Privacy Protection</h3>
                <p className="text-gray-600">
                  Share only what you're comfortable with. Our platform lets you coordinate meetings without revealing your exact location or personal details.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <LightBulbIcon className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
                <p className="text-gray-600">
                  Get curated suggestions for restaurants, cafes, parks, or business venues based on your preferences and the meeting type.
                </p>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Time Efficiency</h3>
                <p className="text-gray-600">
                  Skip the back-and-forth messaging about where to meet. Our platform streamlines the process so you can focus on the actual meeting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Enter Locations</h3>
              <p className="text-gray-600">
                Input your location and the location of your meeting participant(s). You can use addresses or landmarks.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Choose Preferences</h3>
              <p className="text-gray-600">
                Specify the type of meeting place you need—restaurant, cafe, park, office space, and more.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Get Suggestions</h3>
              <p className="text-gray-600">
                Review our tailored suggestions and share them with your meeting partners for a quick decision.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/create" className="btn-accent">
              Try It Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What People Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-neutral-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sarah J.</h4>
                  <p className="text-gray-500 text-sm">Dating App User</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I used to stress about where to meet first dates. This app helps me find neutral spots that feel safe and fair for both of us. Game changer!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-neutral-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Michael T.</h4>
                  <p className="text-gray-500 text-sm">Business Professional</p>
                </div>
              </div>
              <p className="text-gray-600">
                "When meeting clients from different areas, this tool helps me find convenient spots that impress them with my thoughtfulness. It's become part of my client meeting workflow."
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-neutral-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Aisha R.</h4>
                  <p className="text-gray-500 text-sm">Social Coordinator</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Planning outings with friends who live all across town used to be a headache. Now I just plug in everyone's locations and get perfect meeting spots that work for the whole group."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Meeting Spot?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who have simplified their meetups with our intelligent meeting spot finder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-accent">
              Sign Up Free
            </Link>
            <Link href="/subscription" className="btn-outline">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 