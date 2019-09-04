export function playSpellSound(soundName) {
    const sound = window.PIXI.sound.find(soundName)
    sound.volume = .2 + Math.random() * .1
    sound.filters = [new window.PIXI.sound.filters.EqualizerFilter(re(), re(), re(), re(), re(), re(), re(), re(), re(), re())];
    sound.play()
}

function re() {
    return -3 + Math.random() * 6
}