"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Users = {
    slug: 'users',
    auth: true,
    admin: {
        useAsTitle: 'email',
    },
    access: {
        read: function () { return true; },
    },
    fields: [
    // Email added by default
    // Add more fields as needed
    ],
};
exports.default = Users;
