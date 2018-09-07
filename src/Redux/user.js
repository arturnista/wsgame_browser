const DEFINE_USER = 'user/DEFINE_USER'
const ADD_PREFERENCES = 'user/ADD_PREFERENCES'
const USER_END_GAME = 'user/USER_END_GAME'
const SET_SPELLS = 'user/SET_SPELLS'
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
        case SET_SPELLS:
            return {
                ...state,
                spells: [ ...action.payload ]
            }
        case SELECT_SPELL:
            const nSelectSpells = state.spells.filter(x => x.position !== action.payload.position)
            return {
                ...state,
                spells: [
                    ...nSelectSpells,
                    {
                        hotkey: action.payload.hotkey,
                        position: action.payload.position,
                        id: action.payload.id,
                    }
                ]
            }
        case DESELECT_SPELL:
            return {
                ...state,
                spells: state.spells.filter(x => x.id !== action.payload.id)
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

export function setSpells(spells, hotkeysConfig) {
    return {
        type: SET_SPELLS,
        payload: spells.map(spell => ({
            id: spell.id,
            position: spell.position,
            hotkey: hotkeysConfig[spell.position]
        }))
    }
}

export function selectSpell(id, position, hotkeysConfig) {
    return {
        type: SELECT_SPELL,
        payload: {
            id,
            position,
            hotkey: hotkeysConfig[position]
        }
    }
}

export function deselectSpell(id, position) {
    return {
        type: DESELECT_SPELL,
        payload: {
            id,
            position
        }
    }
}

