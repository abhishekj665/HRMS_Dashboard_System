import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const loadingRef = {
  set: () => {},
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);


  loadingRef.set = setLoading;

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
