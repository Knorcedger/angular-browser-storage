/**
 * An angular module that provides easy access to localStorage and sessionStorage
 *
 * @author Achilleas Tsoumitas
 * @version 1.1.0
 * @documentation https://github.com/Knorcedger/angular-browser-storage
 *
 */

(function() {

	'use strict';

	var browserStorage = angular.module('browserStorage', []);

	browserStorage.service('browserStorage', function($window) {

		var save = function(type, key, value, expiration) {
			var object = {
				data: value
			};
			if (expiration) {
				object.expiration = expiration && Math.round(new Date().getTime() / 1000) + expiration;
			}
			$window[type + 'Storage'].setObject(key, object);
		};

		var load = function(type, key) {
			var data = $window[type + 'Storage'].getObject(key) || null;
			if (data) {
				// if data was found, check if it has expired, or if no expiration exists
				if (data.expiration && data.expiration > Math.round(new Date().getTime() / 1000) || !data.expiration) {
					return data.data;
				} else {
					// if it has expired, remove it as well
					$window[type + 'Storage'].removeItem(key);
					return null;
				}
			} else {
				return null;
			}
		};

		var Storage = {
			local: {
				save: function(key, value, expiration) {
					return save('local', key, value, expiration);
				},
				load: function(key) {
					return load('local', key);
				},
				remove: function(key) {
					$window.localStorage.removeItem(key);
				},
				clear: function() {
					$window.localStorage.clear();
				}
			},
			session: {
				save: function(key, value, expiration) {
					return save('session', key, value, expiration);
				},
				load: function(key) {
					return load('session', key);
				},
				remove: function(key) {
					$window.sessionStorage.removeItem(key);
				},
				clear: function() {
					$window.sessionStorage.clear();
				}
			}
		};

		return Storage;

	});

	window.Storage.prototype.setObject = function(key, value) {
		this.setItem(key, JSON.stringify(value));
	};

	window.Storage.prototype.getObject = function(key) {
		var value = this.getItem(key);
		return value && JSON.parse(value);
	};
	
	/**
	 * A utility service that can be used to save variables either in a temp object (will be lost on refresh) 
	 * or on browser localStorage.
	 */
	browserStorage.service('store', function(browserStorage) {
		var store = {};
		return {
			set: function(key, value, browserStore) {
				store[key] = value;
				if (browserStore) {
					browserStorage.local.save(key, value);
				}
			},
			get: function(key) {
				if (store.hasOwnProperty(key)) {
					return store[key];
				} else {
					return browserStorage.local.load(key);
				}
			},
			remove: function(key) {
				delete store[key];
				browserStorage.local.remove(key);
			}
		};
	});

}(window));