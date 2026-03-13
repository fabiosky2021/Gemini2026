import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 w-full"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      {isDarkMode ? "Modo Claro" : "Modo Escuro"}
    </button>
  );
}
