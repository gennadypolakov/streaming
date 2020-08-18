import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Div } from '@vkontakte/vkui';
import './main.scss';
import { balanceHistory } from '../../actions';
import {format} from "date-fns";


class History extends Component {

  componentDidMount() {
    this.props.balanceHistory();
  }


  render() {

    return this.props.history && this.props.history.length > 0 ? <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Сумма</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
      {this.props.history.map( (t, i) => <tr key={i}>
        <td>{format(t.date * 1000, 'dd.MM.yyyy')}</td>
        <td><span style={ t.type === '+' ? { color: 'green' } : { color: 'red' } }>{t.type}</span>{Math.floor(t.sum)}</td>
        <td>{t.description}</td>
      </tr>)}
      </tbody>
      </table> : <Div>Финансовых операций в базе не обнаружено</Div>;
  }
}

const mapStateToProps = (state) => {
  return {
    history: state.balance.history,
    loaded: state.balance.loaded
  }
};

const mapDispatchToProps = {
  balanceHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(History);

