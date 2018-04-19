import React, { Component } from 'react'
import { Header } from './Components'
import { Router, Route } from 'react-router'
import { App, Start, Room, NotFound } from './Screens'
import createBrowserHistory from 'history/createBrowserHistory'
import './Root.css'

const history = createBrowserHistory()

class Root extends Component {

    render() {

        return (
            <Router history={history}>
                <div style={{ flex: 1 }}>
                    <Route path="/" component={Header} />
                    <Route exact path="/" component={Start} />
                    <Route exact path="/room" component={Room} />
                </div>
            </Router>
        )

    }
}

export default Root
