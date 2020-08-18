import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { FixedLayout, HorizontalScroll, PanelHeader, Tabs, TabsItem, Epic, Tabbar, TabbarItem, View, Panel } from '@vkontakte/vkui';
import { setActiveTab } from './../actions';
import Icon24Reorder from '@vkontakte/icons/dist/24/reorder';
import Icon24Similar from '@vkontakte/icons/dist/24/similar';
import Icon24User from '@vkontakte/icons/dist/24/user';
import Icon24Users from '@vkontakte/icons/dist/24/users';
import Icon24Coins from '@vkontakte/icons/dist/24/coins';

class PageHeader extends Component {

    render() {
        let menuType;

        if (this.props.isMobile) {
            menuType = <Epic activeStory={this.props.activeTab} tabbar={
                <Tabbar>
                  <TabbarItem
                    onClick={() => this.props.setActiveTab('translations')}
                    selected={this.props.activeTab === 'translations'}
                    text="Трансляции"
                  ><Icon24Similar /></TabbarItem>
                  <TabbarItem
                    onClick={() => this.props.setActiveTab('partner')}
                    selected={this.props.activeTab === 'partner'}
                    text="Партнерам"
                  ><Icon24Users /></TabbarItem>
                  <TabbarItem
                    onClick={() => this.props.setActiveTab('balance')}
                    selected={this.props.activeTab === 'balance'}
                    text="Баланс"
                  ><Icon24Coins /></TabbarItem>
                  {/*
                  <TabbarItem
                    onClick={() => this.props.setActiveTab('account')}
                    selected={this.props.activeTab === 'account'}
                    text="Аккаунт"
                  ><Icon24User /></TabbarItem>
                  */}
                  <TabbarItem
                    onClick={() => this.props.setActiveTab('menu')}
                    selected={this.props.activeTab === 'menu'}
                    text="Меню"
                  ><Icon24Reorder /></TabbarItem>
                </Tabbar>
              }>
            </Epic>
        } else {
            menuType = <FixedLayout vertical="top">
                <Tabs theme="header" type="buttons">
                    <HorizontalScroll>
                        <TabsItem
                            onClick={() => this.props.setActiveTab('translations')}
                            selected={this.props.activeTab === 'translations'}
                        >Трансляции</TabsItem>
                        {/* <TabsItem
                            onClick={() => this.props.setActiveTab('video')}
                            selected={this.props.activeTab === 'video'}
                        >Видео</TabsItem>
                        <TabsItem
                            onClick={() => this.props.setActiveTab('market')}
                            selected={this.props.activeTab === 'market'}
                        >Биржа</TabsItem>
                        <TabsItem
                            onClick={() => this.props.setActiveTab('schedule')}
                            selected={this.props.activeTab === 'schedule'}
                        >Расписание</TabsItem> */}
                        <TabsItem
                            onClick={() => this.props.setActiveTab('partner')}
                            selected={this.props.activeTab === 'partner'}
                        >Партнерская программа</TabsItem>
                        <TabsItem
                            onClick={() => this.props.setActiveTab('balance')}
                            selected={this.props.activeTab === 'balance'}
                        >Баланс</TabsItem>
                        <TabsItem
                            onClick={() => this.props.setActiveTab('account')}
                            selected={this.props.activeTab === 'account'}
                        >Аккаунт</TabsItem>
                    </HorizontalScroll>
                </Tabs>
            </FixedLayout>
        }

        return <Fragment>
            <PanelHeader noShadow>
                StreamVi
			</PanelHeader>
            { menuType }
        </Fragment>;
    }
}
const mapStateToProps = state => {
    return {
        activeTab: state.app.activeTab,
        isMobile: state.app.isMobile
    };
};

const mapDispatchToProps = {
    setActiveTab
}

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);