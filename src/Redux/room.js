const SET_ROOM = 'room/SET_ROOM'
const ADD_USER = 'room/ADD_USER'
const REMOVE_USER = 'room/REMOVE_USER'
const READY_USER = 'room/READY_USER'
const WAITING_USER = 'room/WAITING_USER'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_ROOM:
            return { ...action.payload }
        case ADD_USER:
            if(state.users.find(x => x.id === action.payload.id) != null) return state

            return {
                ...state,
                users: [
                    ...state.users,
                    {
                        ...action.payload,
                        isReady: false
                    }
                ]
            }
        case REMOVE_USER:
            return {
                ...state,
                users: state.users.filter(x => x.id !== action.payload.id)
            }
        case READY_USER:
            return {
                ...state,
                users: state.users.map(x => {
                    if(x.id !== action.payload.id) return x
                    return { ...x, status: 'ready', isReady: true }
                })
            }
        case WAITING_USER:
            return {
                ...state,
                users: state.users.map(x => {
                    if(x.id !== action.payload.id) return x
                    return { ...x, status: 'waiting', isReady: true }
                })
            }
        default:
            return state
    }
}

export function setRoom({ room }) {
    return {
        type: SET_ROOM,
        payload: {
            roomJoined: room.name,
            users: room.users,
            owner: room.owner.id,
        }
    }
}

export function addUser(user) {
    return {
        type: ADD_USER,
        payload: { ...user }
    }
}

export function removeUser(user) {
    return {
        type: REMOVE_USER,
        payload: { ...user }
    }
}

export function readyUser(user) {
    return {
        type: READY_USER,
        payload: { ...user, id: user.user }
    }
}

export function waitingUser(user) {
    return {
        type: WAITING_USER,
        payload: { ...user, id: user.user  }
    }
}
