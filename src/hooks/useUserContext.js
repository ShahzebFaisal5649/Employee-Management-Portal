import {useContext} from "react";
import {UserContext} from "../context/UserContext";

function useUserContext() {
    return useContext(UserContext);
}

export default useUserContext;