'use strict'

const _ = require('lodash')

module.exports = {

  /**
   * Pick only mongo stores from app config
   * @param {Object} stores
   * @return {Object}
   */
  pickStores(stores) {
    return _.pickBy(stores, (store, name) => {
      if (store.orm) {
        return store.orm === 'mongoose';
      }
      return (_.isString(_store.uri) && _.startsWith(_store.uri, 'mongodb://'))
    });
  },

  /**
   * Transform model definition from `/api/model` to Mongoose models definition
   * @param {TrailsApp} app
   * @param {Array<String>} stores
   * @return {Object}
   */
  transformModels (app, stores) {
    const dbConfig = app.config.database
    let models = app.models
    if (stores) {
      models =  _.pickBy(app.models, (model, name) => {
        return Object.keys(stores).includes(model.store);
      });
    }
    return _.mapValues(models, (model, modelName) => {
      const config = model.constructor.config(app, require('mongoose')) || { }
      const schema = model.constructor.schema(app, require('mongoose')) || { }
      const onSchema = config.onSchema || _.noop

      return {
        identity: modelName.toLowerCase(),
        globalId: modelName,
        tableName: config.tableName || modelName.toLowerCase(),
        connection: config.store || dbConfig.models.defaultStore,
        migrate: config.migrate || dbConfig.models.migrate,
        schema: schema,
        schemaOptions: config.schema,
        statics: config.statics || {},
        methods: config.methods || {},
        onSchema: onSchema
      }

    })
  }

}
