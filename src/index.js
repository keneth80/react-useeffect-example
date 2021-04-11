import './style.css';

import Members from './solution/presenter/Members';

const excute = () => {
    const targetEl = document.querySelector('#result');

    const member = new Members({ list: [] });
    targetEl.appendChild(member);
};

excute();