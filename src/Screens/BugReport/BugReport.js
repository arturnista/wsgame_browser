import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button } from '../../Components'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import { serverUrl } from '../../constants'
import './BugReport.css'

const mapStateToProps = (state) => ({
    
})
const mapDispatchToProps = (dispatch) => ({

})

class BugReport extends Component {

    constructor(props) {
        super(props)

        this.state = {
            content: ''
        }

    }

    render() {
        return (
            <div className="bg-container">
                <div className="bugreport-grid">
                    <div className="bugreport-form">
                        <textarea className='bugreport-textarea'
                            value={this.state.content} 
                            onChange={e => this.setState({ content: e.target.value }) }/>
                    </div>
                    <div className="bugreport-preview">
                        <ReactMarkdown source={this.state.content} />                    
                    </div>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BugReport)
