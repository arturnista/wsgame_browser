import React, { Component } from 'react'
import { connect } from 'react-redux'
import firebase from '../../Utils/firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { Redirect, Link } from 'react-router-dom'

import './Login.css'

const mapStateToProps = (state) => ({
    
})
const mapDispatchToProps = (dispatch) => ({
    
})

class Login extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isSignedIn: false
        }
    }

    render() {
        if(this.state.isSignedIn) return <Redirect to='/' />

        const uiConfig = {
            signInFlow: 'popup',
            signInSuccessUrl: '/',
            signInOptions: [
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
            ],
        }

        return (
            <div className="bg-container">
                <div className="login-container">
                    <h2 className='login-text'>Sign in</h2>
                    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
                    <h2 className='login-text'>Or</h2>
                    <Link to='/' className='login-text'>Play as a guest!</Link>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)