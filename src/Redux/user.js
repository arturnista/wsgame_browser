const DEFINE_USER = 'user/DEFINE_USER'
const ADD_PREFERENCES = 'user/ADD_PREFERENCES'
const USER_END_GAME = 'user/USER_END_GAME'
const SELECT_SPELL = 'user/SELECT_SPELL'
const DESELECT_SPELL = 'user/DESELECT_SPELL'

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
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    ...action.payload,
                }
            }
        case SELECT_SPELL:
            return {
                ...state,
                spells: [
                    ...state.spells,
                    {
                        hotkey: action.payload.hotkey,
                        position: action.payload.index,
                        id: action.payload.spellData,
                    }
                ]
            }
        case DESELECT_SPELL:
            return {
                ...state,
                spells: state.spells.filter(x => x.id !== action.payload.spellData)
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

export function addUserPreferences(prefs) {
    return {
        type: ADD_PREFERENCES,
        payload: prefs
    }
}

export function selectSpell(spellData, index, hotkeysConfig) {
    return {
        type: SELECT_SPELL,
        payload: {
            spellData,
            index,
            hotkey: hotkeysConfig[index]
        }
    }
}

export function deselectSpell(spellData, index) {
    return {
        type: DESELECT_SPELL,
        payload: {
            spellData,
            index
        }
    }
}

