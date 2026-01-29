export function RobotTrader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
        {/* Desk */}
        <div className="relative">
          {/* Robot Body */}
          <div className="flex flex-col items-center">
            {/* TV Head */}
            <div className="relative mb-2">
              {/* TV Screen Outer Frame */}
              <div className="w-32 h-24 bg-gradient-to-br from-blue to-[#667dde] rounded-lg shadow-2xl border-4 border-[#4B5B8B] relative overflow-hidden">
                {/* Screen Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                
                {/* Screen Content - Happy Face */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Eyes */}
                  <div className="flex gap-4">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Smile */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                  <div className="w-12 h-6 border-b-2 border-white rounded-b-full"></div>
                </div>
                
                {/* Antenna */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="w-1 h-4 bg-[#4B5B8B]"></div>
                  <div className="w-2 h-2 bg-red rounded-full absolute -top-1 left-1/2 -translate-x-1/2 animate-pulse"></div>
                </div>
              </div>
              
              {/* TV Stand/Neck */}
              <div className="w-6 h-6 bg-gradient-to-b from-gray to-[#4B5B8B] mx-auto rounded-sm"></div>
            </div>
            
            {/* Body/Torso */}
            <div className="w-24 h-32 bg-gradient-to-br from-gray to-[#4B5B8B] rounded-2xl shadow-xl relative">
              {/* Panel Details */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-dark/20 rounded-full"></div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-2 bg-dark/20 rounded-full"></div>
              
              {/* Buttons */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-3 h-3 bg-green rounded-full shadow-lg"></div>
                <div className="w-3 h-3 bg-blue rounded-full shadow-lg"></div>
                <div className="w-3 h-3 bg-[#379C1D] rounded-full shadow-lg"></div>
              </div>
            </div>
            
            {/* Base/Legs */}
            <div className="w-28 h-4 bg-gradient-to-b from-[#4B5B8B] to-dark rounded-b-2xl shadow-lg"></div>
          </div>
          
          {/* Desk Surface */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-3 bg-gradient-to-b from-gray to-[#4B5B8B] rounded-lg shadow-lg"></div>
          
          {/* Desk Legs */}
          <div className="absolute -bottom-20 left-8 w-2 h-12 bg-[#4B5B8B]"></div>
          <div className="absolute -bottom-20 right-8 w-2 h-12 bg-[#4B5B8B]"></div>
        </div>
        
        {/* Trading Activity Indicator */}
        <div className="absolute -right-8 top-8 flex flex-col gap-1">
          <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#379C1D] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}