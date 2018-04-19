const DEFINE_USER = 'user/DEFINE_USER'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case DEFINE_USER:
            return { ...action.payload }
        default:
            return state
    }
}

export function defineUser(userData) {
    console.log('user', userData)
    return {
        type: DEFINE_USER,
        payload: userData
    }
}
