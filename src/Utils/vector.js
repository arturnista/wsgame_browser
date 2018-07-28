const vector = {

    isEqual: (pos1, pos2) => {
        if(!pos1 || !pos2) return false
        return pos1.x === pos2.x && pos1.y === pos2.y
    },

    multiply: (vec1, vec2) => {
        if(vec1 == null) throw new Error('Vector 1 is undefined')
        if(vec2 == null) throw new Error('Vector 2 is undefined')
        if(typeof vec2 === 'number') vec2 = { x: vec2, y: vec2 }

        return {
            x: vec2.x * vec1.x,
            y: vec2.y * vec1.y
        }
    },

    add: (pos1, pos2) => {
        if(pos1 == null) throw new Error('Position 1 is undefined')
        if(pos2 == null) throw new Error('Position 2 is undefined')

        return {
            x: pos2.x + pos1.x,
            y: pos2.y + pos1.y
        }
    },

    sub: (pos1, pos2) => {
        if(pos1 == null) throw new Error('Position 1 is undefined')
        if(pos2 == null) throw new Error('Position 2 is undefined')

        return {
            x: pos2.x - pos1.x,
            y: pos2.y - pos1.y
        }
    },

    length: (vector) => {
        if(vector == null) throw new Error('Vector is undefined')

        const len = Math.abs(vector.x) + Math.abs(vector.y)
        return len
    },

    distance: (pos1, pos2) => {
        if(pos1 == null) throw new Error('Position 1 is undefined')
        if(pos2 == null) throw new Error('Position 2 is undefined')

        const dist = Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
        return Math.sqrt(dist)
    },

    direction: (pos1, pos2) => {
        if(pos1 == null) throw new Error('Position 1 is undefined')
        if(pos2 == null) throw new Error('Position 2 is undefined')

        let dir = {
            x: pos2.x - pos1.x,
            y: pos2.y - pos1.y
        }
        return vector.normalize(dir)
    },

    normalize: (vec) => {
        if(vec == null) throw new Error('Vector is undefined')

        const tot = vector.length(vec)
        if(tot === 0) return { x: 0, y: 0 }
        return {
            x: vec.x / tot,
            y: vec.y / tot,
        }
    },

    moveTowards: (current, target, value) => {
        if(value < 0) value *= -1

        const norm = vector.normalize(current)

        let xToSum = ( norm.x * value )
        let yToSum = ( norm.y * value )

        let xFinal = target.x
        let yFinal = target.y
        
        if(current.x > target.x) {
            if(current.x - xToSum < target.x) xFinal = target.x
            else xFinal = current.x - xToSum
        } else if(current.x < target.x) {
            if(current.x - xToSum > target.x) xFinal = target.x
            else xFinal = current.x - xToSum
        }

        if(current.y > target.y) {
            if(current.y - yToSum < target.y) yFinal = target.y
            else yFinal = current.y - yToSum
        } else if(current.y < target.y) {
            if(current.y - yToSum > target.y) yFinal = target.y
            else yFinal = current.y - yToSum
        }

        return {
            x: xFinal,
            y: yFinal,
        }
    },

}

export default vector