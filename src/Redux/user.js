const DEFINE_USER = 'user/DEFINE_USER'
const ADD_PREFERENCES = 'user/ADD_PREFERENCES'
const USER_END_GAME = 'user/USER_END_GAME'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case DEFINE_USER:
            return {
                ...state,
                ...action.payload,
                spells: []
            }
        case ADD_PREFERENCES:
            let newPreference = {
                ...state,
                preferences: {
                    ...state.preferences,
                    ...action.payload,
                }
            }

            if(action.payload.hotkeys) {
                newPreference.spells = state.spells.map(spell => ({ ...spell, hotkey: action.payload.hotkeys[spell.position] }))
            }

            return newPreference
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

export function addUserPreferences(prefs) {
    return {
        type: ADD_PREFERENCES,
        payload: prefs
    }
}
