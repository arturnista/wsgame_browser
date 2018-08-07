import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

class Header extends Component {

    render() {

        return (
            <div className="header-container">
                <Link to='/' className='header-title'>
                    <h1>NW GAME</h1>
                    <small>v0.2.0</small>
                </Link>
                <Link to='/whatsnew' className='header-link'>
                    <p>Whats new?</p>
                </Link>
                <Link to='/bugreport' className='header-link'>
                    <p>Found a bug?</p>
                </Link>
            </div>
        )

    }
}

export default Header
