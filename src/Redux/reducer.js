import { combineReducers } from 'redux'
import room from './room'
import user from './user'
import game from './game'

export default combineReducers({ room, user, game })
