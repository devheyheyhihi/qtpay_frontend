"use client";

import { Wallet } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  themeLabel?: string;
  themeTextColor?: string;
}

export default function Header({
  onSettingsClick,
  themeLabel,
  themeTextColor,
}: HeaderProps) {
  const label = themeLabel?.trim() ? themeLabel.trim() : "Qwon";
  const textColor = themeTextColor?.trim() ? themeTextColor.trim() : "#FFFFFF";

  return (
    <header
      className="text-white px-5 py-2 shadow-lg"
      style={{
        backgroundColor: "var(--theme-bg, #04AAAB)",
      }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold" style={{ color: textColor }}>
          {label} <span style={{ color: "#000000" }}>Pay</span>
        </h1>
        <button
          onClick={onSettingsClick}
          className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[9px] mt-0.5" style={{ color: textColor }}>
            나의 지갑
          </span>
        </button>
      </div>
    </header>
  );
}
