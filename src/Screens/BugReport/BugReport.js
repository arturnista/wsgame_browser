import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button, Spinner } from '../../Components'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import Rodal from 'rodal'
import { serverUrl } from '../../constants'
import './BugReport.css'

const mapStateToProps = (state) => ({
    
})
const mapDispatchToProps = (dispatch) => ({

})

class BugReport extends Component {

    constructor(props) {
        super(props)

        this.handleCreate = this.handleCreate.bind(this)

        this.state = {
            isLoading: false,
            content: '',
            error: '',
            success: '',
        }

    }

    handleCreate() {
        if(this.state.content === '') {
            this.setState({ error: 'Please, enter a bug description' })
            return
        }

        this.setState({ isLoading: true })

        fetch(`${serverUrl}/bugreports`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: this.state.content })
        })
        .then(res => {
            if(res.status !== 200) {
                throw res
            }
            return res
        })
        .then(res => this.setState({ isLoading: false, success: 'Bug reported with success!', error: '', content: '' }))
        .catch(err => this.setState({ isLoading: false, error: 'Error on bug report.' }))
    }

    render() {
        return (
            <div className="bg-container">
                <div className="base-container br-grid">
                    <div className="br-form">
                        <h2>Bug report</h2>
                        <p>Please, describe the bug as detailed as possible.</p>
                        <p>Try to include details like how and when it happen.</p>
                        {
                            this.state.success && (
                                <div className='br-success' onClick={() => this.setState({ success: '' })}>
                                    <p>{ this.state.success }</p>
                                </div>
                            )
                        }
                        {
                            this.state.error && (
                                <div className='br-error' onClick={() => this.setState({ error: '' })}>
                                    <p>{ this.state.error }</p>
                                </div>
                            )
                        }
                        <textarea className='br-textarea'
                            value={this.state.content}
                            onChange={e => this.setState({ content: e.target.value })}
                        />
                        <Button className='br-send-button'
                            label='Send'
                            onClick={this.handleCreate}/>
                    </div>
                </div>
                <Rodal visible={this.state.isLoading}
                    showCloseButton={false}
                    closeMaskOnClick={false}
                    onClose={() => {}}>
                    <Spinner />
                </Rodal>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BugReport)
