import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

class Header extends Component {

    render() {
        if(this.props.location.pathname === '/game') return null
        
        return (
            <div className="header-container">
                <Link to='/' className='header-title'>
                    <h1>NW GAME</h1>
                    <small>v0.2.1</small>
                </Link>
                <Link to='/' className={`header-link ${ this.props.location.pathname === '/' ? 'active' : ''} `}>
                    <p>Home</p>
                </Link>
                <Link to='/whatsnew' className={`header-link ${ this.props.location.pathname === '/whatsnew' ? 'active' : ''} `}>
                    <p>Whats new?</p>
                </Link>
                <Link to='/bugreport' className={`header-link ${ this.props.location.pathname === '/bugreport' ? 'active' : ''} `}>
                    <p>Found a bug?</p>
                </Link>
            </div>
        )

    }
}

export default Header
