const ADD_PREFERENCES = 'preferences/ADD_PREFERENCES'
const UPDATE_HOTKEY = 'preferences/UPDATE_HOTKEY'

const initialState = {
    name: '',
    spells: [],
    hotkeys: [ 'q', 'w', 'e' ]
}

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case ADD_PREFERENCES:
            return {
                ...state,
                ...action.payload
            }
        case UPDATE_HOTKEY:
            return {
                ...state,
                hotkeys: state.hotkeys.map(hot => {
                    if(hot.position !== action.payload.position) return hot
                    return { ...action.payload }
                })
            }
        default:
            return state
    }
}

export function addPreferences(data) {
    return {
        type: ADD_PREFERENCES,
        payload: { ...data }
    }
}

export function updateHotkey({ position, hotkey }) {
    return {
        type: UPDATE_HOTKEY,
        payload: {
            position,
            hotkey
        }
    }
}

