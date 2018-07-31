const DEFINE_USER = 'user/DEFINE_USER'
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
                // spells: []
            }
        case USER_END_GAME:
            return {
                ...state,
                spells: action.payload.user.spells,
                isObserver: action.payload.user.isObserver
            }
        case SELECT_SPELL:
            return {
                ...state,
                spells: [
                    ...state.spells,
                    action.payload
                ]
            }
        case DESELECT_SPELL:
            return {
                ...state,
                spells: state.spells.filter(x => x !== action.payload)
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

export function userEndGame(user) {
    return {
        type: USER_END_GAME,
        payload: { user: user || {} }
    }
}

export function selectSpell(spellData) {
    return {
        type: SELECT_SPELL,
        payload: spellData
    }
}

export function deselectSpell(spellData) {
    return {
        type: DESELECT_SPELL,
        payload: spellData
    }
}

