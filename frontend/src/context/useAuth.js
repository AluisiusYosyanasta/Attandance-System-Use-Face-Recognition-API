import { useContext } from "react";
import  UserContext  from "./authContext.js";

const useAuth = () => useContext(UserContext);

export default useAuth;
