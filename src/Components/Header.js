import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import './Header.css'

const mapStateToProps = (state) => ({
    user: state.user
})
const mapDispatchToProps = (dispatch) => ({

})

class Header extends Component {

    render() {
        if(this.props.location.pathname === '/game') return null
        
        return (
            <div className="header-container">
                <Link to='/' className='header-title'>
                    <h1>Mage Arena</h1>
                    <small>v0.7.2</small>
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
                {
                    this.props.user.type === 'guest' ?
                        <div to='/login' onClick={this.props.onLogin} className='header-link'>
                            <p>Login</p>
                        </div>
                    :
                        <Link to='/profile' className={`header-link ${ this.props.location.pathname === '/profile' ? 'active' : ''} `}>
                            <p>Profile</p>
                        </Link>
                }
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
