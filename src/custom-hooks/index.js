const TOKEN_KEY = 'access_token'
const ISSERVER = typeof window === 'undefined'

const TokenService = {
    getToken: () =>{
        if(!ISSERVER){
            return localStorage.getItem(TOKEN_KEY) || ''
        }
        return null;
    },

    saveToken: (accessToken) => {
        if(!ISSERVER){
            localStorage.setItem(TOKEN_KEY, accessToken)
        }
    },

    removeToken: () => {
        if(!ISSERVER){
            localStorage.removeItem(TOKEN_KEY)
        }
    },

    clearStorageData: () => {
        if(!ISSERVER){
            localStorage.clear()
        }
    }
}


const UserService = {
    getUser: () => {
        if (!ISSERVER) {
            return JSON.parse(localStorage.getItem('USER_DATA')) || ''
        }
        return null
    },

    saveUser(user_data) {
        if (!ISSERVER) {
            localStorage.setItem('USER_DATA', JSON.stringify(user_data))
        }
    },

     removeUser() {
        if (!ISSERVER) {
            localStorage.removeItem(USER_DATA)
        }
    }
}

export { TokenService, UserService }
