import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);

export const Sidebar = ({ children, className }) => {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-80 shrink-0 ${className}`}>
        {children}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed top-0 left-0 h-full w-80 bg-white z-50 flex flex-col md:hidden ${className}`}
            >
              {children}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarTrigger = ({ className, ...props }) => {
  const { isOpen, setIsOpen } = useSidebar();
  return (
    <button onClick={() => setIsOpen(!isOpen)} className={className} {...props}>
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};

export const SidebarHeader = ({ children, className }) => (
  <header className={`shrink-0 ${className}`}>{children}</header>
);

export const SidebarContent = ({ children, className }) => (
  <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>
);

export const SidebarFooter = ({ children, className }) => (
  <footer className={`shrink-0 ${className}`}>{children}</footer>
);

export const SidebarGroup = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const SidebarGroupLabel = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const SidebarGroupContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const SidebarMenu = ({ children, className }) => (
  <ul className={className}>{children}</ul>
);

export const SidebarMenuItem = ({ children, className }) => (
  <li className={className}>{children}</li>
);

export const SidebarMenuButton = React.forwardRef(({ asChild, ...props }, ref) => {
  const Component = asChild ? "div" : "button";
  return <Component ref={ref} {...props} />;
});
SidebarMenuButton.displayName = "SidebarMenuButton";