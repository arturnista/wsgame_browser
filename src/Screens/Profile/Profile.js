import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import './Profile.css'

const mapStateToProps = (state) => ({
    user: state.user
})
const mapDispatchToProps = (dispatch) => ({

})

class Profile extends Component {

    render() {
        if(this.props.location.pathname === '/game') return null
        
        return (
            <div className='bg-container'>
                
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
