import React, {Component} from 'react'
import './App.css'

export default
class App extends Component {

    render(){
        return(
            <div>
                <div>
                    <p>AEHO</p>
                </div>

                <div className="main-content container-fluid">
                    {this.props.children}
                </div>

                <div className="well text-center page-footer">
                    <p>Dev by Artur Morelle Nista - All Hail Lorek - Vsf bob</p>
                </div>
            </div>
        )
    }

}
