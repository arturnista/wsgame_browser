const SET_ROOM = 'room/SET_ROOM'
const ADD_PLAYER = 'room/ADD_PLAYER'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_ROOM:
            return { ...action.payload }
        case ADD_PLAYER:
            return {
                ...state,
                users: [
                    ...state.users,
                    { ...action.payload }
                ]
            }
        default:
            return state
    }
}

export function setRoom({ roomJoined, user }) {
    return {
        type: SET_ROOM,
        payload: {
            roomJoined,
            users: [ user ]
        }
    }
}

export function addPlayer(user) {
    return {
        type: SET_ROOM,
        payload: { ...user }
    }
}
