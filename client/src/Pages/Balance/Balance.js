import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Alert, Button, Cell, Div, Group, Input, List, Panel, ScreenSpinner, Tabs, TabsItem, View, Radio} from '@vkontakte/vkui';
import Slider from '@material-ui/lab/Slider';
import connectVk from '@vkontakte/vkui-connect';
import { format } from 'date-fns';
import './main.scss';
import {balanceHistory, changeTariff, getBalance, getTariff, prolongTariff, setActiveTab, setPopup, tariffState} from '../../actions';
import PageHeader from './../../components/PageHeader';
import History from './History';
import Icon24Add from '@vkontakte/icons/dist/24/add';

class Balance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changeTariff: props.pathname === '/balance/tariff', // флаг изменения тарифа
      newAmount: 2,
      price: 150,
      totalPrice: 0,
      balance: 100,
      maxDiscount: 51, // макс скидка
      discount: 3, // скидка
      disabled: true,
      payment: 0,
      paymentSystem: 'yandex',
      receiver: 41001135399963,
      pathname: props.pathname,
      form: false
    }
  }

  componentDidMount() {
    document.title = "Баланс";
    this.props.getTariff()
      .then(status => {
        if (status) this.channelCount(this.props.tariff.amount);
        else this.channelCount(this.state.newAmount);
      });
    // if(
    //     localStorage.balance !== undefined &&
    //     localStorage.payment !== undefined &&
    //     localStorage.newAmount !== undefined
    // ) {
    //     this.setState({
    //         newAmount: localStorage.newAmount
    //     }, this.checkPayment);
    // }
    this.checkPayment();
  }

  // componentWillReceiveProps(nextProps) {
  //     this.setState({
  //         changeTariff: nextProps.pathname === '/balance/tariff'
  //     });
  // }

  static getDerivedStateFromProps(props, state) {
    let newState = {};
    let newProps = {};
    if ((props.pathname === '/balance/tariff') !== state.changeTariff) {
      newState = { ...newState, changeTariff: !state.changeTariff };
    }
    // if(props.order)
    // if (nextProps.pathname !== prevState.pathname) {
    //     newState = { ...newState, pathname: nextProps.pathname };
    // }
    // if (nextProps.balance > 0 && nextProps.tariff && nextProps.tariff.amount !== prevState.newAmount) {
    //     newState = { ...newState, disabled: false };
    // }
    // if (nextProps.balance > 0 && !nextProps.tariff) {
    //     newState = { ...newState, disabled: false };
    // }
    if (Object.keys(newProps).length > 0) props.tariffState(newProps);
    if (Object.keys(newState).length > 0) return newState;
    else return null;
  }

  popout = () => {
    switch (this.props.popout) {
      case 'hidden':
        return null;
      case 'spinner':
        return <ScreenSpinner />;
      case 'prolong':
        return this.prolongPopup();
      case 'success':
        return this.resultPopup(true);
      case 'failure':
        return this.resultPopup();
      case 'message':
        return this.resultPopup(this.props.message);
      default:
        return null;
    }
  };

  prolongPopup = () => <Alert onClose={() => this.props.setPopup('hidden')}>
    <Div>
      <Div>Текущий тариф будет продлен на 1 календарныей месяц</Div>
      <Div style={{ display: 'flex' }}>
        <Button
          size="l"
          stretched
          style={{ marginRight: 8 }}
          onClick={this.props.prolongTariff}>Ок</Button>
        <Button size="l" stretched level="secondary" onClick={() => this.props.setPopup('hidden')}>Отмена</Button>
      </Div>
    </Div>
  </Alert>;

  resultPopup = (msg = false) => {
    setTimeout(() => this.props.setPopup('hidden'), 3000)
    return <Alert onClose={() => this.props.setPopup('hidden')}>
      <Div style={msg ? { color: 'green' } : { color: 'red' }}>
        {msg === true ? 'Успешно!' : msg === false ? 'Что-то пошло не так ☹' : msg}
      </Div>
    </Alert>
  };

  channelCount = count => {
    let disabled = true;
    if (!this.props.tariff) disabled = false;
    else if (this.props.tariff && +this.props.tariff.amount !== +count) disabled = false;
    let discount = +count > 2 ? (+count - 2) * this.state.discount : 0;
    if (discount > this.state.maxDiscount) discount = this.state.maxDiscount;
    const totalPrice = Math.ceil(this.state.price * (1 + (+count - 2) * (1 - discount / 100)));
    // if (this.props.balance < totalPrice) disabled = true;
    this.setState({
      disabled,
      newAmount: +count,
      totalPrice,
      needPayment: this.props.balance < totalPrice ? totalPrice - Math.floor(this.props.balance) : 0
    })
  };

  changeTariff = () => {
    if(this.state.needPayment && this.state.needPayment > 0) {
      if(
        localStorage.balance === undefined &&
        localStorage.payment === undefined &&
        localStorage.newAmount === undefined
      ){
        localStorage.balance = this.props.balance;
        localStorage.payment = this.state.needPayment;
        localStorage.newAmount = this.state.newAmount;
      }
      this.setState({payment: this.state.needPayment});
      this.props.setActiveTab('balance', '/balance/payment');
      this.checkPayment()
        .then(() => {
          this.props.setActiveTab('balance', '/balance/tariff');
        });
    } else {
      const newAmount = localStorage.newAmount ? localStorage.newAmount : this.state.newAmount;
      this.props.changeTariff(newAmount)
        .then(status => {
          if (status) this.setState({
            disabled: true
          });
          if(
            localStorage.balance !== undefined &&
            localStorage.payment !== undefined &&
            localStorage.newAmount !== undefined
          ) {
            delete localStorage.balance;
            delete localStorage.payment;
            delete localStorage.newAmount;
          }
          this.props.getTariff()
            .then(status => {
              if (status) this.channelCount(this.props.tariff.amount);
              else this.channelCount(this.state.newAmount);
              this.props.balanceHistory();
            });
        });
    }
  };

  doPayment = () => {
    if (this.state.paymentSystem === 'yandex') {
      this.state.form.submit();
    } else if (this.state.paymentSystem === 'vkpay') {
      connectVk.send("VKWebAppOpenPayForm", {
        app_id: 6958212,
        action: 'pay-to-group',
        params: {
          amount: this.state.payment,
          description: 'пополнение баланса',
          group_id: 158819144
        }
      });
    }

  };

  checkPayment = () => {
    if(
      localStorage.balance !== undefined &&
      localStorage.payment !== undefined &&
      localStorage.newAmount !== undefined
    ){
      return new Promise(resolve => {
        const intervalId = setInterval(() => {
          this.props.getBalance()
            .then(status => {
              if (status) {
                if(+this.props.balance >= +localStorage.balance + +localStorage.payment) {
                  this.setState({ needPayment: 0 }, this.changeTariff);
                  if(this.state.intervalId) {
                    clearInterval(this.state.intervalId);
                  }
                  resolve(true);
                }
              }
            });
        }, 1000);
        this.setState({ intervalId });
      });
    }
  };

  render() {

    const { tariff, isMobile } = this.props;
    const { needPayment } = this.state;

    let buttonChangeTariff = 'Подключить тариф';

    if(tariff){
      if(needPayment && needPayment > 0){
        buttonChangeTariff = 'Пополнить баланс и изменить тариф'
      } else {
        buttonChangeTariff = 'Изменить тариф'
      }
    } else {
      if(needPayment && needPayment > 0){
        buttonChangeTariff = 'Пополнить баланс и подключить тариф'
      } else {
        buttonChangeTariff = 'Подключить тариф'
      }
    }

    let mainStyles = {
      paddingTop: (isMobile ? 5 : 60),
      paddingBottom: 60,
      color: 'gray'
    };

    return <View
      activePanel={this.props.activeTab}
      popout={this.popout()}
    >
      <Panel id={this.props.activeTab}>
        <PageHeader />
        <Group
          style={mainStyles}
          className={this.props.activeTab}
        >
          <List style={{paddingBottom: (isMobile ? '60px' : '0px')}}>
            <Cell>
              <Div>
                {this.props.pathname === '/balance' ?
                  <Div>
                    <Group title="Ваш баланс">
                      <Div className="balance__amount">
                        <Cell>{Math.floor(this.props.balance)} ₽</Cell>
                        <Div className="balance-button">
                          <Button
                            before={<Icon24Add />}
                            size="l"
                            onClick={() => this.props.setActiveTab('balance', '/balance/payment')}
                          >Пополнить</Button>
                        </Div>
                      </Div>
                    </Group>
                    <Group title="Тариф">
                      <List>
                        {this.props.tariff ?<Fragment>
                            <Cell>Количество каналов: {this.props.tariff.amount}</Cell>
                            <Cell>Тариф действителен до {format(this.props.tariff.end * 1000, 'dd.MM.yyyy')}</Cell>
                          </Fragment>
                          :
                          <Cell multiline>У вас нет активных тарифов</Cell>}
                        <Div className="balance-button">
                          <Button
                            before=""
                            size="l"
                            onClick={() => this.props.setActiveTab('balance', '/balance/tariff')}
                            style={{ marginRight: 5 }}
                          >
                            {this.props.tariff ? 'Изменить' : 'Подключить'}
                          </Button>
                          {this.props.tariff ? <Button
                            before=""
                            size="l"
                            onClick={() => this.props.setPopup('prolong')}
                          >Продлить</Button> : null}
                        </Div>
                      </List>
                    </Group>
                    <Group title="История операций">
                      <Cell multiline>
                        <History />
                      </Cell>
                    </Group>
                  </Div> : null}
                {this.props.pathname === '/balance/tariff' ?
                  <Div>
                    <Cell><Link className="back-link" to='/balance'>Назад</Link></Cell>
                    <Group title="Изменение тарифа">
                      <Cell multiline>
                        <Div className="total_price">Текущий баланс <span>{Math.floor(this.props.balance)}</span> ₽</Div>
                        <Div>Количество каналов: {this.state.newAmount}</Div>
                        <Div>
                          <Slider
                            classes={{
                              thumb: 'slider-thumb',
                              track: 'slider-track'
                            }}
                            value={+this.state.newAmount}
                            min={2}
                            max={100}
                            step={1}
                            onChange={(event, value) => this.channelCount(value)}
                          />
                        </Div>
                        <Div>Каждый следующий канал уменьшает стоимость на 3%! *</Div>
                        <Div className="total_price">Итого <span>{this.state.totalPrice}</span> ₽</Div>
                        <Div>
                          <Button
                            disabled={this.state.disabled}
                            size="l"
                            onClick={this.changeTariff}>
                            {buttonChangeTariff}
                          </Button>
                        </Div>
                        <Div>* При досрочном изменении тарифа на баланс пользователя возвращается сумма за неиспользованный период</Div>
                      </Cell>
                    </Group>
                  </Div>
                  : null}
                {this.props.pathname === '/balance/payment' ?
                  <Div>
                    <Cell><Link className="back-link"to='/balance'>Назад</Link></Cell>
                    <Group title="Пополнение баланса">
                      <Cell>Текущий баланс: {Math.floor(this.props.balance)} ₽</Cell>
                      <Cell>
                        <Div className="money-count-title">Сумма пополнения в рублях</Div>
                        <Input
                          value={String(this.state.payment)}
                          onChange={e => this.setState({ payment: e.target.value })} />
                      </Cell>
                      <Group title="Платежная система">
                        <Cell multiline>
                          <Tabs type="buttons">
                            <TabsItem
                              onClick={() => this.setState({ paymentSystem: 'yandex' })}
                              selected={this.state.paymentSystem === 'yandex'}
                            >
                              Яндекс.Деньги
                            </TabsItem>
                            <TabsItem
                              onClick={() => {
                                this._form = false;
                                this.setState({ paymentSystem: 'unitpay', form: false });
                              }}
                              selected={this.state.paymentSystem === 'unitpay'}
                            >
                              Unitpay
                            </TabsItem>
                            {this.props.vkApp ? <TabsItem
                              onClick={() => {
                                this._form = false;
                                this.setState({ paymentSystem: 'vkpay', form: false });
                              }}
                              selected={this.state.paymentSystem === 'vkpay'}
                            >
                              VK Pay
                            </TabsItem> : null}
                          </Tabs>
                          {this.state.paymentSystem === 'yandex' ?
                            <Div className="payment-system">
                              <form
                                target="_blank"
                                method="POST"
                                action="https://money.yandex.ru/quickpay/confirm.xml"
                                ref={form => {
                                  if (!this.state.form) this.setState({ form });
                                }}
                              >
                                <input type="hidden" name="receiver" defaultValue={this.state.receiver} />
                                <input type="hidden" name="quickpay-form" value="donate" />
                                <input type="hidden" name="targets" value="транзакция" />
                                <Radio name="paymentType" value="PC" defaultChecked>Яндекс.Деньгами</Radio>
                                <Radio name="paymentType" value="AC">Банковской картой</Radio>
                                <input type="hidden" name="sum" defaultValue={this.state.payment} />
                                <input type="hidden" name="label" defaultValue={this.props.user.user_id} />
                                <input type="hidden" name="successURL" value="http://streamvi.ru/balance" />
                              </form>
                            </Div>
                            : <Div className="payment-system" />}
                          <Button
                            disabled={!(((this.state.paymentSystem === 'yandex' && this.state.form) || (this.state.paymentSystem === 'vkpay' && this.props.vkApp)) && this.state.payment > 0)}
                            size="l"
                            onClick={this.doPayment}>
                            Перейти к оплате
                          </Button>
                        </Cell>
                      </Group>
                    </Group>
                  </Div>
                  : null}
              </Div>
            </Cell>
          </List>
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
    message: state.app.message,
    balance: state.balance.balance,
    tariff: state.tariffs.tariff,
    order: state.tariffs.order,
    pathname: state.router.location.pathname,
    vkApp: state.app.vkApp,
    isMobile: state.app.isMobile
  };
};

const mapDispatchToProps = {
  balanceHistory,
  changeTariff,
  getBalance,
  getTariff,
  prolongTariff,
  setActiveTab,
  setPopup,
  tariffState
};

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
