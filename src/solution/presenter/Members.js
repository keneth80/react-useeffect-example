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
		// 최초 effect 및 deps를 저장한다.
		if (deps) {
			// deps가 있을 경우에는 데이터 체크를 위해 저장소를 준비.
			if (!effects[effect]) {
				effects[effect] = {
					effect,
					prevDeps: undefined, // 이전 의존성 데이터.
					newDeps: undefined, // 새로운 의존성 데이터.
					cleanup: undefined, // cleanup을 실행할 함수.
				};
			}
			effects[effect].newDeps = cloneObject(deps);
		} else {
			// deps가 없을 경우에는 effect만 필요
			if (!effects[effect]) {
				effects[effect] = {};
			}
		}
		effects[effect].effect = effect;
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
			document.title = `Member의 총인원은 ${members.length}명 입니다.`;
			return () => {
				document.title = 'React의 useEffect 따라해보기.';
			}
		}, [members]);

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
		// element가 삭제되면 cleanup을 실행한다.
		htmlNode.addEventListener ('DOMNodeRemovedFromDocument', (event) => {
			for (const effect in effects) {
				effects[effect].cleanup();
			}
		}, false);
	}

	function executeEffect(effect) {
		// effect를 실행하기전 cleanup이 등록이 되어 있으면 실행한다.
		if (effect.cleanup) {
			effect.cleanup();
		}
		
		// 최초 실행.
		if (!effect.newDeps) {
			// deps가 undefinde 일 경우 effect를 항상 실행.
			const cleanup = effect.effect();
			effect.cleanup = cleanup;
		} else {
			// 최초 effect 실행
			if (!effect.prevDeps) {
				const cleanup = effect.effect();
				effect.cleanup = cleanup;
				effect.prevDeps = deps;
				return;
			}
			// deps가 빈 배열이라면 최초한번만 실행이 된다. why? 체크해야할 의존성 데이터가 없기 때문에
			// 자세한 내용은 https://rinae.dev/posts/a-complete-guide-to-useeffect-ko 참조
			for (let index = 0; index < effect.newDeps.length; index++) {
				const arg = effect.newDeps[index];
				// object값의 변경을 체크하기 위해 hash 라이브러리를 써서 체크하도록 하였음.
				if (hash(arg) !== hash(effect.prevDeps[index])) {
					// 변경에 대한 상태를 업데이트 한다.
					effect.prevDeps[index] = cloneObject(arg);
					const cleanup = effect.effect();
					effect.cleanup = cleanup;
					break;
				}
			}
		}
	}

	// virtual tree node를 갱신
	virtualDomTree = setVirtualTreeNode({ list });
	//virtual tree node를 html node로 생성
	htmlNode = create(virtualDomTree);
	addEvent(htmlNode);
	return htmlNode;
};

export default Members;