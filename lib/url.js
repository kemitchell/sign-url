'use strict';

/**
 * Simple url signing - sign urls to protect someone from tampering with it.
 *
 * This is a very cheap way of protecting the data inside an url from tampering, so you
 * may rely on it actually being trusted. For example, the expiry in some kind of reset link
 * could be encoded in the url, and then signed, meaning you do not have to keep track
 * of the actual expiry server-side.
 *
 * Example:
 *   var url = "http://my.superproject.io?confirm=username@somewhwere.com&expiry=' + Date.now() + 3600000;
 *   var signed = Sign.url(url, '@#ES@#@#$@#$#@$DFWE' );
 *
 *   // gets you somethign like
 *   "http://my.superproject.io?confirm=username@somewhere.com&expiry=1392305771282&signature=SrO0X9p27LHFIe7xITBOpetZSpM%3D'
 *
 */

var crypto = require('crypto'),
    Query = require('querystring'),
    Url = require('url');

var _stringifySorted = function(query) {
    var keys = Object.keys(query).sort();

    var pairs = keys.reduce(function(collect, key) {
        return collect.concat(Query.escape(key) + '=' + Query.escape(query[key]));
    }, []);

    return pairs.join('&');
};

var Sign = {
    /**
     * Create a signature for a given URL. The signature should be appended to the query string.
     * For the available optionsrythms, see [crypto](http://nodejs.org/api/crypto.html#crypto_crypto_createhash_optionsrithm)
     *
     * @param {String} url Full url to sign
     * @param {String} secret Secret (salt) to sign with
     * @param {String} options (optional) Object with optional parameters for the algorithm and digest method ( Defaults to 'sha1' and 'base64' )
     */
    signature: function(url, secret, options) {
        var u = Url.parse(url, true);

        options = options || {};

        u.search = _stringifySorted(u.query);

        return crypto.createHmac(options.algo || 'sha1', secret).update(u.format()).digest(options.digest || 'base64');
    },

    /**
     * Sign a url, and append the signature to the query string
     *
     * @param {String} url Full url to sign
     * @param {String} secret Secret (salt) to sign with
     * @param {String} options (optional) Object with optional parameters for the algorithm and digest method ( Defaults to 'sha1' and 'base64' )
     */
    url: function(url, secret, options) {
        var u = Url.parse(url, true),
            query = u.query;

        query.signature = Sign.signature(url, secret, options);
        u.search = Query.stringify(query);

        return u.format();
    },

    /**
     * Sign a url, and append the signature to the query string
     *
     * @param {String} url Full url to sign
     * @param {String} secret Secret (salt) to sign with
     * @param {String} options (optional) Object with optional parameters for the algorithm and digest method ( Defaults to 'sha1' and 'base64' )
     */
    check: function(url, secret, options) {
        var u = Url.parse(url, true),
            query = u.query,
            signature = query.signature;

        delete(query.signature);
        u.search = Query.stringify(query);

        return signature === Sign.signature(u.format(), secret, options);
    },

};

module.exports = Sign;
