export function cloneObject(obj) {
    if (!obj) return undefined;

	if (typeof(obj) !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return JSON.parse(JSON.stringify(obj));
	}
	
    const clone = {};
    for(let i in obj) {
        if(typeof(obj[i]) == 'object' && obj[i] != null)
            clone[i] = cloneObject(obj[i]);
        else
            clone[i] = obj[i];
    }
    return clone;
}


export const ReactSimilar = (function() {
    // Hook 배열과 반복자
    let hooks = [], currentHook = 0;
    return {
        render(Component) {
            const Comp = Component() // 이펙트들이 실행된다.
            Comp.render()
            currentHook = 0 // 다음 렌더를 위해 초기화
            return Comp;
        },

        useEffect(effect, deps) {
            const hasNoDeps = !depArray;
            const currentDeps = hooks[currentHook];
            const hasChangedDeps = currentDeps ? !deps.every((el, i) => el === currentDeps[i]) : true;
            if (!deps || hasChangedDeps) {
                effect();
                hooks[currentHook] = depArray
            }
            // 실행했으므로 완료 처리 한다.
            currentHook++;
        },

        /**
        * @name useState
        * @param {*} value
        * @returns [현재값, 변경 함수]
        * @description react useState함수와 같은 역할
        */
        useState(initialValue) {
            // hook을 실행하지 않았다면 초기값만 반환.
            hooks[currentHook] = hooks[currentHook] || initialValue;
            const setStateHookIndex = currentHook;
            const setState = (newState) => (hooks[setStateHookIndex] = newState)
            return [hooks[currentHook++], setState]
        },
    }
})();
