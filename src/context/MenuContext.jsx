import { createContext, useState, useContext } from 'react';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const closeWorkflow = () => setWorkflowOpen(false);
  const closeAllMenus = () => {
    setSidebarOpen(false);
    setWorkflowOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
    setWorkflowOpen(false); // Close workflow when opening sidebar
  };

  const toggleWorkflow = () => {
    setWorkflowOpen(prev => !prev);
    setSidebarOpen(false); // Close sidebar when opening workflow
  };

  return (
    <MenuContext.Provider
      value={{
        sidebarOpen,
        workflowOpen,
        closeSidebar,
        closeWorkflow,
        closeAllMenus,
        toggleSidebar,
        toggleWorkflow
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within MenuProvider');
  }
  return context;
}
