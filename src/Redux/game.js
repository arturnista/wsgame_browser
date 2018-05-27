const START_GAME = 'game/START_GAME'
const STOP_GAME = 'game/STOP_GAME'

const initialState = null

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case START_GAME:
            return { ...action.payload }
        case STOP_GAME:
            return initialState
        default:
            return state
    }
}

export function startGame(data) {
    return {
        type: START_GAME,
        payload: { ...data }
    }
}

export function stopGame() {
    return {
        type: STOP_GAME,
    }
}