/**
 * Simple component that shows different connection errors to the user.
 * Since errors may come in different forms, this component tests quite a lot of possibilities
 */
import React, { Component } from 'react';

export default class ConnectionError extends Component {

    render(){
        const error = this.props.error;
        console.log('error:', error);
        console.log('error response:', error.response);
        let response;
        if (error.response) response = error.response;
        else if (error.responseObject) response = error.responseObject;
            return(
                <div className='container'>
                    <h3>Det skjedde noe feil ...</h3>
                    { error.message && <p>{error.message}</p>}
                    { response && response.status && <p>Error { response.status }: { response.statusText }</p>}
                    { response && response.data && response.data.message && <p>{response.data.message}</p> }
                    { response && response.data && response.data.details && <p>{response.data.details}</p> }
                    { error.details && <p>Svar fra server: { error.details }</p>}
                    { this.props.linkComponent && this.props.linkComponent }

                </div>
            )
        }
}
