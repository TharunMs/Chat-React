import { useContext } from "react"
import { UserContext } from "./UserContext"
import Login from "./Login";
import Chat from "./Chat";

export default function Routes(){
    const {user} = useContext(UserContext);
    
    return(
        user ? <Chat /> : <Login />
    )
}