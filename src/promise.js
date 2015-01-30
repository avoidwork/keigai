/**
 * @namespace promise
 */
let promise = {
	/**
	 * "Unboxed" Promise factory
	 *
	 * @method factory
	 * @memberOf promise
	 * @return {Object} {@link Promise}
	 */
	factory: () => {
		let promise, pCatch, pResolve, pReject, pThen;

		promise = new Promise( ( resolve, reject ) => {
			pResolve = resolve;
			pReject = reject;
		} );

		pCatch = ( ...args ) => {
			return promise.catch.apply( promise, args );
		};

		pThen = ( ...args ) => {
			return promise.then.apply( promise, args );
		};

		return { "catch": pCatch, resolve: pResolve, reject: pReject, then: pThen };
	}
};
