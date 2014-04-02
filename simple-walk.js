/*
 * simple-walk
 *
 * Copyright (c) 2013 Alexandr Marinenko
 * Licensed under the MIT license.
 */
(function simpleWalkInit(module) {
    'use strict';

    var _ = require('underscore');
    var fs = require('fs');

    var obj = {
        match: function (path, matchRule) {
            var result = [];

            if (path.indexOf('**') >= 0) {
                var paths = path.split('**') || [];
                // TODO for all the cases not only === 2
                if (paths.length === 2) {
                    var list = fs.readdirSync(paths[0]) || [];
                    result = _.reduce(list, function (memo, item) {
                        var itemPath = paths[0] + item;
                        var itemStat = fs.statSync(itemPath);
                        if (itemStat.isDirectory()) {
                            memo = _.union(memo, obj.match(itemPath + paths[1], matchRule));
                        }
                        return memo;
                    }, []);
                }
            } else if (fs.existsSync(path)) {
                var stats = fs.statSync(path);
                if (stats.isFile()) {
                    var match = path.match(matchRule) || [];
                    if (match.length === 1) {
                        result.push(path);
                    }
                } else if (stats.isDirectory()) {
                    var list = fs.readdirSync(path) || [];
                    list.forEach(function (dir) {
                        result = _.union(result, obj.match(path + '/' + dir, matchRule));
                    });
                }
            }

            return result;
        }
    };

    module.exports = {
        match: function (path, matchRule) {
            return obj.match(path, matchRule);
        }
    };
})(module);