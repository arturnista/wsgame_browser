import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button } from '../../Components'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import articles from './articles'
import './WhatsNew.css'

const mapStateToProps = (state) => ({
    user: state.user,
    room: state.room,
})
const mapDispatchToProps = (dispatch) => ({

})

class WhatsNew extends Component {

    constructor(props) {
        super(props)

        this.state = {
        }

    }

    render() {

        return (
            <div className="bg-container">
                <div className='wn-container'>
                    <div className='wn-sidebar'>
                        <h2>Articles: </h2>
                        { articles.map(a => <p className='wn-sidebar-item selected'>{moment(a.date).format('DD/MM/YY')} - {a.title}</p>) }
                    </div>
                    <div className='wn-news-content'>
                        <h2 className='wn-news-title'><span className='wn-news-title-date'>{moment(articles[0].date).format('DD/MM/YY')}</span> {articles[0].title}</h2>
                        <ReactMarkdown className='wn-news-article' source={articles[0].content} />
                    </div>
                </div>
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WhatsNew)
