import RuleSidebar from "@/components/RuleSidebar";
import TextCanvas from "@/components/TextCanvas";
import { useState } from "react";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex flex-1 overflow-hidden">
      <RuleSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)} 
      />
      <TextCanvas />
    </div>
  );
}
