const DEFINE_USER = 'user/DEFINE_USER'
const DEFINE_PLAYER = 'user/DEFINE_PLAYER'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case DEFINE_USER:
            return { ...action.payload }
        case DEFINE_PLAYER:
            return {
                ...state,
                player: { ...action.payload }
            }
        default:
            return state
    }
}

export function defineUser(userData) {
    return {
        type: DEFINE_USER,
        payload: userData
    }
}

export function definePlayer(playerData) {
    return {
        type: DEFINE_PLAYER,
        payload: playerData
    }
}
