import React, { Component } from 'react'
import './Button.css'

class Button extends Component {
    render() {
        return (
            <div className={'button-container ' + this.props.className}
                onClick={this.props.onClick}>
                <p className='button-label'>{this.props.label}</p>
            </div>
        )
    }
}

export default Button
