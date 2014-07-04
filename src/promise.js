/**
 * @namespace promise
 */
var promise = {
	/**
	 * "Unboxed" Promise factory
	 *
	 * @method factory
	 * @memberOf promise
	 * @return {Object} {@link Promise}
	 */
	factory : function () {
		var promise, pCatch, pRace, pResolve, pReject, pThen;
		
		promise = new Promise( function ( resolve, reject ) {
			pResolve = resolve;
			pReject  = reject;
		} );

		pCatch = function () {
			return promise["catch"].apply( promise, arguments );
		};

		pRace = function () {
			return promise.race.apply( promise, arguments );
		};

		pThen = function () {
			return promise.then.apply( promise, arguments );
		};

		return {"catch": pCatch, race: pRace, resolve: pResolve, reject: pReject, then: pThen};
	}
};
