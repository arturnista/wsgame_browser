import React, { Component } from 'react'
import { useDrop } from 'react-dnd'
import SpellsDndTypes from './SpellsDndTypes'

export default function SpellContainer({ index, currentSpell, spell, hotkey, onSelect, onToggle, onDeselect } = {}) {
    const [{ canDrop, isOver }, drop] = useDrop({
        accept: SpellsDndTypes.SPELL,
        drop: (dropResult) => {
            onSelect(index, dropResult.spell)
            return { name: 'Container', index }
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })


    return (
        <div ref={drop} className={"room-spell-container " + (currentSpell ? 'selected ' : ' ') + (canDrop ? 'can-drop ' : ' ') + (isOver ? 'is-over ' : ' ') }
            onClick={(e) => onToggle(index, e)}
            onContextMenu={(e) => onDeselect(index, e)} >
            { currentSpell && <p className="room-spell-name">{spell.name}</p> }
            { currentSpell && 
                <div className='room-spell-icon-container'>
                    <img className="room-spell-icon" src={`/img/game/${spell.id}.png`}/>
                </div>
            }
            <div className="room-spell-hotkey-container">
                <p className="room-spell-hotkey">{hotkey.toUpperCase()}</p>
            </div>
        </div>
    )
}