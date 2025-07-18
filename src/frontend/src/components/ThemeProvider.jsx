    import React, { useState, useMemo } from 'react';

    export const ThemeProvider = ({ children }) => {
      const [valueA, setValueA] = useState('initial A');
      const [valueB, setValueB] = useState('initial B');

      // Memoize the context value to prevent unnecessary re-renders of consuming components
      const contextValue = useMemo(() => ({
        valueA,
        setValueA,
        valueB,
        setValueB,
      }), [valueA, valueB]);

      return (
        <ThemeContext.Provider value={contextValue}>
          {children}
        </ThemeContext.Provider>
      );
    };
