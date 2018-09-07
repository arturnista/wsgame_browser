import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input, Button, Spinner } from '../../Components'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import { serverUrl } from '../../constants'
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
            isLoading: true,
            articles: [],
            articleIndex: 0
        }

    }

    componentDidMount() {
        fetch(`${serverUrl}/articles`)
        .then(res => res.json())
        .then(articles => this.setState({ isLoading: false, articles }))
    }

    render() {

        const currentArticle = this.state.articles[this.state.articleIndex]

        return (
            <div className="bg-container">
                {
                    this.state.isLoading ? <Spinner /> :
                    <div className='wn-container'>
                            <div className='base-container wn-sidebar'>
                                <h2>Articles: </h2>
                                { this.state.articles.map((a, i) => (
                                        <p className={`wn-sidebar-item ${this.state.articleIndex === i ? 'selected' : ''}`} 
                                            onClick={() => this.setState({ articleIndex: i })}>
                                            {moment(a.date).format('DD/MM/YY')} - {a.title}
                                        </p>
                                    ))
                                }
                            </div>
                            {
                                !currentArticle ? <div className='base-container wn-news-content'></div> :
                                <div className='base-container wn-news-content'>
                                    <h2 className='wn-news-title'>
                                        <span className='wn-news-title-date'>{moment(currentArticle.date).format('DD/MM/YY')}</span> 
                                        {currentArticle.title}
                                    </h2>
                                    <ReactMarkdown className='wn-news-article' source={currentArticle.content} />
                                </div>
                            }
                    </div>
                }
            </div>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WhatsNew)
