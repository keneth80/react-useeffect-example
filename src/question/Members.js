import { h, create, diff, patch } from 'virtual-dom';
import hash from 'object-hash';

import { cloneObject } from './util';

/**
* @name 생성자 함수
* @param {Array} list
* @description 생성자 함수로 최초 데이터를 받아서 virtual tree 구축과 함께 HTML node를 생성 및 저장한다.
*/
function Members({ list }) {
	// data를 저장하는 state 변수
	let state = null;
	// virtual dom tree
	let virtualDomTree = null;
	// html node
	let htmlNode = null;
	// use effect로 등록되는 callback
	const effects = {};

	/**
	* @name updateState
	* @param {*} newState
	* @description state 변경에 따른 virtual dom update
	*/
	const updateState = function (newState) {
		// state를 업데이트한다.
		state = Object.assign({}, state, newState);

		// 변경된 state 정보를 가지고 tree 를 갱신한다.
		const newVirtualDomTree = setVirtualTreeNode(state);
		// 변경된 정보를 체크한다.
		const changes = diff(virtualDomTree, newVirtualDomTree);

		// 기존 node에 변경된 tree 정보를 patch 한다.
		htmlNode = patch(htmlNode, changes);
		// 변경 된 tree 정보는 다시 새롭게 저장한다.
		virtualDomTree = newVirtualDomTree;
	};

	/**
	* @name useState
	* @param {*} value
	* @returns [현재값, 변경 함수]
	* @description react useState함수와 같은 역할
	*/
	const useState = function (value) {
		// 초기값 지정
		if (!state) {
			state = { value };
		}

		// 두번째 값인 함수로 state를 변경해야만 값이 바뀌도록 한다.
		return [
			state.value,
			list => updateState({ list })
		];
	}

	/**
	* @name useEffect
	* @param {effect, deps}
	* @returns void
	* @description effect를 실행할 함수와 의존성 데이터를 array로 받는다.
	*/
	const useEffect = function (effect, deps) {
		// q1. effect를 실행함수와 의존성 데이터를 저장하는 useEffect 함수를 작성하시오.
		// TODO: Write JS code here!'
		if (deps) {
			
		} else {
			
		}
	};

	/**
	* @name setVirtualTreeNode
	* @param {Array} list
	* @returns virtual node
	* @description list를 인자로 받아 data가 binding 된 virtual tree 구축 및 action 함수 정의.
	*/
	const setVirtualTreeNode = function ({ list }) {
		const [members, setMembers] = useState(list);

		useEffect(() => {
			// q2. effect 함수에는 document의 title에 데이터의 갯수를 표현하여 변경을 확인할 수 있도록 작성하시오.
			// TODO: Write JS code here!'
		});

		const onKeyUp = (event) => {
			if (window.event.keyCode === 13) {
				members.push(event.target.value);
				event.target.value = '';
				setMembers(members);
			}
		};

		const addRow = () => {
			members.push(htmlNode.querySelector('#memberInput').value);
			htmlNode.querySelector('#memberInput').value = '';
			setMembers(members);
		}

		return h('div', { style: 'width: 100%; margin-top: 10px' }, [
			h('div', { style: 'width: 100%; position: relative;' }, [
				h('input', { id: 'memberInput', type: 'text', onkeyup: (event) => onKeyUp(event) }, []),
				h('button', { style: 'margin-left: 10px;', onclick: () => addRow() }, ['Add']),
			]),
			h('div', { id: 'list-container', style: 'height: 300px; overflow: auto;'}, [
				members && members.length ?
				members.map((item, index) => h('span', { key: 'item' + index, style: 'display: block;' }, [item])) :
				[]
			])
		]);
	}

	function addEvent(htmlNode) {
		// 해당 이벤트로 dom update 변경을 감지하도록 한다. why? effect는 렌더링후에 실행되기 때문.
		htmlNode.addEventListener('DOMNodeInserted', (event) => {
			for (const effect in effects) {
				executeEffect(effects[effect]);
			}
		});
	}

	function executeEffect(effect) {
		// q4. effect 함수가 반환함수가 있다면 (cleanup) effect 실행전에 실행하도록 작성하시오.
		// TODO: Write JS code here!'

		// q3. 의존성 데이터 여부에 따라 effect를 실행하는 함수를 작성하시오.
		// TODO: Write JS code here!'
		// case 1) 의존성 데이터가 undefined일 경우에는 effect를 매번 실행
		// case 2) 의존성 데이터가 있을 경우에는 데이터 변경 여부를 체크하여 effect를 실행 
		// (참고: object-hash라이브러리를 통해서 변경여부를 쉽게 파악할 수 있음)
	}

	// virtual tree node를 갱신
	virtualDomTree = setVirtualTreeNode({ list });
	//virtual tree node를 html node로 생성
	htmlNode = create(virtualDomTree);
	addEvent(htmlNode);
	return htmlNode;
};

export default Members;