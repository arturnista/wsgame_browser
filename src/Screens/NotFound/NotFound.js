import React, { Component } from 'react'
import { Input, Button } from '../../Components'
import './NotFound.css'

class NotFound extends Component {

    constructor(props) {
        super(props)

    }

    render() {

        return (
            <div className='bg-container nf-container'>
                <div className='base-container nf-content'>
                    <h2>404 not found</h2>
                </div>
            </div>
        )

    }
}

export default NotFound
