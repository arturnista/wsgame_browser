const SET_ROOM = 'room/SET_ROOM'
const LEAVE_ROOM = 'room/LEAVE_ROOM'
const ADD_USER = 'room/ADD_USER'
const REMOVE_USER = 'room/REMOVE_USER'
const READY_USER = 'room/READY_USER'
const RESET_ROOM = 'room/RESET_ROOM'
const WAITING_USER = 'room/WAITING_USER'
const UPDATE_CHAT = 'room/UPDATE_CHAT'
const UPDATE_ROOM = 'room/UPDATE_ROOM'

const SELECT_SPELL = 'room/SELECT_SPELL'
const DESELECT_SPELL = 'room/DESELECT_SPELL'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LEAVE_ROOM:
            return initialState
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
                users: state.users.filter(x => x.id !== action.payload.id),
            }
        case READY_USER:
            return {
                ...state,
                users: state.users.map(x => {
                    if(x.id !== action.payload.id) return x
                    return { ...x, status: 'ready', isReady: true }
                })
            }
        case RESET_ROOM:
            return {
                ...state,
                users: action.users,
            }
        case UPDATE_CHAT:
            return {
                ...state,
                chat: action.payload.chat
            }
        case WAITING_USER:
            return {
                ...state,
                users: state.users.map(x => {
                    if(x.id !== action.payload.id) return x
                    return { ...x, status: 'waiting', isReady: true }
                })
            }
        case UPDATE_ROOM:
            return {
                ...state,
                ...action.payload,
            }

        case SELECT_SPELL:
            return {
                ...state,
                users: state.users.map(user => {
                    if(user.id !== action.payload.userId) return user
                    const nSelectSpells = user.spells.filter(x => x.position !== action.payload.position)
                    
                    return {
                        ...user,
                        spells: [
                            ...nSelectSpells,
                            {
                                position: action.payload.position,
                                id: action.payload.id,
                            }
                        ]
                    }
                })
            }
        case DESELECT_SPELL:
            return {
                ...state,
                users: state.users.map(user => {
                    if(user.id !== action.payload.userId) return user
                    const nSelectSpells = user.spells.filter(x => x.position !== action.payload.position)
                    
                    return {
                        ...user,
                        spells: user.spells.filter(x => x.id !== action.payload.id)
                    }
                })
            }
        default:
            return state
    }
}

export function leaveRoom() {
    return {
        type: LEAVE_ROOM,
    }
}

export function setRoom({ room }) {
    return {
        type: SET_ROOM,
        payload: {
            name: room.name,
            users: room.users,
            owner: room.owner.id,
            chat: room.chat,
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

export function updateChat(chat) {
    chat.reverse()
    return {
        type: UPDATE_CHAT,
        payload: {
            chat
        }
    }
}

export function updateRoom(room) {
    return {
        type: UPDATE_ROOM,
        payload: {
            ...room,
            users: room.users,
            owner: room.owner.id,
        }
    }
}

export function resetRoom(users) {
    return {
        type: RESET_ROOM,
        users: users,
    }
}

export function selectSpell(userId, id, position) {
    return {
        type: SELECT_SPELL,
        payload: {
            userId,
            id,
            position
        }
    }
}

export function deselectSpell(userId, id, position) {
    return {
        type: DESELECT_SPELL,
        payload: {
            userId,
            id,
            position
        }
    }
}


