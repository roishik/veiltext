import { ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl font-heading font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">VeilText</h1>
            <span className="hidden md:inline-block bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded-full">Beta</span>
          </div>
          
          {/* Main actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <button 
              className="flex items-center text-sm text-gray-700 hover:text-primary-600 transition-all"
              onClick={() => toast({
                title: "Help Center",
                description: "Coming soon! Documentation and tutorials will be available here.",
              })}
            >
              <i className="ri-information-line mr-1"></i>
              <span className="hidden md:inline">Help</span>
            </button>
            <button 
              className="flex items-center text-sm text-gray-700 hover:text-primary-600 transition-all"
              onClick={() => toast({
                title: "Settings",
                description: "Settings panel will be available in the next update.",
              })}
            >
              <i className="ri-settings-4-line mr-1"></i>
              <span className="hidden md:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>
      
      {children}
      
      {/* Footer Status Bar */}
      <footer className="bg-gray-100 border-t border-gray-200 py-2 px-4 md:px-6 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>VeilText Beta v0.9.2</span>
          <span className="flex items-center">
            <i className="ri-checkbox-circle-line text-green-500 mr-1"></i>
            All changes saved
          </span>
        </div>
        <div>
          <button 
            onClick={() => toast({
              title: "Report an Issue",
              description: "Thanks for helping make VeilText better! Issue reporting will be available soon.",
            })}
            className="text-primary-600 hover:text-primary-700"
          >
            Report an issue
          </button>
          <span className="mx-2">•</span>
          <button 
            onClick={() => toast({
              title: "Privacy Policy",
              description: "VeilText is committed to protecting your privacy. All operations run client-side by default.",
            })}
            className="text-primary-600 hover:text-primary-700"
          >
            Privacy Policy
          </button>
        </div>
      </footer>
    </div>
  );
}
