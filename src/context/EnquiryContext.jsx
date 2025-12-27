import { createContext, useContext, useState } from "react";

const EnquiryContext = createContext();

export function EnquiryProvider({ children }) {
  const [enquiry, setEnquiry] = useState(null);

  return (
    <EnquiryContext.Provider value={{ enquiry, setEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  return useContext(EnquiryContext);
}