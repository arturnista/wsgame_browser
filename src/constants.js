export const serverUrl = 'http://localhost:5000'
export const createRoomUrl = port => `http://localhost:${port}`
// export const createRoomUrl = port => `http://localhost:${port}`

export const firebaseConfig = {
    apiKey: "AIzaSyC9uLZiDzv4hTMTCUl3_GvZQs5lmg6_YQ4",
    authDomain: "dev-nwgame.firebaseapp.com",
    databaseURL: "https://dev-nwgame.firebaseio.com",
    projectId: "dev-nwgame",
    storageBucket: "dev-nwgame.appspot.com",
    messagingSenderId: "186091883358"
  }

export const winStrings = [
    'GGWP GO NEXT',
    'NICE GAME MATE',
    'CONGRATZ EZ WIN',
]

export const loseStrings = [
    'NOT TODAY',
    'BETTER LUCK NEXT TIME',
]
