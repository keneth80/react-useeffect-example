import './style.css';

import Members from './question/Members';

const excute = () => {
    document.querySelector('#remove-btn').addEventListener('click', () => {
        targetEl.removeChild(member);
    });

    const targetEl = document.querySelector('#result');

    const member = new Members({ list: [] });
    targetEl.appendChild(member);
};

excute();