import React, { Component } from 'react';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';
import { Avatar, Button, Cell, Div } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { logout } from './../actions';

class User extends Component {

    logout = () => {
        Cookies.remove('token');
        this.props.logout();
        window.location.assign('/');
    }

    render() {
        const user = this.props.user;
        return user && !this.props.vkApp ? <Div className="user">
            <Cell style={{padding: '0px 15px'}}
                before={<Avatar src={user.photo} />}
                asideContent={<Button onClick={this.logout} level="outline" style={{marginLeft: '12px'}}>Выйти</Button>}
            >
                {user.first_name + ' ' + user.last_name}
            </Cell>
        </Div> : null;
    }
}

const mapStateToProps = state => {
    return {
        user: state.app.user,
        vkApp: state.app.vkApp
    };
};

const mapDispatchToProps = {
    logout
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
