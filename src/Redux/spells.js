const ADD_SPELLS = 'spells/ADD_SPELLS'

const initialState = []

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case ADD_SPELLS:
            return [ ...action.payload ]
        default:
            return state
    }
}

export function addSpells(spells) {
    return {
        type: ADD_SPELLS,
        payload: spells
    }
}