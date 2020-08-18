import React from 'react';
import { Spinner } from '@vkontakte/vkui';

export default () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
            <Spinner size="large" style={{ marginTop: 30, marginBottom: 30 }} />
        </div>
    );
}

export const LoadData = <div
    style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%'
    }}>
    <Spinner size="large" style={{ marginTop: 10, marginBottom: 10 }} />
</div>

export const Success = <div style={{
    marginTop: 10,
    marginBottom: 10,
    fontSize: 15,
    color: 'green',
    textAlign: 'center',
    width: '100%'
}}>Успешно!</div>

export const Failure = (msg = false) => <div style={{
    marginTop: 10,
    marginBottom: 10,
    color: 'red',
    textAlign: 'center',
    fontSize: 15,
    width: '100%'
}}>{msg || 'Что-то пошло не так ☹'}</div>
