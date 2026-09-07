import React from "react";

const LOGO_SRC = "/src/assets/images/rail_madad_logo_1788787756032.jpg";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textLight?: boolean;
  subtext?: string;
  badgeText?: string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  showText = false,
  textLight = false,
  subtext = "Indian Railways • Ministry of Railways",
  badgeText = "AI",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 min-w-8",
    md: "w-10 h-10 min-w-10",
    lg: "w-14 h-14 min-w-14",
    xl: "w-20 h-20 min-w-20",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden shadow-sm ring-2 ring-amber-400/50 bg-white p-0.5 shrink-0 flex items-center justify-center transition-transform hover:scale-105`}
      >
        <img
          src={LOGO_SRC}
          alt="Rail Madad AI Emblem"
          className="w-full h-full object-cover rounded-[14px]"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight leading-none ${
                size === "lg" || size === "xl" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
              } ${textLight ? "text-white" : "text-[#0B192C]"}`}
            >
              RAIL MADAD
            </span>
            {badgeText && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                {badgeText}
              </span>
            )}
          </div>
          {subtext && (
            <span
              className={`text-[11px] font-medium tracking-wide mt-1 leading-tight ${
                textLight ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
