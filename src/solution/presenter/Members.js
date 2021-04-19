import { h, create, diff, patch } from 'virtual-dom';

/**
* @name 생성자 함수
* @param {Array} list
* @description 생성자 함수로 최초 데이터를 받아서 virtual tree 구축과 함께 HTML node를 생성 및 저장한다.
*/
function Members({ list }) {
	// virtual dom tree
	let virtualDomTree = null;
	// html node
	let htmlNode = null;
	// hook이 등록될때마다 state가 저장되는 변수.
	const states = [];
	// hook 실행 index
	let currentState = 0;
	// effect hook이 등록될때마다 effect가 저장되는 변수.
	const effects = [];
	// 현재 effect index
	let currentEffect = 0;

	/**
	* @name render
	* @param {*} newState
	* @description state 변경에 따른 rendering
	*/
	const render = function (state) {
		 // 새롭게 랜더링 하므로 초기화
		currentState = currentEffect = 0;
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
	const useState = function (initialValue) {
		states[currentState] = states[currentState] || initialValue;
		// updateState 함수에서 currentState가 덮어 씌워지는 것을 방지.
		const updateStateIndex = currentState;
		const updateState = (newState) => {
			states[updateStateIndex] = newState;
			// data가 업데이트 되면 re render
			render(states[updateStateIndex]);
		}

		// 두번째 값인 함수로 state를 변경해야만 값이 바뀌도록 한다.
		return [
			states[currentState++],
			updateState
		];
	}

	/**
	* @name useEffect
	* @param {effect, deps}
	* @returns void
	* @description effect를 실행할 함수와 의존성 데이터를 array로 받는다.
	*/
	const useEffect = function (effect, deps) {
		// effect를 실행하기전 cleanup이 등록이 되어 있으면 실행 후 초기화 한다.
		if (effects[currentEffect] && effects[currentEffect].cleanup) {
			effects[currentEffect].cleanup();
			effects[currentEffect].cleanup = undefined;
		}

		// effect 및 deps를 저장한다.
		if (!effects[currentEffect]) {
			effects[currentEffect] = {
				effect: undefined, // effect 함수
				prevDeps: undefined, // 이전 의존성 데이터.
				newDeps: undefined, // 새로운 의존성 데이터.
				cleanup: undefined, // cleanup을 실행할 함수.
			};
		}
		effects[currentEffect].newDeps = deps;
		effects[currentEffect].effect = effect;
		// 다음 hook을 위해 증가.
		currentEffect++;
	};

	/**
	* @name executeEffect
	* @param {effect}
	* @returns void
	* @description rendering 후에 effect를 실행.
	*/
	function executeEffect(effect) {
		// case 1) 의존성 데이터가 undefined일 경우에는 effect를 매번 실행
		// case 2) 의존성 데이터가 있을 경우에는 데이터 변경 여부를 체크하여 effect를 실행 
		if (!effect.newDeps) {
			// deps가 undefinde 일 경우 effect를 항상 실행.
			const cleanup = effect.effect();
			effect.cleanup = cleanup;
		} else {
			// 최초 effect 실행
			if (!effect.prevDeps) {
				const cleanup = effect.effect();
				effect.cleanup = cleanup;
				effect.prevDeps = effect.newDeps;
				return;
			}
			const isChangedDeps = !effect.newDeps.every((el, i) => el === effect.prevDeps[i]);
			// deps가 빈 배열이라면 최초한번만 실행이 된다. why? 체크해야할 의존성 데이터가 없기 때문에
			if (isChangedDeps) {
				effect.prevDeps = effect.newDeps;
				const cleanup = effect.effect();
				effect.cleanup = cleanup;
			}
		}
	}

	/**
	* @name setVirtualTreeNode
	* @param {Array} list
	* @returns virtual node
	* @description list를 인자로 받아 data가 binding 된 virtual tree 구축 및 action 함수 정의.
	*/
	const setVirtualTreeNode = function (list = []) {
		const [members, setMembers] = useState(list);

		useEffect(() => {
			document.title = `Member의 총인원은 ${members.length}명 입니다.`;
			return () => {
				document.title = 'React의 useEffect 따라해보기.';
			}
		}, [members.length]);

		const onKeyUp = (event) => {
			if (window.event.keyCode === 13) {
				members.push(event.target.value);
				event.target.value = '';
				setMembers(members);
			}
		};

		const addRow = () => {
			const inputElement = htmlNode.querySelector('#memberInput');
			members.push(inputElement.value);
			inputElement.value = '';
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
			effects.forEach((effect) => {
				executeEffect(effect);
			});
		});
		// element가 삭제되면 (unmount 시점) cleanup을 실행한다.
		htmlNode.addEventListener ('DOMNodeRemovedFromDocument', (event) => {
			effects.forEach((effect) => {
				if (effect.cleanup) {
					effect.cleanup();
				}
			});
		}, false);
	}

	// virtual tree node를 갱신
	virtualDomTree = setVirtualTreeNode(list);
	//virtual tree node를 html node로 생성
	htmlNode = create(virtualDomTree);
	addEvent(htmlNode);
	return htmlNode;
};

export default Members;