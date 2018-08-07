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
            articles: [],
            articleIndex: 0
        }

    }

    componentDidMount() {
        fetch(`${serverUrl}/articles`)
        .then(res => res.json())
        .then(articles => this.setState({ articles }))
    }

    render() {

        const currentArticle = this.state.articles[this.state.articleIndex]

        return (
            <div className="bg-container">
            
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BugReport)
