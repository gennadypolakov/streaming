import React from 'react';
import { Button, Div, FormLayout, PopoutWrapper } from '@vkontakte/vkui';


const Popup = (msg, confirm, dismiss) => <PopoutWrapper>
  <FormLayout
    onSubmit={e => e.preventDefault()}
    className="popup">
    <Div style={{ textAlign: 'center' }}>{msg}</Div>
    <Div style={{ display: 'flex' }}>
      <Button size="l" stretched style={{ marginRight: 8 }} onClick={confirm}>Ок</Button>
      <Button size="l" stretched level="secondary" onClick={dismiss}>Отмена</Button>
    </Div>
  </FormLayout>
</PopoutWrapper>;

export default Popup;
