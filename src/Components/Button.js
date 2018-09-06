import React, { Component } from 'react'
import './Button.css'

const Button = (props) => (
    <div className={'button-container ' + props.className}
        onClick={props.onClick}>
        <p className='button-label'>{props.label}</p>
    </div>
)

export default Button
