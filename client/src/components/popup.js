import React from 'react';
import { Alert, Avatar, Button, Cell, Checkbox, Div, File, FixedLayout, FormLayout, Header, Input, Group, Link, Select } from '@vkontakte/vkui';

const popup = {
    close: null
}

export default (name = 'close', _this) => {
    const popup = {
        close: null,
        formAddAlbum: <Alert>
            <FormLayout>
                <Input
                    top="Название"
                    alignment="left"
                    onChange={e => _this.setState({ newAlbum: e.target.value })}
                />
                <Div style={{ display: 'flex' }}>
                    <Button
                        size="l"
                        stretched
                        style={{ marginRight: 8 }}
                        onClick={_this.addAlbum}
                    >Сохранить</Button>
                    <Button
                        size="l"
                        stretched
                        level="secondary"
                        onClick={() => {
                            _this.setState({ newAlbum: false });
                            _this.props.popoutNull();
                        }}
                    >Отмена</Button>
                </Div>
            </FormLayout>
        </Alert>
    }
    return popup[name];
};