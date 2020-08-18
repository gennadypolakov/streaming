import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Alert, Cell, Div, Group, Input, List, Panel, View} from '@vkontakte/vkui';
import { format } from 'date-fns';
import Icon24Copy from '@vkontakte/icons/dist/24/copy';
import CopyToClipboard from 'react-copy-to-clipboard';

import User from './../../components/User';
import PageHeader from './../../components/PageHeader';
import { referrals as getReferrals, setPopup } from '../../actions';

import './main.scss';

class Partner extends Component {

  componentDidMount() {
    document.title = "Партнерская программа";
    this.props.getReferrals();
  }

  popout = () => {
    switch (this.props.popout) {
      case 'hidden':
        return null;
      case 'success':
        return this.popup();
      default:
        return null;
    }
  };

  popup = () => {
    setTimeout(() => this.props.setPopup('hidden'), 1000);
    return <Alert onClose={() => this.props.setPopup('hidden')}>
      <Div style={{ color: 'green' }}>
        Скопировано!
      </Div>
    </Alert>
  };

  copyLink = () => {
    // let copyText = document.getElementById('reflink');
    // copyText.focus();
    // copyText.select();
    // document.execCommand('copy');
    this.props.setPopup('success');
  };


  render() {

    const { activeTab, popout, profit, referrals, user, isMobile } = this.props;

    let mainStyles = {
      paddingTop: (isMobile ? 10 : 60),
      paddingBottom: 60,
      color: 'gray'
    };

    const reflink = `${window.location.protocol}//${window.location.host}/p/${user.ref_id}`;

    return <View
      activePanel={activeTab}
      popout={this.popout()}
    >
      <Panel id={activeTab}>
        <PageHeader />
        <Group
          style={mainStyles}
          className={activeTab}
        >
          {/** {user ? <User /> : null} **/}
          <Div>
            <Group title="Ваша ссылка для привлечения партнеров">
              <Div className='input-copy'>
                <Input
                  id='reflink'
                  disabled
                  value={reflink}
                />
                <CopyToClipboard
                  text={reflink}
                  onCopy={this.copyLink}>
                  <Icon24Copy/>
                </CopyToClipboard>
              </Div>
            </Group>
            <Group title="Бонус клиентам">
              <Div className="information">
                При регистрации по Вашей партнерской ссылке клиент получает бонус - 300 руб на баланс своего аккаунта.<br />
                Высокая комисссия в размере 30% от всех платежей привлеченных партнеров.
              </Div>
            </Group>
            <Group title="Статистика">
              <Div className="information">
                Детальная статистика по числу рефералов и заработанным средствам.
              </Div>
            </Group>
            <Group title={`Партнеры: ${user.partners}`} />
            <Group title={`Заработано: ${Math.floor(profit)} ₽`}>
              {referrals && referrals.length > 0 ?
                <List>
                  {referrals.map((ref, i) => <Cell
                    before={`${Math.floor(ref.sum)} ₽`}
                    size="l"
                    multiline
                    key={i}
                    asideContent={format(ref.date * 1000, 'dd.MM.yyyy')}
                    bottomContent={ref.description}
                  >
                    {ref.name} {ref.fename}
                  </Cell>)}
                </List>
                : null}
            </Group>
          </Div>
        </Group>
      </Panel>
    </View>
  }
}

const mapStateToProps = state => {
  return {
    activeTab: state.app.activeTab,
    popout: state.app.popout,
    user: state.app.user,
    referrals: state.balance.referrals,
    profit: state.balance.profit,
    isMobile: state.app.isMobile
  };
};

const mapDispatchToProps = {
  getReferrals,
  setPopup
};

export default connect(mapStateToProps, mapDispatchToProps)(Partner);
