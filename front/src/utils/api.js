import { ADD_USER, ALL_TEACHERS, ALL_USERS, CHANGE_PASSWORD, CONFIRM_EMAIL, CREATE_ACCOUNT, DELETE_USER, EDIT_USER, IS_EXIST } from "./endpoints";

export const getAllUsers = async () => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + ALL_USERS);
    const data = await response.json();
    return data;
}

export const getAllTeachers = async () => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + ALL_TEACHERS);
    const data = await response.json();
    return data;
}

export const deleteUser = async (userID) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + DELETE_USER, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: userID
        })
    })
    const data = await response.text();
    return data;
}

export const addUser = async (user) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + ADD_USER, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    const data = await response.text();
    return data;
}

export const editUser = async (user) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + EDIT_USER, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    const data = await response.text();
    return data;
}

export const confirmEmail = async (login) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + CONFIRM_EMAIL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({login: login})
    })
    
    const data = await response.json();
    return data;
}

export const createAccount = async (user) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + CREATE_ACCOUNT, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({...user})
    })
    const data = await response.text();
    return data;
}

export const checkIsUserExist = async (credits) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + IS_EXIST, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: credits?.password ? JSON.stringify({login: credits.login, password: credits.password}) : JSON.stringify({login: credits})
    })
    if(credits?.password){
        const data = await response.json();
        return data
    }
    const data = await response.text();
    return data;
}

export const changePassword = async (credits) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credits)
    })
    const data = await response.text();
    return data
}

export const createConf = async () => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/conf', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    const data = await response.text();
    return data
}