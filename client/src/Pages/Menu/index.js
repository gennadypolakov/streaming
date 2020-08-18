import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Cell, Div, Group, List, Panel, View, PanelHeader, HeaderButton } from '@vkontakte/vkui';
import PageHeader from './../../components/PageHeader';

import { setActiveTab } from './../../actions';

import Icon24User from '@vkontakte/icons/dist/24/user';
import Icon24Users from '@vkontakte/icons/dist/24/users';
import Icon24BrowserBack from '@vkontakte/icons/dist/24/browser_back';
import Icon24Coins from '@vkontakte/icons/dist/24/coins';

import './main.scss';

class Menu extends Component {
    render() {
        const { activeTab, setActiveTab, user, isMobile } = this.props;

        return  <View activePanel={activeTab}>
                    <Panel id={activeTab}>
                        <PageHeader />
                        <Div className={activeTab}>
                            <Group>
                                <List>
                                    <Cell expandable before={<Icon24Coins />}>
                                        Биржа
                                    </Cell>
                                    <Cell expandable before={<Icon24Users />}>
                                        Видео
                                    </Cell>
                                    <Cell expandable before={<Icon24User />}
                                          onClick={() => setActiveTab('account')}
                                    >
                                        Аккаунт
                                    </Cell>
                                </List>
                            </Group>
                        </Div>
                    </Panel>
                </View>
    }
}

const mapStateToProps = state => {
    return {
        activeTab: state.app.activeTab,
        popout: state.app.popout,
        user: state.app.user,
        isMobile: state.app.isMobile
    };
};

const mapDispatchToProps = {
    setActiveTab
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
