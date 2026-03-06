import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [role,setRole] = useState(null);
  const [isLogged,setIsLogged] = useState(false);

  return(

    <AuthContext.Provider value={{role,setRole,isLogged,setIsLogged}}>

      {children}

    </AuthContext.Provider>

  )

}
