import { Bell, Search, User, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';

export const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.role || 'Guest'}</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};
