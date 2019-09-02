import React, { Component } from 'react'
import { useDrag } from 'react-dnd'
import SpellsDndTypes from './SpellsDndTypes'

export default function SpellItem({ isSelected, focus, onFocus, spell } = {}) {
    const [{ isDragging }, drag] = useDrag({
        item: { spell, type: SpellsDndTypes.SPELL },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        begin: () => onFocus(spell),
        isDragging: () => true
    })

    return (
        <div ref={drag} className={"room-spell " + (isSelected ? 'selected ' : ' ') + (focus? 'focus ' : ' ') + (isDragging? 'dragging ' : ' ')}
            onClick={() => onFocus(spell)}>
            <p className="room-spell-name">{spell.name}</p>
            <div className='room-spell-icon-container'>
                <img className="room-spell-icon" src={`/img/game/${spell.id}.png`}/>
            </div>
        </div>
    )
}