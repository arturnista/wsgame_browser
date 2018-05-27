import React, { Component } from 'react'
import './Input.css'

class Input extends Component {
    render() {
        return (
            <div className={'input-container ' + this.props.className}>
                <p className='input-label'>{this.props.label}</p>
                <input className='input' placeholder={this.props.placeholder}
                    value={this.props.value} 
                    onChange={e => this.props.onChange(e.target.value)} />
            </div>
        )
    }
}

export default Input
