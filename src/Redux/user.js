const DEFINE_USER = 'user/DEFINE_USER'
const DEFINE_PLAYER = 'user/DEFINE_PLAYER'
const RESET_SPELLS = 'user/RESET_SPELLS'
const SELECT_SPELL = 'user/SELECT_SPELL'
const DESELECT_SPELL = 'user/DESELECT_SPELL'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case DEFINE_USER:
            return {
                ...action.payload,
                // spells: []
            }
        case DEFINE_PLAYER:
            return {
                ...state,
                player: { ...action.payload }
            }
        case RESET_SPELLS:
            return {
                ...state,
                spells: action.payload.users.find(x => state.id).spells
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

export function definePlayer(playerData) {
    return {
        type: DEFINE_PLAYER,
        payload: playerData
    }
}

export function resetSpells(users) {
    return {
        type: RESET_SPELLS,
        payload: { users: users || [] }
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

