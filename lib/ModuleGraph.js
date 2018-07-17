/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./Module")} Module */

class ModuleGraphConnection {
	/**
	 * @param {Module} originModule the referencing module
	 * @param {Dependency} dependency the referencing dependency
	 * @param {Module} module the referenced module
	 * @param {string=} explanation some extra detail
	 */
	constructor(originModule, dependency, module, explanation) {
		this.originModule = originModule;
		this.dependency = dependency;
		this.resolvedModule = module;
		this.module = module;
		this.explanation = explanation;
	}
}

class ModuleGraph {
	constructor() {
		/** @type {Map<Dependency, ModuleGraphConnection>} */
		this._dependencyMap = new Map();
		/** @type {Map<Module, Set<ModuleGraphConnection>>} */
		this._moduleMap = new Map();
		/** @type {Map<any, Object>} */
		this._metaMap = new Map();
	}

	_getModuleSet(module) {
		let connections = this._moduleMap.get(module);
		if (connections === undefined) {
			connections = new Set();
			this._moduleMap.set(module, connections);
		}
		return connections;
	}

	/**
	 * @param {Module} originModule the referencing module
	 * @param {Dependency} dependency the referencing dependency
	 * @param {Module} module the referenced module
	 */
	setResolvedModule(originModule, dependency, module) {
		const connection = new ModuleGraphConnection(originModule, dependency, module);
		this._dependencyMap.set(dependency, connection);
		const connections = this._getModuleSet(module);
		connections.add(connection);
	}

	updateModule(dependency, module) {
		const connection = this._dependencyMap.get(dependency);
		if(connection.module === module) return;
		const oldSet = this._moduleMap.get(connection.module);
		oldSet.delete(connection);
		connection.module = module;
		const newSet = this._moduleMap.get(module);
		newSet.add(connection);
	}

	addExtraReason(module, explanation) {
		const connections = this._getModuleSet(module);
		connections.add(new ModuleGraphConnection(null, null, module, explanation));
	}

	/**
	 * @param {Dependency} dependency the dependency to look for a referenced module
	 * @returns {Module} the referenced module
	 */
	getResolvedModule(dependency) {
		const connection = this._dependencyMap.get(dependency);
		return connection !== undefined ? connection.resolvedModule : null;
	}

	/**
	 * @param {Dependency} dependency the dependency to look for a referenced module
	 * @returns {Module} the referenced module
	 */
	getModule(dependency) {
		const connection = this._dependencyMap.get(dependency);
		return connection !== undefined ? connection.resolvedModule : null;
	}

	/**
	 * @param {Module} module the module
	 * @returns {ModuleGraphConnection[]} reasons why a module is included
	 */
	getReasons(module) {
		const connections = this._getModuleSet(module);
		return Array.from(connections);
	}

	/**
	 * @param {any} thing any thing
	 * @returns {Object} metadata
	 */
	getMeta(thing) {
		let meta = this._metaMap.get(thing);
		if(meta === undefined) {
			meta = Object.create(null);
			this._metaMap.set(thing, meta);
		}
		return meta;
	}
}

module.exports = ModuleGraph;
module.exports.ModuleGraphConnection = ModuleGraphConnection;
