import React, { useState } from 'react';
import { ChevronRight, Activity, Globe, ArrowRight, Users, Shield, Bell, Search } from 'lucide-react';
import Logo from './Logo';

const HeroSection = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  const features = [
    { icon: <Activity className="w-5 h-5" />, text: "Real-time Analytics" },
    { icon: <Users className="w-5 h-5" />, text: "Team Collaboration" },
    { icon: <Shield className="w-5 h-5" />, text: "Advanced Security" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute -top-20 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-2xl animate-[pulse_5s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="relative z-10 border-b border-gray-100 bg-white/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br  flex items-center justify-center  shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 cursor-pointer">
                {/* <Globe className="w-5 h-5 text-white animate-spin-slow" />
                 */}

                 <Logo/>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                OpenTrack
              </span>
            </div>

            {/* Search Bar */}
            <div className={`relative flex-1 max-w-md mx-12 transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>

            <div className="flex items-center gap-8">
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              <button className="text-gray-600 hover:text-blue-600 transition-colors hover:scale-105">Features</button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors hover:scale-105">Open Source</button>
              <button className="px-5 py-2 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all border border-blue-100 hover:border-blue-200 hover:scale-105">
                Documentation
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        <div className="flex gap-20 items-center">
          {/* Left Column */}
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold leading-tight">
                OpenTrack
                <div className="relative inline-block mt-2">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Real-Time Tracking and Smarter Routes
                  </span>
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-800 animate-pulse" />
                </div>
              </h1>
                {/* Enhanced Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md relative overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold text-center mb-6">
                      Traffic Management System
                    </h2>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group/button"
                    >
                      Login
                      <ChevronRight className="w-5 h-5 group-hover/button:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform your transportation operations with
                <br />real-time tracking and optimization system.
              </p>
              
              {/* Feature Pills */}
              <div className="flex gap-4 flex-wrap">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>


          {/* Right Column - Stats Dashboard */}
          <div className="flex-1">
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
                <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute top-0 -left-8 w-40 h-40 bg-blue-400/30 rounded-full blur-2xl animate-[pulse_4s_ease-in-out_infinite]" />

                {/* Stats Cards */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid gap-6">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-blue-600 animate-[pulse_2s_ease-in-out_infinite]">44%</div>
                          <div className="text-gray-600">Traffic Reduction</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all translate-x-8 hover:scale-105 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-4xl font-bold text-blue-600 animate-[pulse_2s_ease-in-out_infinite]">75%</div>
                          <div className="text-gray-600">Cost Savings</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;                   