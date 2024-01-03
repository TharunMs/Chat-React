const { createContext, useState, useEffect } = require("react");

export const UserContext = createContext()

export default function UserContextProvider({children}){
    const [user,setUser] = useState(null);
    const [id,setId] = useState(null);
    useEffect(()=>{
        async function profile(){
            try{
                const response = await fetch('http://localhost:4000/profile',{
                    method : 'GET',
                    credentials: 'include'
                })
                const res = await response.json();
                setUser(res.username)
                setId(res.userId)
            }
            catch(err){
                console.log(err)
            }
        }
        profile()
    },[])
    return(
        <UserContext.Provider value={{user,setUser,id,setId}}>
            {children}
        </UserContext.Provider>
    )
}