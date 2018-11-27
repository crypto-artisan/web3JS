/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file EventSubscriptionsProxy.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import isFunction from 'underscore-es/isFunction';
import isUndefined from 'underscore-es/isUndefined';

export default class EventSubscriptionsProxy {
    /**
     * @param {AbstractContract} contract
     * @param {AbiModel} abiModel
     * @param {EventSubscriptionFactory} eventSubscriptionFactory
     * @param {EventOptionsMapper} eventOptionsMapper
     * @param {EventLogDecoder} eventLogDecoder
     * @param {AllEventsLogDecoder} allEventsLogDecoder
     * @param {AllEventsOptionsMapper} allEventsOptionsMapper
     * @param {PromiEvent} PromiEvent
     *
     * @constructor
     */
    constructor(
        contract,
        abiModel,
        eventSubscriptionFactory,
        eventOptionsMapper,
        eventLogDecoder,
        allEventsLogDecoder,
        allEventsOptionsMapper,
        PromiEvent
    ) {
        this.contract = contract;
        this.eventSubscriptionFactory = eventSubscriptionFactory;
        this.abiModel = abiModel;
        this.eventOptionsMapper = eventOptionsMapper;
        this.eventLogDecoder = eventLogDecoder;
        this.allEventsLogDecoder = allEventsLogDecoder;
        this.allEventsOptionsMapper = allEventsOptionsMapper;
        this.PromiEvent = PromiEvent;

        return new Proxy(this, {
            get: this.proxyHandler
        });
    }

    /**
     * Checks if a contract event exists by the given name and returns the subscription otherwise it throws an error
     *
     * @method proxyHandler
     *
     * @param {EventSubscriptionsProxy} target
     * @param {String} name
     *
     * @returns {Function|Error}
     */
    proxyHandler(target, name) {
        if (this.abiModel.hasEvent(name)) {
            return (options, callback) => {
                return target.subscribe(target.abiModel.getEvent(name), options, callback);
            };
        }

        if (name === 'allEvents') {
            return (options, callback) => {
                return target.subscribeAll(options, callback);
            };
        }

        if (target[name]) {
            return target[name];
        }

        throw new Error(`Event with name "${name}" not found`);
    }

    /**
     * Returns an subscription on the given event
     *
     * @param {AbiItemModel} abiItemModel
     * @param {Object} options
     * @param {Function} callback
     *
     * @returns {Subscription|PromiEvent}
     */
    subscribe(abiItemModel, options, callback) {
        if (!isUndefined(options.filters) && !isUndefined(options.topics)) {
            return this.handleValidationError(
                'Invalid subscription options: Only filter or topics are allowed and not both',
                callback
            );
        }

        return this.eventSubscriptionFactory
            .createEventLogSubscription(
                this.eventLogDecoder,
                abiItemModel,
                this.contract,
                this.eventOptionsMapper.map(abiItemModel, this.contract, options)
            )
            .subscribe(callback);
    }

    /**
     * Returns an subscription for all contract events
     *
     * @method subscribeAll
     *
     * @param {Object} options
     * @param {Function} callback
     *
     * @returns {Subscription|PromiEvent}
     */
    subscribeAll(options, callback) {
        if (!isUndefined(options.topics)) {
            return this.handleValidationError(
                'Invalid subscription options: Topics are not allowed for the "allEvents" subscription',
                callback
            );
        }

        return this.eventSubscriptionFactory
            .createAllEventLogSubscription(
                this.allEventsLogDecoder,
                this.contract,
                this.allEventsOptionsMapper.map(this.abiModel, this.contract, options)
            )
            .subscribe(callback);
    }

    /**
     * Creates an promiEvent and rejects it with an error
     *
     * @method handleValidationError
     *
     * @param {String} errorMessage
     * @param {Function} callback
     *
     * @callback callback callback(error, result)
     * @returns {PromiEvent}
     */
    handleValidationError(errorMessage, callback) {
        const promiEvent = new this.PromiEvent();

        const error = new Error(errorMessage);
        promiEvent.emit('error', error);

        if (isFunction(callback)) {
            callback(error, null);
        }

        return promiEvent;
    }
}
