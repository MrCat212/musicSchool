import React, { createContext, useEffect, useState } from "react";
import AppLayout from "./layouts/appLayout/AppLayout.jsx";
import PageNotFound from "./pages/notFound/PageNotFound.jsx";
import {
    createBrowserRouter,
    RouterProvider
} from 'react-router-dom';
import Home from "./pages/home/Home.jsx";
import { UserPage } from "./pages/userPage/UserPage.jsx";
import { editUser, getAllUsers } from "./utils/api.js";
import { TeacherPage } from "./pages/teacherPage/TeacherPage.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
        errorElement: <PageNotFound />
    },
    {
        path: '/user-page',
        element: <UserPage />,
        errorElement: <PageNotFound />,
    },
    {
        path: '/teacher-page',
        element: <TeacherPage />,
        errorElement: <PageNotFound />,
    }
])

export const UserContext = createContext();

export const AllUserContext = createContext();

const initialState = JSON.parse(localStorage.getItem('user'));

const allUsersInitialState = JSON.parse(localStorage.getItem('all-users')) ?? [];

const App = () => {

    const [userContext, setUserContex] = useState(initialState);
    const [allUsers, setAllUsers] = useState(allUsersInitialState);
    const [refetchValue, setRefetchValue] = useState(0);

    const setUserContext = async (user) => {
        if(user === null){
            setUserContex(null)
            return
        }
        if(userContext?.role){
            setAllUsers(prev => prev.map(item => {
                if(item._id === user._id){
                    return user
                }
                return item
            }))
        }else{
            setUserContex(user);
            localStorage.setItem('user', JSON.stringify(user));
        }
        const response = await editUser(user);
        return response
    }

    useEffect(() => {
        const func = async () => {
            const response = await getAllUsers();
            setAllUsers(response.filter(user => !user?.role));
            localStorage.setItem('all-users', JSON.stringify(response.filter(user => !user?.role)));
        }

        if(userContext?.role){
            func()
        }else{
            localStorage.setItem('all-users', JSON.stringify(allUsers.filter(user => !user?.role)));
        }
    }, [userContext, refetchValue])

    return(
        <AllUserContext.Provider value={{allUsers, setRefetchValue}}>
            <UserContext.Provider value={{userContext, setUserContext}}>
                <AppLayout>
                    <RouterProvider router={router} />
                </AppLayout>
            </UserContext.Provider>
        </AllUserContext.Provider>
    )
}

export default App;