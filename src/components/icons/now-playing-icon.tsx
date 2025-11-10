
'use client';

export function NowPlayingIcon() {
  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <div className="w-full h-full flex justify-around items-end">
        <span className="w-1 h-2 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-2s' }} />
        <span className="w-1 h-4 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-1.5s' }} />
        <span className="w-1 h-5 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-1s' }} />
        <span className="w-1 h-3 bg-primary rounded-full animate-sound-wave" style={{ animationDelay: '-0.5s' }} />
        <span className="w-1 h-4 bg-primary rounded-full animate-sound-wave" />
      </div>
    </div>
  );
}
