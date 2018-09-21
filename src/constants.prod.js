export const serverUrl = window.location.origin
const roomBaseUrl = window.location.origin.replace(/:(\d)*$/g, '')
export const createRoomUrl = port => `${roomBaseUrl}:${port}`

export const firebaseConfig = {
    apiKey: "AIzaSyAGtltdTXQHwpBSq_LbWfSKk08CAN-GKv4",
    authDomain: "nwgame-d8f9d.firebaseapp.com",
    databaseURL: "https://nwgame-d8f9d.firebaseio.com",
    projectId: "nwgame-d8f9d",
    storageBucket: "nwgame-d8f9d.appspot.com",
    messagingSenderId: "758102331661"
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
