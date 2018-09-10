import React, { Component } from 'react'
import { connect } from 'react-redux'
import firebase from '../Utils/firebase'
import firebaseui from 'firebaseui'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { Redirect, Link } from 'react-router-dom'
import { Input } from './'

import './Login.css'

export default (props) => {
    const uiConfig = {
        signInFlow: 'popup',
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        signInSuccessUrl: '/',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
        // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: props.onSignIn
        }
    }

    return (
        <div className="login-container">
            <h2 className='login-text'>Sign in</h2>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
            <h2 className='login-text'>Or</h2>
            <Input label='Name' placeholder='Guest name...' value={props.guestName} onChange={props.onGuestNameChange}/>
            <p className='login-text guest' onClick={props.onPlayAsGuest}>Play as a guest!</p>
        </div>
    )

}