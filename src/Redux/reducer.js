import { combineReducers } from 'redux'
import room from './room'
import user from './user'
import game from './game'
import preferences from './preferences'
import spells from './spells'

export default combineReducers({ preferences, room, user, game, spells })
