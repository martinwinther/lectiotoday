'use client';

import { useState } from 'react';

export function DiscussionBox() {
  const [comment, setComment] = useState('');

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <h3 className="text-lg font-semibold text-zinc-200 mb-4">
        Share Your Reflection
      </h3>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What does this quote mean to you?"
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none min-h-[120px] transition-all"
      />
      
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-zinc-500">
          Connect backend to post
        </p>
        
        <button
          disabled
          className="glass-button px-6 py-2 rounded-lg text-sm font-medium text-zinc-400"
        >
          Post
        </button>
      </div>
    </div>
  );
}

