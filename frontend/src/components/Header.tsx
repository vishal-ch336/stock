import { Search, Moon, Sun, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";

export const Header = () => {
  const { darkMode, managerMode, sseConnected, toggleDarkMode, toggleManagerMode } =
    useUIStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <svg
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Sushmitha Solar Power
            </h1>
            <p className="text-xs text-muted-foreground">Inventory Management</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search company or ID..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!sseConnected && import.meta.env.VITE_API_BASE && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              Reconnecting...
            </div>
          )}

          <Button
            variant={managerMode ? "default" : "outline"}
            size="sm"
            onClick={toggleManagerMode}
            className="gap-2"
          >
            {managerMode ? (
              <ToggleRight className="h-5 w-5" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
            <span className="hidden sm:inline font-semibold">
              {managerMode ? "Manager ON" : "Manager OFF"}
            </span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
