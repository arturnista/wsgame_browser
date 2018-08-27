import _ from 'lodash'

export
const name = () => {
    const first = ['External', 'Dramater', 'Terminal', 'Injurial', 'Concers', 'Sease', 'Anything']
    const second = ['Massive', 'Britary', 'Universe', 'Remaint', 'Eletronic', 'Cursed', 'Rasengan']

    return _.sample(first) + ' ' + _.sample(second)
}