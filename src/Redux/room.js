const SET_ROOM = 'room/SET_ROOM'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case SET_ROOM:
            return { ...action.payload }
        default:
            return state
    }
}

export function setRoom({ roomJoined }) {
    return {
        type: SET_ROOM,
        payload: {
            roomJoined,
            users: []
        }
    }
}
